// DetailScreen.js
// Bu ekran: Home'dan tıklanan filmin detaylarını (poster, puan, türler, overview)
// TMDB API'den çekip gösterir. Ayrıca "Favorite" (favori) toggle işlemini yapar.
// Favoriler bu örnekte AUTH'a (Firebase user) bağlı değil -> cihazın local storage'ında tutulur.

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Dimensions, Image, Linking, Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getMovieVideos } from "../services/tmdb";


// Uygulama genelinde "güvenli alan" (notch/status bar) + arkaplan rengi vb. standart layout
import ScreenContainer from "../components/ScreenContainer";

// Yükleniyor ekranı: ilk veri çekilirken gösterdiğin sarı loading ekranı (muhtemelen ActivityIndicator var)
import LoadingState from "../components/LoadingState";

// Hata / boş durum ekranı: "Retry" gibi aksiyon butonu olan component
import EmptyState from "../components/EmptyState";

// Senin özel Text component'in: variant (title/subtitle/body/caption) sistemine göre otomatik stil basar
import Text from "../components/Text";

// Poster resmi component'in: muhtemelen Image + borderRadius + placeholder gibi şeyler içeriyor
import PosterImage from "../components/PosterImage";

// Puan rozeti: "TMDB 7.7" gibi sarı badge basan component
import RatingBadge from "../components/RatingBadge";

// Senin custom Button component'in: primary/secondary/ghost varyantları var
import Button from "../components/Button";

// Theme: renkler, spacing, radius vs.
import theme from "../theme";

// TMDB servis fonksiyonu: movie detail endpoint çağırıp JSON döndürür
import { getMovieDetails,getMovieCredits, getMovieImages  } from "../services/tmdb";

// Poster path'i ("/abc.jpg") gerçek URL'ye çeviren yardımcı (TMDB image base URL + size)
import { buildPosterUrl, buildCastPhotoUrl, buildBackdropUrl } from "../constants/images";


import { useSafeAreaInsets } from "react-native-safe-area-context";




// FAVORI LOCAL STORAGE (ÖNEMLİ):
// Bu iki fonksiyon normalde AsyncStorage gibi bir local storage mekanizması kullanır.
// - checkFavorite(id): Bu film local favorites listesinde var mı?
// - toggleFavorite(movieObj): varsa çıkarır, yoksa ekler; geri "isFavorite" gibi bir sonuç döndürür.
// BU EKRANDA AUTH ENTEGRASYONU YOK: yani kullanıcı login olsa bile favoriler "kullanıcıya göre" değil,
// "bu cihazda" saklanır. Auth'a bağlamak istiyorsan bunu Firestore gibi bir yere userId ile yazman gerekir.
import { isFavorite as checkFavorite, toggleFavorite } from "../utils/favoritesStorage";

function pickBestTrailerKey(videos) {
  const list = videos?.results ?? [];
  const youtube = list.filter((v) => v.site === "YouTube" && v.key);

  const best =
    youtube.find((v) => v.type === "Trailer" && v.official) ||
    youtube.find((v) => v.type === "Trailer") ||
    youtube.find((v) => v.type === "Teaser") ||
    youtube[0];

  return best?.key ?? null;
}


export default function DetailScreen({ route, navigation }) {
  // -----------------------------
  // 1) Route parametresi: HomeScreen'den buraya navigate ederken id göndermiştin:
  //    navigation.navigate("Detail", { id: item.id, title: item.title })
  // route.params.id buradan gelir.
  // -----------------------------
  const movieId = route?.params?.id;

  // -----------------------------
  // 2) Ekranın state'leri
  // -----------------------------

  // movie: TMDB'den dönen detay objesi (title, genres, overview, poster_path, vote_average, release_date vs.)
  const [movie, setMovie] = useState(null);
  const insets = useSafeAreaInsets();
  const [trailerKey, setTrailerKey] = useState(null);
  const watchUrl = useMemo(() => {
    if (!trailerKey) return null;
    return `https://www.youtube.com/watch?v=${trailerKey}`;
  }, [trailerKey]);


  // loading: detay API çekilirken "LoadingState" göstermek için kontrol bayrağı
  const [loading, setLoading] = useState(true);

  // error: API patlarsa / id yoksa vb. durumda kullanıcıya göstereceğin mesaj
  const [error, setError] = useState(null);

  // favorite: bu film local favorites listesinde mi?
  const [favorite, setFavorite] = useState(false);

  // favoriteLoading: favori ekleme/çıkarma sırasında butonu disable etmek ve "yükleniyor" hissi vermek için
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const [cast, setCast] = useState([]);
  const [backdrops, setBackdrops] = useState([]);

  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  const openImageViewer = useCallback((idx) => {
    setImageIndex(idx);
    setImageViewerOpen(true);
  }, []);

  const closeImageViewer = useCallback(() => {
    setImageViewerOpen(false);
  }, []);



  // -----------------------------
  // 3) useMemo: genres yazısını hesaplamak
  // -----------------------------
  // Amaç: movie değişmedikçe bu string'i tekrar tekrar hesaplamamak.
  // Burada "dependency" = [movie] -> movie referansı değişirse yeniden hesaplanır.
  const genresText = useMemo(() => {
    // movie yoksa veya genres boşsa: ekranda anlamlı bir metin göster
    if (!movie?.genres?.length) return "No genres listed.";

    // movie.genres -> [{id:.., name:"Comedy"}, {name:"Drama"}]
    // map ile sadece name'leri al -> ["Comedy", "Drama"]
    // join ile tek string'e çevir -> "Comedy • Drama"
    return movie.genres.map((genre) => genre.name).join(" • ");
  }, [movie]);

  // -----------------------------
  // 4) loadDetails: TMDB'den film detayını çekme fonksiyonu
  // -----------------------------
  // useCallback: bu fonksiyonun referansı, movieId değişmedikçe sabit kalsın.
  // Neden önemli?
  // - useEffect([loadDetails]) içinde kullanıyoruz. loadDetails her render'da değişmesin ki
  //   useEffect gereksiz tetiklenmesin.
  const loadDetails = useCallback(async () => {
  if (!movieId) {
    setError("Missing movie id.");
    setLoading(false);
    return;
  }

  setLoading(true);
  setError(null);

  try {
    // ✅ Buraya videos'u da ekledik
    const [details, credits, images, videos] = await Promise.all([
      getMovieDetails(movieId),
      getMovieCredits(movieId),
      getMovieImages(movieId),
      getMovieVideos(movieId), // ✅ trailer listesi burada geliyor
    ]);

    setMovie(details);

    // credits.cast -> oyuncular
    setCast(credits?.cast ?? []);

    // images.backdrops -> film görselleri
    setBackdrops((images?.backdrops ?? []).slice(0, 12));

    // ✅ videos.results içinden en iyi YouTube trailer key seç
    setTrailerKey(pickBestTrailerKey(videos));
  } catch (err) {
    setError(err?.message || "Failed to load movie details.");
  } finally {
    setLoading(false);
  }
}, [movieId]);



  // -----------------------------
  // 5) Ekran ilk açıldığında (ve movieId değişince) detayları yükle
  // -----------------------------
  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  // -----------------------------
  // 6) Movie geldiğinde local storage'dan "favori mi?" bilgisini çek
  // -----------------------------
  // Burada kritik amaç:
  // - Detay ekranını açtın -> film geldi -> "Add Favorite" mı "Remove Favorite" mı gözüksün?
  //
  // "active" bayrağı:
  // - async iş bitmeden kullanıcı bu ekrandan çıkarsa (unmount olursa)
  // - setState çağırmak uyarı verebilir.
  // - active=false yaparak "artık state set etme" diyoruz.
  useEffect(() => {
    let active = true;

    async function loadFavorite() {
      // movie daha yoksa kontrol etmeye gerek yok
      if (!movie?.id) return;

      // favori durumunu sorgularken buton/işlem alanını kilitlemek için loading
      setFavoriteLoading(true);

      try {
        // Local storage sorgusu:
        // checkFavorite(movie.id) -> true/false döndürür
        const value = await checkFavorite(movie.id);

        // ekran hâlâ aktifse state set et (unmount olduysa set etme)
        if (active) setFavorite(value);
      } finally {
        // hata olsa bile loading kapansın
        if (active) setFavoriteLoading(false);
      }
    }

    loadFavorite();

    // cleanup: ekran kapanırken active=false yap
    return () => {
      active = false;
    };
  }, [movie]);

  // -----------------------------
  // 7) Favori ekle/çıkar işlemi (toggle)
  // -----------------------------
  // Kullanıcı "Add Favorite" butonuna basınca çalışır.
  // Local storage'a yazma işlemi burada.
  const handleToggleFavorite = useCallback(async () => {
    if (!movie) return; // güvenlik

    // Butonu disable etmek + kullanıcıya "işlem oluyor" hissi için
    setFavoriteLoading(true);

    try {
      // toggleFavorite: local storage'daki favorites listesinde bu film varsa çıkarır, yoksa ekler.
      // Buraya movie objesinin gerekli alanlarını gönderiyoruz.
      // (storage'a gereksiz dev JSON basmak istemiyoruz)
      const result = await toggleFavorite({
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        vote_average: movie.vote_average,
        overview: movie.overview,
        release_date: movie.release_date,
      });

      // toggleFavorite genelde şöyle bir şey döndürür:
      // { isFavorite: true }  veya { isFavorite: false }
      setFavorite(result.isFavorite);
    } finally {
      // işlem bitti
      setFavoriteLoading(false);
    }
  }, [movie]);

  

  // -----------------------------
  // 8) Ekran durumları: loading / error / movie yok
  // -----------------------------
  if (loading) {
    // loading true iken normal UI yerine LoadingState göster
    return (
      <ScreenContainer>
        <LoadingState title="Loading details..." subtitle="Fetching movie information" />
      </ScreenContainer>
    );
  }

  if (error) {
    // hata varsa EmptyState ve Retry butonu göster
    return (
      <ScreenContainer>
        <EmptyState
          title="Unable to load"
          subtitle={error}
          actionLabel="Retry"
          onAction={loadDetails}
        />
      </ScreenContainer>
    );
  }

  if (!movie) {
    // Teorik olarak: loading false ama movie null kalmış olabilir (beklenmeyen durum)
    return (
      <ScreenContainer>
        <EmptyState title="Movie not found" subtitle="Try another title." />
      </ScreenContainer>
    );
  }
  

  // -----------------------------
  // 9) Normal UI (başarılı durumda)
  // -----------------------------
  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
       
        <View style={styles.posterWrap}>
          <PosterImage
            uri={buildPosterUrl(movie.poster_path)}
            height={360}
            width={260}
            style={styles.poster}
          />
          {watchUrl ? (
            <Pressable
              style={({ pressed }) => [
                styles.trailerButton,
                pressed && styles.trailerButtonPressed,
              ]}
              onPress={() => Linking.openURL(watchUrl)}
            >
              <Ionicons name="play" size={20} color={theme.colors.background} />
            </Pressable>
          ) : null}
        </View>

        <View style={styles.headerRow}>
          <Text variant="title" style={styles.title} numberOfLines={2}>
            {movie.title}
          </Text>

          <RatingBadge value={movie.vote_average} />
        </View>

        <Text variant="caption" style={styles.meta}>
          {movie.release_date || "Release date unknown"}
        </Text>

        <Text variant="caption" style={styles.meta}>
          {genresText}
        </Text>

        <Text variant="subtitle" style={styles.sectionTitle}>
          Overview
        </Text>

        <Text variant="body" style={styles.overview}>
          {movie.overview || "No overview available for this movie."}
        </Text>
        <Text variant="subtitle" style={styles.sectionTitle}>Cast</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
          {cast.slice(0, 15).map((p) => (
            <View key={String(p.id)} style={styles.castItem}>
              <PosterImage
                uri={buildCastPhotoUrl(p.profile_path)}   
                width={80}
                height={110}
                style={styles.castImg}
              />
              <Text variant="caption" numberOfLines={1}>{p.name}</Text>
              <Text variant="caption" numberOfLines={1} style={styles.meta}>
                {p.character || ""}
              </Text>
            </View>
          ))}
        </ScrollView>

        <Text variant="subtitle" style={styles.sectionTitle}>Images</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hList}
        >
          {backdrops.map((img, idx) => (
            <Pressable key={img.file_path} onPress={() => openImageViewer(idx)}>
              <PosterImage
                uri={buildBackdropUrl(img.file_path)}
                width={260}
                height={146}
                style={styles.backdropImg}
              />
            </Pressable>
          ))}
        </ScrollView>

        



        <View style={styles.actions}>
          <Button
            // favorite state'ine göre yazı değişiyor
            title={favorite ? "Remove Favorite" : "Add Favorite"}

            // favorite ise secondary, değilse primary (sarı vurgun gibi)
            variant={favorite ? "secondary" : "primary"}

            // butona basılınca local storage toggle yapılır
            onPress={handleToggleFavorite}

            // favori kontrolü/işlemi sürerken butonu kilitle
            disabled={favoriteLoading}
          />

          <View style={styles.spacer} />

          <Button
            title="Back"
            variant="ghost"
            // navigation.goBack(): önceki ekrana döner (Stack navigation)
            onPress={() => navigation.goBack()}
          />
        </View>
      </ScrollView>
          <Modal
              visible={imageViewerOpen}
              animationType="fade"
              transparent
              onRequestClose={closeImageViewer}
            >
              <View
                style={[
                  styles.viewerRoot,
                  {
                 
                    paddingTop: insets.top + theme.spacing.md,
                    paddingLeft: theme.spacing.lg,
                    paddingRight: theme.spacing.lg,
                    paddingBottom: insets.bottom + theme.spacing.lg,
                  },
                ]}
              >
                <View style={styles.viewerTopBar}>
                  <Button title="Close" variant="ghost" onPress={closeImageViewer} />
                  <Text variant="caption" style={styles.viewerIndexText}>
                    {imageIndex + 1} / {backdrops.length}
                  </Text>
                </View>

                <ImageCarousel
                  images={backdrops}
                  startIndex={imageIndex}
                  onIndexChange={setImageIndex}
                />
              </View>
            </Modal>

    </ScreenContainer>
  );
}

// -----------------------------
// 10) Stiller
// -----------------------------
const styles = StyleSheet.create({
  container: {
    // tüm içerik kenarlardan boşluklu olsun
    padding: theme.spacing.lg,

    // elemanlar arasında dikey boşluk
    gap: theme.spacing.md,
  },

  poster: {
    // posteri yatayda ortala
    alignSelf: "center",
  },
  posterWrap: {
    alignSelf: "center",
    position: "relative",
  },
      viewerRoot: {
      flex: 1,
      backgroundColor: theme.colors.background, // ✅ modal arka plan
    },

  headerRow: {
    // title ve rating aynı satır
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: theme.spacing.md,
  },

  title: {
    // title uzun olursa rating'i itmesin diye flex veriyoruz
    flex: 1,
  },

  meta: {
    // meta yazıları daha soluk
    color: theme.colors.textSecondary,
  },

  sectionTitle: {
    // overview başlığı üstte biraz boşluk alsın
    marginTop: theme.spacing.md,
  },

  overview: {
    color: theme.colors.textSecondary,
    lineHeight: 22, // okunabilirlik
  },
  modalOverlay: {
  flex: 1,
  backgroundColor: "#000", // ✅ etraf siyah
},

  actions: {
    marginTop: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  trailerButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(245, 197, 24, 0.75)",
    borderRadius: 20,
    width: 40,
    height: 40,
    position: "absolute",
    top: theme.spacing.sm,
    left: theme.spacing.sm,
  },
  trailerButtonPressed: {
    opacity: 0.8,
  },

  spacer: {
    height: theme.spacing.xs,
  },
  hList: {
  gap: theme.spacing.md,
  paddingVertical: theme.spacing.xs,
},
castItem: {
  width: 90,
  gap: theme.spacing.xs,
},
castImg: {
  borderRadius: theme.radius.md,
  overflow: "hidden",
},
backdropImg: {
  borderRadius: theme.radius.lg,
  overflow: "hidden",
},
viewerRoot: {
  flex: 1,
  backgroundColor: "#000", // ✅ içerisi de siyah
  paddingLeft: theme.spacing.lg,
  paddingRight: theme.spacing.lg,
  paddingBottom: theme.spacing.lg,
},

viewerTopBar: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: theme.spacing.md,
},

viewerIndexText: {
  color: theme.colors.textSecondary,
},

});
function ImageCarousel({ images, startIndex = 0, onIndexChange }) {
  const { width, height } = Dimensions.get("window");

  return (
    <ScrollView
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      contentOffset={{ x: startIndex * width, y: 0 }}
      onMomentumScrollEnd={(e) => {
        const idx = Math.round(e.nativeEvent.contentOffset.x / width);
        onIndexChange?.(idx);
      }}
    >
      {images.map((img) => (
        <View
          key={img.file_path}
          style={{ width, height: height * 0.8, justifyContent: "center" }}
        >
          <Image
            source={{ uri: buildBackdropUrl(img.file_path, "original") }}
            style={{ width, height: "100%" }}
            resizeMode="contain"
          />
        </View>
      ))}
    </ScrollView>
  );
}

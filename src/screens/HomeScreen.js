// React kütüphanesinden hook'ları alıyoruz: state, effect, performans optimizasyonu ve callback sabitleme için.
import React, { useCallback, useEffect, useMemo, useState } from "react";

// React Native UI parçaları: View (kutu), FlatList (liste), Pressable (tıklanabilir alan), StyleSheet (stil), Image (resim - bu dosyada kullanılmıyor).
import { View, FlatList, Pressable, StyleSheet, Image ,RefreshControl} from "react-native";

// Ekranın güvenli alanlarını (notch vs.) ve arka planını yöneten ortak container (Home ekranının siyah zeminini/kenar boşluklarını sağlar).
import ScreenContainer from "../components/ScreenContainer";

// Loading durumunda görünen “Loading movies...” ekran bileşeni (Home ekranı daha açılmadan gösterilir).
import LoadingState from "../components/LoadingState";

// Hata/boş durum ekranı bileşeni (ör: “Retry” butonlu hata ekranı).
import EmptyState from "../components/EmptyState";

// Projedeki özel Text bileşeni (variant: title/subtitle/caption gibi; ekrandaki tüm yazılar bununla basılıyor).
import Text from "../components/Text";

// Kart görünümü veren bileşen (Popular Movies bölümündeki büyük gri kart).
import Card from "../components/Card";

// Poster resmini düzgün oran/placeholder ile basan bileşen (hem Trending kartlarında hem Popular kartlarında posterleri çiziyor).
import PosterImage from "../components/PosterImage";

// Sarı “TMDB 7.4” gibi puan rozetini/pill’ini çizen bileşen (ekrandaki sarı etiketler).
import RatingBadge from "../components/RatingBadge";

// “Load More” gibi buton bileşeni (listenin en altındaki buton).
import Button from "../components/Button";

// Tema: renkler (siyah arka plan, gri yazı), spacing (padding/gap) gibi değerler.
import theme from "../theme";

// TMDB servis fonksiyonları: Trending ve Popular filmleri API’dan çekmek için.
import { getTrendingMovies, getPopularMovies } from "../services/tmdb";

// Poster path’ini tam görsel URL’sine çevirmek için helper (TMDB poster linki).
import { buildPosterUrl } from "../constants/images";




// Trending yatay listede görünen “küçük poster kartı” bileşeni (ekrandaki üstteki 3 posterin her biri).
function MoviePosterCard({ item, onPress }) {
  // Bu bileşen, bir filmi tıklanabilir bir kart olarak çizer.
  return (
    // Pressable: Kullanıcı postere tıklayınca detay ekranına gidebilmek için.
    <Pressable onPress={() => onPress(item)} style={styles.posterCard}>
      {/* Poster görseli: Trending bölümündeki büyük poster görüntüsü (120x180). */}
      <PosterImage uri={buildPosterUrl(item.poster_path)} width={120} height={180} />

      {/* Poster altındaki film adı (2 satırla sınırlı). */}
      <Text variant="caption" style={styles.posterTitle} numberOfLines={2}>
        {/* TMDB’den gelen film başlığı ekrana basılır. */}
        {item.title}
      </Text>

      {/* Sarı TMDB puan rozeti (ekrandaki “TMDB 7.4” gibi). */}
      <RatingBadge value={item.vote_average} style={styles.posterBadge} />
    </Pressable>
  );
}


// Popular Movies dikey listesinde görünen “satır kartı” bileşeni (ekrandaki Predator: Badlands gibi).
function MovieListItem({ item, onPress }) {
  // Bu bileşen popüler filmleri büyük yatay kart şeklinde çizer.
  return (
    // Kartın tamamı tıklanabilir olsun diye Pressable ile sarıyoruz.
    <Pressable onPress={() => onPress(item)}>
      {/* Card: arka planı koyu-gri, köşeleri yuvarlak büyük kart görünümü verir (ekrandaki büyük blok). */}
      <Card style={styles.listCard}>
        {/* Soldaki küçük poster (90x130). */}
        <PosterImage uri={buildPosterUrl(item.poster_path)} width={90} height={130} />

        {/* Sağ taraftaki metin alanı (başlık, overview, puan). */}
        <View style={styles.listContent}>
          {/* Film adı (2 satır). */}
          <Text variant="subtitle" numberOfLines={2}>
            {/* Popüler filmin başlığı. */}
            {item.title}
          </Text>

          {/* Film açıklaması/overview (3 satır). */}
          <Text variant="caption" numberOfLines={3} style={styles.listOverview}>
            {/* Eğer overview yoksa yerine “No overview available.” yaz. */}
            {item.overview || "No overview available."}
          </Text>

          {/* Sarı TMDB puanı (kart içinde). */}
          <RatingBadge value={item.vote_average} />
        </View>
      </Card>
    </Pressable>
  );
}


// Home ekranının ana bileşeni (ekrandaki tüm içerik: Trending + Popular listesi).
export default function HomeScreen({ navigation }) {
  // Trending listesi state’i: üstteki yatay posterler buradan gelir.
  const [trending, setTrending] = useState([]);

  // Popular listesi state’i: alttaki dikey kartlar buradan gelir.
  const [popular, setPopular] = useState([]);

  // İlk açılış yükleniyor durumu: true iken LoadingState ekranı görünür.
  const [loading, setLoading] = useState(true);

  // Pull-to-refresh sırasında true olur: kullanıcı aşağı çekince spinner çıkar.
  const [refreshing, setRefreshing] = useState(false);

  // Hata mesajı: doluysa EmptyState hata ekranı görünür.
  const [error, setError] = useState(null);

  // Popular pagination: şu an kaçıncı sayfadayız (Load More / infinite scroll için).
  const [popularPage, setPopularPage] = useState(1);

  // Popular toplam sayfa sayısı: son sayfaya geldiysek daha fazla yüklemeyi durdurmak için.
  const [popularTotalPages, setPopularTotalPages] = useState(1);

  // “Load More” basılınca / scroll ile load more tetiklenince tekrar tekrar çağrılmasın diye kilit.
  const [loadingMore, setLoadingMore] = useState(false);

  // Bir filme tıklanınca Detail ekranına gitmek için callback (MoviePosterCard & MovieListItem bunu kullanır).
  const openDetail = useCallback(
    // navigation.navigate ile “Detail” route’una id ve title gönderiyoruz.
    (item) => navigation.navigate("Detail", { id: item.id, title: item.title }),
    // navigation değişmezse fonksiyon aynı kalsın (performans).
    [navigation]
  );

  // Trending filmleri TMDB’den çekip state’e yazan fonksiyon.
  const loadTrending = useCallback(async () => {
    // TMDB “trending/day” gibi endpoint: 1. sayfa.
    const data = await getTrendingMovies("day", 1);

    // Gelen results listesini trending state’ine bas; yoksa boş dizi.
    setTrending(data?.results ?? []);
  }, []);

  // Popular filmleri sayfa sayfa çeken fonksiyon (append=true ise listeye ekler).
  const loadPopular = useCallback(async (page = 1, append = false) => {
    // TMDB popular endpoint’inden istenen sayfayı çek.
    const data = await getPopularMovies(page);

    // Sonuç listesi (yoksa boş).
    const results = data?.results ?? [];

    // append true ise eski liste + yeni liste; değilse direkt yeni liste (ilk yükleme/refresh).
    setPopular((prev) => (append ? [...prev, ...results] : results));

    // API’dan dönen page’i state’e yaz (yoksa parametre page).
    setPopularPage(data?.page ?? page);

    // Toplam sayfa sayısını yaz (yoksa 1).
    setPopularTotalPages(data?.total_pages ?? 1);
  }, []);

  // Hem trending hem popular’ı birlikte yükleyen “ana yükleme” fonksiyonu.
  const loadAll = useCallback(async ({ silent = false } = {}) => {
    // silent değilse tam ekran loading göster (ilk açılışta).
    if (!silent) setLoading(true);

    // Yeni yüklemede eski hatayı temizle.
    setError(null);

    try {
      // Trending ve Popular aynı anda çekilsin (hızlı olsun).
      await Promise.all([loadTrending(), loadPopular(1, false)]);
    } catch (err) {
      // Hata olursa mesajı yaz ve error ekranını tetikle.
      setError(err?.message || "Failed to load movies.");
    } finally {
      // silent değilse loading kapat.
      if (!silent) setLoading(false);
    }
  }, [loadTrending, loadPopular]);

  // HomeScreen ilk kez açıldığında API çağrılarını başlatır (ekrandaki listeler dolsun diye).
  useEffect(() => {
    // İlk yükleme: Trending + Popular çek.
    loadAll();
  }, [loadAll]);

  // Kullanıcı aşağı çekince (pull-to-refresh) çalışır.
  const handleRefresh = useCallback(async () => {
    // Refresh spinner’ını aç.
    setRefreshing(true);

    const start = Date.now();

    // silent=true: tam ekran loading yerine sadece refresh mantığı.
    await loadAll({ silent: true });

    // iOS'ta renk sadece "refreshing" state'i aktifken görünür.
    // Çok hızlı bitiyorsa gri gibi görünebilir, bu yüzden minimum görünür süre.
    const elapsed = Date.now() - start;
    const minDurationMs = 500;
    if (elapsed < minDurationMs) {
      await new Promise((resolve) => setTimeout(resolve, minDurationMs - elapsed));
    }

    // Refresh spinner’ını kapat.
    setRefreshing(false);
  }, [loadAll]);

  // “Load More” veya listenin sonuna gelince yeni sayfa çekme fonksiyonu.
  const handleLoadMore = useCallback(async () => {
    // Zaten yükleme yapılıyorsa tekrar tetiklenmesin.
    if (loadingMore) return;

    // Son sayfadaysak daha fazla yükleme yapma.
    if (popularPage >= popularTotalPages) return;

    // Load more kilidini aç.
    setLoadingMore(true);

    try {
      // Bir sonraki sayfayı çek ve append=true ile listeye ekle.
      await loadPopular(popularPage + 1, true);
    } catch (err) {
      // Hata olursa ekrana hata bas.
      setError(err?.message || "Failed to load more movies.");
    } finally {
      // Load more kilidini kapat.
      setLoadingMore(false);
    }
  }, [loadingMore, popularPage, popularTotalPages, loadPopular]);

  // Ana listenin (Popular FlatList) üstünde görünen header alanı: Trending başlığı + yatay list + Popular başlığı.
  const listHeader = useMemo(() => {
    // Header render’ını stabilize eder: trending veya openDetail değişmedikçe yeniden oluşturmaz.
    return (
      // Trending bölümü: başlıklar + yatay liste + Popular başlığı.
      <View style={styles.section}>
        {/* Trending header: “Trending Today” + “Top picks from TMDB” */}
        <View style={styles.sectionHeader}>
          {/* Ekranda gördüğün büyük başlık. */}
          <Text variant="title">Trending Today</Text>

          {/* Başlığın altındaki küçük açıklama. */}
          <Text variant="caption">Top picks from TMDB</Text>
        </View>

        {/* Trending yatay poster listesi (ekrandaki yan yana posterler). */}
        <FlatList
          // Data kaynağı: trending state’i (TMDB’den geldi).
          data={trending}

          // Yatay kaydırma.
          horizontal

          // Her item’ın benzersiz key’i (id).
          keyExtractor={(item) => String(item.id)}

          // Poster kartları arası boşluk ve padding.
          contentContainerStyle={styles.horizontalList}

          // Alttaki yatay scrollbar’ı gizle (ekran daha temiz).
          showsHorizontalScrollIndicator={false}

          // Her trending item nasıl çizilecek? MoviePosterCard.
          renderItem={({ item }) => <MoviePosterCard item={item} onPress={openDetail} />}

          // Trending boşsa, yatay listede küçük “No trending movies yet.” yazısı göster.
          ListEmptyComponent={
            <Text variant="caption" style={styles.emptyInline}>
              No trending movies yet.
            </Text>
          }
        />

        {/* Popular bölüm başlığı (ekrandaki “Popular Movies”). */}
        <View style={styles.sectionHeader}>
          {/* Büyük başlık. */}
          <Text variant="title">Popular Movies</Text>

          {/* Alt açıklama: “Scroll to load more” */}
          <Text variant="caption">Scroll to load more</Text>
        </View>
      </View>
    );
  }, [trending, openDetail]);

  // Eğer ilk yükleme devam ediyorsa: ekranda LoadingState görünür (liste yerine).
  if (loading) {
    // Loading ekranını ScreenContainer içinde döndür.
    return (
      <ScreenContainer>
        {/* Ekranda “Loading movies...” ve alt açıklaması çıkar. */}
        <LoadingState title="Loading movies..." subtitle="Fetching the latest lists" />
      </ScreenContainer>
    );
  }

  // Eğer hata varsa: ekranda EmptyState hata UI’ı görünür (Retry butonlu).
  if (error) {
    // Hata ekranını ScreenContainer içinde döndür.
    return (
      <ScreenContainer>
        {/* “Something went wrong” + hata metni + Retry butonu. */}
        <EmptyState
          title="Something went wrong"
          subtitle={error}
          actionLabel="Retry"
          onAction={loadAll}
        />
      </ScreenContainer>
    );
  }

  // Eğer hem trending hem popular boşsa: boş durum ekranı.
  if (trending.length === 0 && popular.length === 0) {
    // Boş ekranı döndür.
    return (
      <ScreenContainer>
        {/* “No movies yet” + Retry butonu. */}
        <EmptyState title="No movies yet" subtitle="Try again later." actionLabel="Retry" onAction={loadAll} />
      </ScreenContainer>
    );
  }

  // Normal durumda: Home ekranının ana listesi (Popular FlatList) + header’da Trending bölümü.
  return (
    // Tüm ekranı saran container (safe area + arka plan).
    <ScreenContainer>
  {/* Dikey ana liste: Popular Movies listesi */}
    <FlatList
    refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={handleRefresh}
      tintColor="#FF0000"    // iOS için KIRMIZI (Test için)
      colors={["#FF0000"]}   // Android için KIRMIZI
      title="Yükleniyor..."  // Yazı da görünsün
      titleColor="#FF0000"   // Yazı da KIRMIZI
    />
  }
      data={popular}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={styles.container}
      renderItem={({ item }) => <MovieListItem item={item} onPress={openDetail} />}
      ListHeaderComponent={listHeader}
      ListFooterComponent={
        popularPage < popularTotalPages ? (
          <View style={styles.footer}>
            <Button
              title={loadingMore ? "Loading..." : "Load More"}
              onPress={handleLoadMore}
            />
          </View>
        ) : null
      }
      
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      showsVerticalScrollIndicator={false}
    />
  </ScreenContainer>

  );
}


// Stil tanımları: ekrandaki boşluklar, renkler, kart ölçüleri buradan geliyor.
const styles = StyleSheet.create({
  // Ana dikey listenin iç padding’i (ekrandaki sağ-sol boşluk).
  container: {
    // Dış padding.
    padding: theme.spacing.lg,
    // Alt tarafta ekstra boşluk (tab bar üstünde sıkışmasın).
    paddingBottom: theme.spacing.xxl,
    // Kartlar arası boşluk.
    gap: theme.spacing.lg,
  },

  // Header bölümleri arasında boşluk (Trending alanı).
  section: {
    // Başlık, yatay liste ve diğer başlık arası boşluk.
    gap: theme.spacing.md,
  },

  // Başlık + alt açıklama arası boşluk (Trending Today / Top picks... gibi).
  sectionHeader: {
    // Yazılar arası küçük boşluk.
    gap: 5,
  },

  // // Logo stili (AMA bu dosyada kullanılmıyor; muhtemelen navigator header’da kullanılıyor).
  // logo: {
  //   // Logo genişliği.
  //   width: 200,
  //   // Logo yüksekliği.
  //   height: 72,
  //   // Görseli orantılı sığdır.
  //   resizeMode: "contain",
  // },

  // Trending yatay listenin içerik stili: kartlar arası boşluk + üst-alt padding.
  horizontalList: {
    // Poster kartları arası boşluk.
    gap: theme.spacing.md,
    // Yatay listede üst-alt biraz nefes payı.
    paddingVertical: theme.spacing.xs,
  },

  // Trending’deki tek poster kartının genişliği ve iç boşluğu.
  posterCard: {
    // PosterImage width=120 olduğu için kartı 120 yapıyoruz (ekrandaki poster genişliği).
    width: 120,
    // Poster - başlık - badge arası boşluk.
    gap: theme.spacing.xs,
  },

  // Trending poster altındaki film adının rengi (daha soluk gri).
  posterTitle: {
    // İkincil metin rengi.
    color: theme.colors.textSecondary,
  },

  // Trending puan rozetinin hizası (solda başlasın).
  posterBadge: {
    // Rozeti solda tut (ekrandaki gibi).
    alignSelf: "flex-start",
  },

  // Popular kart: poster solda, metin sağda yatay dizilim.
  listCard: {
    // Yatay diz.
    flexDirection: "row",
    // Poster ve metin arası boşluk.
    gap: theme.spacing.md,
  },

  // Popular kartın sağ tarafındaki içerik: başlık, overview, badge.
  listContent: {
    // Sağ içerik alanı kalan alanı kaplasın.
    flex: 1,
    // Satırlar arası boşluk.
    gap: theme.spacing.xs,
  },

  // Overview metninin rengi (soluk).
  listOverview: {
    // İkincil metin rengi.
    color: theme.colors.textSecondary,
  },

  // Listenin altındaki footer alanı (Load More butonu etrafı).
  footer: {
    // Dikey padding.
    paddingVertical: theme.spacing.md,
  },

  // Trending boşsa çıkan “No trending movies yet.” metninin rengi.
  emptyInline: {
    // Daha da soluk bir renk.
    color: theme.colors.textMuted,
  },
});

import React, { useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Dimensions, FlatList, Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import ScreenContainer from "../components/ScreenContainer";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import Text from "../components/Text";
import Card from "../components/Card";
import PosterImage from "../components/PosterImage";
import Button from "../components/Button";
import RatingBadge from "../components/RatingBadge";
import SearchInput from "../components/SearchInput";
import theme from "../theme";
import { buildCastPhotoUrl, buildPosterUrl } from "../constants/images";
import { AuthContext } from "../firebase/AuthContext";
import {
  getPersonDetails,
  getPersonImages,
  getPersonMovieCredits,
  getMovieExternalIds,
  searchPeople,
} from "../services/tmdb";
import { isFavoritePerson, toggleFavoritePerson } from "../utils/favoritePeopleStorage";

function PersonFilmographyItem({ item, onPress, imdbId }) {
  return (
    <Pressable onPress={() => onPress(item)}>
      <Card style={styles.filmCard}>
        <PosterImage uri={buildPosterUrl(item.poster_path)} width={80} height={120} />
        <View style={styles.filmCardContent}>
          <Text variant="subtitle" numberOfLines={2}>
            {item.title}
          </Text>
          <Text variant="caption" numberOfLines={1} style={styles.metaText}>
            {item.character ? `as ${item.character}` : "Character unknown"}
          </Text>
          <Text variant="caption" numberOfLines={1} style={styles.metaText}>
            {item.release_date || "Release date unknown"}
          </Text>
          <View style={styles.ratingRow}>
            <RatingBadge value={item.vote_average} />
            
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

export default function PersonScreen({ route, navigation }) {
  const { user, loading: authLoading } = useContext(AuthContext);
  const userUid = user?.uid;
  const personId = route?.params?.personId;
  const personName = route?.params?.name;

  const [person, setPerson] = useState(null);
  const [credits, setCredits] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bioExpanded, setBioExpanded] = useState(false);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const insets = useSafeAreaInsets();
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const listRef = useRef(null);
  const scrollYRef = useRef(0);
  const savedScrollYRef = useRef(0);
  const imdbCacheRef = useRef({});
  const [imdbMap, setImdbMap] = useState({});

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [peopleResults, setPeopleResults] = useState([]);
  const [peopleLoading, setPeopleLoading] = useState(false);
  const [peopleError, setPeopleError] = useState(null);
  const handleQueryChange = useCallback((text) => {
    setQuery(text);
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({ title: personName || person?.name || "Person" });
  }, [navigation, personName, person?.name]);

  const handleTogglePersonFavorite = useCallback(async (e) => {
    e?.stopPropagation?.();
    if (authLoading || favoriteLoading || !person) return;
    setFavoriteLoading(true);
    try {
      const result = await toggleFavoritePerson(userUid, {
        id: person.id,
        name: person.name,
        profile_path: person.profile_path,
        known_for_department: person.known_for_department,
        place_of_birth: person.place_of_birth,
      });
      setIsFavorite(result.isFavorite);
    } finally {
      setFavoriteLoading(false);
    }
  }, [authLoading, favoriteLoading, person, userUid]);

  const handleGoFavoritePeople = useCallback((e) => {
    e?.stopPropagation?.();
    navigation.navigate("FavoritePeople");
  }, [navigation]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerIconRow}>
          <Pressable
            onPress={handleTogglePersonFavorite}
            disabled={authLoading || favoriteLoading || !person}
            hitSlop={16}
            style={({ pressed }) => [
              styles.headerIconButton,
              pressed && styles.headerIconButtonPressed,
              (authLoading || favoriteLoading || !person) && styles.headerIconButtonDisabled,
            ]}
          >
            {favoriteLoading ? (
              <ActivityIndicator size="small" color={theme.colors.accent} />
            ) : (
              <Ionicons
                name={isFavorite ? "bookmark" : "bookmark-outline"}
                size={22}
                color={isFavorite ? theme.colors.accent : theme.colors.textSecondary}
              />
            )}
          </Pressable>
          <Pressable
            onPress={handleGoFavoritePeople}
            hitSlop={16}
            style={({ pressed }) => [
              styles.headerIconButton,
              pressed && styles.headerIconButtonPressed,
            ]}
          >
            <Ionicons
              name="heart"
              size={22}
              color={theme.colors.accent}
            />
          </Pressable>
        </View>
      ),
    });
  }, [navigation, authLoading, favoriteLoading, isFavorite, handleTogglePersonFavorite, handleGoFavoritePeople, person]);

  const loadPerson = useCallback(async () => {
    if (!personId) {
      setError("Missing person id.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [details, movieCredits, personImages] = await Promise.all([
        getPersonDetails(personId),
        getPersonMovieCredits(personId),
        getPersonImages(personId),
      ]);

      setPerson(details);
      setCredits(movieCredits?.cast ?? []);
      setImages(personImages?.profiles ?? []);
    } catch (err) {
      setError(err?.message || "Failed to load person.");
    } finally {
      setLoading(false);
    }
  }, [personId]);

  useEffect(() => {
    loadPerson();
  }, [loadPerson]);

  useEffect(() => {
    let active = true;

    async function loadFavorite() {
      if (authLoading || !personId) return;
      const value = await isFavoritePerson(userUid, personId);
      if (active) setIsFavorite(value);
    }

    loadFavorite();
    return () => {
      active = false;
    };
  }, [authLoading, personId, userUid]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    let active = true;

    async function runSearch() {
      if (!debouncedQuery) {
        if (active) {
          setPeopleResults([]);
          setPeopleError(null);
          setPeopleLoading(false);
        }
        return;
      }

      setPeopleLoading(true);
      setPeopleError(null);
      try {
        const data = await searchPeople(debouncedQuery, 1);
        if (active) setPeopleResults(data?.results ?? []);
      } catch (err) {
        if (active) setPeopleError(err?.message || "Search failed.");
      } finally {
        if (active) setPeopleLoading(false);
      }
    }

    runSearch();
    return () => {
      active = false;
    };
  }, [debouncedQuery]);

  const knownAs = useMemo(() => person?.also_known_as ?? [], [person?.also_known_as]);

  const filmography = useMemo(() => {
    const list = credits ?? [];
    return [...list].sort((a, b) => {
      const aDate = a.release_date || "0000-00-00";
      const bDate = b.release_date || "0000-00-00";
      return bDate.localeCompare(aDate);
    });
  }, [credits]);

  const openImageViewer = useCallback((idx) => {
    setImageIndex(idx);
    setImageViewerOpen(true);
  }, []);

  const closeImageViewer = useCallback(() => {
    setImageViewerOpen(false);
  }, []);

  const handleSelectPerson = useCallback(
    (item) => {
      setQuery("");
      setDebouncedQuery("");
      navigation.replace("Person", { personId: item.id, name: item.name });
    },
    [navigation]
  );

  const handleSelectMovie = useCallback(
    (item) => navigation.navigate("Detail", { id: item.id, title: item.title }),
    [navigation]
  );

  const renderFilmography = useCallback(
    ({ item }) => (
      <PersonFilmographyItem
        item={item}
        onPress={handleSelectMovie}
        imdbId={imdbMap[item.id]}
      />
    ),
    [handleSelectMovie, imdbMap]
  );

  const keyExtractor = useCallback((item) => String(item.id), []);

  const handleToggleBio = useCallback(() => {
    if (!bioExpanded) {
      savedScrollYRef.current = scrollYRef.current;
      setBioExpanded(true);
      return;
    }

    setBioExpanded(false);
    setTimeout(() => {
      listRef.current?.scrollToOffset({
        offset: savedScrollYRef.current,
        animated: true,
      });
    }, 0);
  }, [bioExpanded]);

  const listHeader = useMemo(() => {
    return (
      <View style={styles.headerContent}>
        <View style={styles.searchWrap}>
          <SearchInput
            value={query}
            onChangeText={handleQueryChange}
            placeholder="Search people..."
            autoCapitalize="words"
          />
          {peopleLoading ? (
            <Text variant="caption" style={styles.searchHint}>
              Searching...
            </Text>
          ) : null}
          {peopleError ? (
            <Text variant="caption" style={styles.searchError}>
              {peopleError}
            </Text>
          ) : null}
          {peopleResults.length > 0 ? (
            <View style={styles.searchResults}>
              {peopleResults.slice(0, 6).map((personItem) => (
                <Pressable
                  key={personItem.id}
                  onPress={() => handleSelectPerson(personItem)}
                  style={styles.searchItem}
                >
                  <PosterImage
                    uri={buildCastPhotoUrl(personItem.profile_path)}
                    width={36}
                    height={48}
                    style={styles.searchItemImage}
                  />
                  <View style={styles.searchItemText}>
                    <Text variant="caption" numberOfLines={1}>
                      {personItem.name}
                    </Text>
                    <Text variant="caption" numberOfLines={1} style={styles.metaText}>
                      {personItem.known_for_department || "Unknown"}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.profileRow}>
          <PosterImage
            uri={buildCastPhotoUrl(person?.profile_path, "w342")}
            width={120}
            height={160}
            style={styles.profileImage}
          />
          <View style={styles.profileDetails}>
            <Text variant="title">{person?.name || "Person"}</Text>
            <Text variant="caption" style={styles.metaText}>
              {person?.known_for_department || "Department unknown"}
            </Text>
            <Text variant="caption" style={styles.metaText}>
              {person?.birthday ? `Born: ${person.birthday}` : "Birth date unknown"}
            </Text>
            {person?.place_of_birth ? (
              <Text variant="caption" style={styles.metaText} numberOfLines={2}>
                {person.place_of_birth}
              </Text>
            ) : null}
            {person?.deathday ? (
              <Text variant="caption" style={styles.metaText}>
                Died: {person.deathday}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.section}>
          <Text variant="subtitle">Biography</Text>
          <Text variant="caption" numberOfLines={bioExpanded ? undefined : 4} style={styles.bioText}>
            {person?.biography || "No biography available."}
          </Text>
          <Button
            title={bioExpanded ? "Read less" : "Read more"}
            variant="ghost"
            onPress={handleToggleBio}
            style={styles.readMoreButton}
          />
        </View>

        {knownAs.length ? (
          <View style={styles.section}>
            <Text variant="subtitle">Also Known As</Text>
            <View style={styles.chipRow}>
              {knownAs.map((name) => (
                <View key={name} style={styles.chip}>
                  <Text variant="caption">{name}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {images.length ? (
          <View style={styles.section}>
            <Text variant="subtitle">Images</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.imageRow}
            >
              {images.slice(0, 15).map((img, idx) => (
                <Pressable key={img.file_path} onPress={() => openImageViewer(idx)}>
                  <PosterImage
                    uri={buildCastPhotoUrl(img.file_path, "w342")}
                    width={120}
                    height={160}
                    style={styles.imageThumb}
                  />
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text variant="subtitle">Filmography</Text>
        </View>
      </View>
    );
  }, [
    query,
    peopleLoading,
    peopleError,
    peopleResults,
    handleSelectPerson,
    handleQueryChange,
    person?.profile_path,
    person?.name,
    person?.known_for_department,
    person?.birthday,
    person?.place_of_birth,
    person?.deathday,
    person?.biography,
    bioExpanded,
    knownAs,
    images,
    openImageViewer,
    handleToggleBio,
  ]);

  useEffect(() => {
    let active = true;

    async function loadImdbIds() {
      const list = filmography.slice(0, 40);
      const missing = list.filter((item) => !imdbCacheRef.current[item.id]);

      if (!missing.length) return;

      try {
        const results = await Promise.all(
          missing.map(async (item) => {
            const data = await getMovieExternalIds(item.id);
            return { id: item.id, imdbId: data?.imdb_id || null };
          })
        );

        if (!active) return;

        const nextMap = { ...imdbCacheRef.current };
        results.forEach((row) => {
          nextMap[row.id] = row.imdbId;
        });
        imdbCacheRef.current = nextMap;
        setImdbMap(nextMap);
      } catch {
        // Ignore IMDb fetch errors; keep N/A in UI.
      }
    }

    loadImdbIds();
    return () => {
      active = false;
    };
  }, [filmography]);

  if (loading) {
    return (
      <ScreenContainer>
        <LoadingState title="Loading person..." subtitle="Fetching details" />
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer>
        <EmptyState title="Unable to load" subtitle={error} actionLabel="Retry" onAction={loadPerson} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <FlatList
        ref={listRef}
        data={filmography}
        keyExtractor={keyExtractor}
        renderItem={renderFilmography}
        contentContainerStyle={styles.list}
        ListHeaderComponent={listHeader}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScroll={(e) => {
          scrollYRef.current = e.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}
      />

      <ModalImageViewer
        visible={imageViewerOpen}
        images={images}
        startIndex={imageIndex}
        onClose={closeImageViewer}
        onIndexChange={setImageIndex}
        insets={insets}
      />
    </ScreenContainer>
  );
}

function ModalImageViewer({ visible, images, startIndex, onClose, onIndexChange, insets }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
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
          <Button title="Close" variant="ghost" onPress={onClose} />
          <Text variant="caption" style={styles.viewerIndexText}>
            {startIndex + 1} / {images.length}
          </Text>
        </View>

        <ImageCarousel
          images={images}
          startIndex={startIndex}
          onIndexChange={onIndexChange}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  headerContent: {
    gap: theme.spacing.lg,
  },
  searchWrap: {
    gap: theme.spacing.xs,
  },
  searchResults: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
  },
  searchItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    padding: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  searchItemImage: {
    borderRadius: theme.radius.sm,
    overflow: "hidden",
  },
  searchItemText: {
    flex: 1,
    gap: 2,
  },
  searchHint: {
    color: theme.colors.textSecondary,
  },
  searchError: {
    color: theme.colors.accent,
  },
  profileRow: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  profileImage: {
    borderRadius: theme.radius.md,
    overflow: "hidden",
  },
  profileDetails: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  section: {
    gap: theme.spacing.sm,
  },
  bioText: {
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  readMoreButton: {
    alignSelf: "flex-start",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.xs,
  },
  chip: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  imageRow: {
    gap: theme.spacing.sm,
  },
  imageThumb: {
    borderRadius: theme.radius.md,
    overflow: "hidden",
  },
  filmCard: {
    flexDirection: "row",
    gap: theme.spacing.md,
    alignItems: "center",
  },
  filmCardContent: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  metaText: {
    color: theme.colors.textSecondary,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  imdbText: {
    color: theme.colors.textSecondary,
  },
  viewerRoot: {
    flex: 1,
    backgroundColor: "#000",
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
  viewerImage: {
    borderRadius: theme.radius.md,
  },
  headerIconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.md,
    zIndex: 3,
    elevation: 3,
  },
  headerIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  headerIconButtonPressed: {
    backgroundColor: theme.colors.card,
  },
  headerIconButtonDisabled: {
    opacity: 0.6,
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
          <PosterImage
            uri={buildCastPhotoUrl(img.file_path, "original")}
            width={width}
            height={height * 0.8}
            style={styles.viewerImage}
          />
        </View>
      ))}
    </ScrollView>
  );
}

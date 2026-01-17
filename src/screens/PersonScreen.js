import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Dimensions, FlatList, Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import ScreenContainer from "../components/ScreenContainer";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import Text from "../components/Text";
import Card from "../components/Card";
import PosterImage from "../components/PosterImage";
import Button from "../components/Button";
import SearchInput from "../components/SearchInput";
import theme from "../theme";
import { buildCastPhotoUrl, buildPosterUrl } from "../constants/images";
import {
  getPersonDetails,
  getPersonImages,
  getPersonMovieCredits,
  searchPeople,
} from "../services/tmdb";

function PersonFilmographyItem({ item, onPress }) {
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
        </View>
      </Card>
    </Pressable>
  );
}

export default function PersonScreen({ route, navigation }) {
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
    ({ item }) => <PersonFilmographyItem item={item} onPress={handleSelectMovie} />,
    [handleSelectMovie]
  );

  const keyExtractor = useCallback((item) => String(item.id), []);

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
            onPress={() => setBioExpanded((prev) => !prev)}
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
  ]);

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
        data={filmography}
        keyExtractor={keyExtractor}
        renderItem={renderFilmography}
        contentContainerStyle={styles.list}
        ListHeaderComponent={listHeader}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />

      <ModalImageViewer
        visible={imageViewerOpen}
        images={images}
        startIndex={imageIndex}
        onClose={closeImageViewer}
        onIndexChange={setImageIndex}
      />
    </ScreenContainer>
  );
}

function ModalImageViewer({ visible, images, startIndex, onClose, onIndexChange }) {
  const { width, height } = Dimensions.get("window");

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.viewerRoot}>
        <View style={styles.viewerTopBar}>
          <Button title="Close" variant="ghost" onPress={onClose} />
          <Text variant="caption" style={styles.viewerIndexText}>
            {startIndex + 1} / {images.length}
          </Text>
        </View>
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
  viewerRoot: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000",
    paddingTop: theme.spacing.lg,
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
  viewerImage: {
    borderRadius: theme.radius.md,
  },
});

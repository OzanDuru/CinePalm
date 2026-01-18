import React, { useCallback, useContext, useMemo, useState } from "react";
import { Alert, View, FlatList, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import ScreenContainer from "../components/ScreenContainer";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import Text from "../components/Text";
import Card from "../components/Card";
import PosterImage from "../components/PosterImage";
import RatingBadge from "../components/RatingBadge";
import theme from "../theme";
import { getFavorites, removeFavorite } from "../utils/favoritesStorage";
import { getFavoritePeople, toggleFavoritePerson } from "../utils/favoritePeopleStorage";
import { buildPosterUrl, buildCastPhotoUrl } from "../constants/images";
import { AuthContext } from "../firebase/AuthContext";

const SEGMENTS = {
  MOVIES: "movies",
  PEOPLE: "people",
};

function FavoritesSegmentedControl({ active, counts, onChange }) {
  return (
    <View style={styles.segmentWrap}>
      <Pressable
        onPress={() => onChange(SEGMENTS.MOVIES)}
        style={[
          styles.segmentItem,
          active === SEGMENTS.MOVIES ? styles.segmentActive : styles.segmentInactive,
        ]}
      >
        <Ionicons
          name={active === SEGMENTS.MOVIES ? "film" : "film-outline"}
          size={18}
          color={active === SEGMENTS.MOVIES ? "#111" : theme.colors.textSecondary}
        />
        <Text
          variant="caption"
          style={[
            styles.segmentText,
            active === SEGMENTS.MOVIES ? styles.segmentTextActive : styles.segmentTextInactive,
          ]}
        >
          Movies
        </Text>
        <View style={styles.segmentBadge}>
          <Text variant="caption" style={styles.segmentBadgeText}>
            {counts.movies}
          </Text>
        </View>
      </Pressable>

      <Pressable
        onPress={() => onChange(SEGMENTS.PEOPLE)}
        style={[
          styles.segmentItem,
          active === SEGMENTS.PEOPLE ? styles.segmentActive : styles.segmentInactive,
        ]}
      >
        <Ionicons
          name={active === SEGMENTS.PEOPLE ? "people" : "people-outline"}
          size={18}
          color={active === SEGMENTS.PEOPLE ? "#111" : theme.colors.textSecondary}
        />
        <Text
          variant="caption"
          style={[
            styles.segmentText,
            active === SEGMENTS.PEOPLE ? styles.segmentTextActive : styles.segmentTextInactive,
          ]}
        >
          Actors
        </Text>
        <View style={styles.segmentBadge}>
          <Text variant="caption" style={styles.segmentBadgeText}>
            {counts.people}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

function FavoriteMovieItem({ item, onPress, onRemove }) {
  return (
    <Card style={styles.card}>
      <Pressable style={styles.cardTapArea} onPress={() => onPress(item)}>
        <PosterImage uri={buildPosterUrl(item.poster_path)} width={80} height={120} />
        <View style={styles.cardContent}>
          <Text variant="subtitle" numberOfLines={2}>
            {item.title}
          </Text>
          <Text variant="caption" numberOfLines={2} style={styles.metaText}>
            {item.overview || "No overview available."}
          </Text>
          <RatingBadge value={item.vote_average} style={styles.posterBadge}/>
        </View>
      </Pressable>
      <Pressable style={styles.removeIcon} onPress={() => onRemove(item)} hitSlop={12}>
        <Ionicons name="close" size={18} color={theme.colors.accent} />
      </Pressable>
    </Card>
  );
}

function FavoritePersonItem({ item, onPress, onRemove }) {
  return (
    <Card style={styles.card}>
      <Pressable style={styles.cardTapArea} onPress={() => onPress(item)}>
        <PosterImage uri={buildCastPhotoUrl(item.profile_path)} width={80} height={120} />
        <View style={styles.cardContent}>
          <Text variant="subtitle" numberOfLines={2}>
            {item.name}
          </Text>
          <Text variant="caption" numberOfLines={1} style={styles.metaText}>
            {item.known_for_department || "Department unknown"}
          </Text>
          <Text variant="caption" numberOfLines={1} style={styles.metaText}>
            {item.place_of_birth || "Birth place unknown"}
          </Text>
        </View>
      </Pressable>
      <Pressable style={styles.removeIcon} onPress={() => onRemove(item)} hitSlop={12}>
        <Ionicons name="close" size={18} color={theme.colors.accent} />
      </Pressable>
    </Card>
  );
}

export default function FavoritesScreen({ navigation }) {
  const { user, loading: authLoading } = useContext(AuthContext);
  const userUid = user?.uid;
  const [activeSegment, setActiveSegment] = useState(SEGMENTS.MOVIES);
  const [movieFavorites, setMovieFavorites] = useState([]);
  const [peopleFavorites, setPeopleFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const counts = useMemo(
    () => ({
      movies: movieFavorites.length,
      people: peopleFavorites.length,
    }),
    [movieFavorites.length, peopleFavorites.length]
  );

  const loadAllFavorites = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [movies, people] = await Promise.all([
        getFavorites(userUid),
        getFavoritePeople(userUid),
      ]);
      setMovieFavorites(movies);
      setPeopleFavorites(people);
    } catch (err) {
      setError(err?.message || "Failed to load favorites.");
    } finally {
      setLoading(false);
    }
  }, [userUid]);

  useFocusEffect(
    useCallback(() => {
      if (authLoading) return;
      loadAllFavorites();
    }, [authLoading, loadAllFavorites])
  );

  const handleSelectMovie = useCallback(
    (item) => navigation.navigate("Detail", { id: item.id, title: item.title }),
    [navigation]
  );

  const handleSelectPerson = useCallback(
    (item) => navigation.navigate("Person", { personId: item.id, name: item.name }),
    [navigation]
  );

  const handleRemoveMovie = useCallback(
    (item) => {
      Alert.alert(
        "Remove from favorites?",
        `Are you sure you want to remove "${item.title}" from favorites?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: async () => {
              const updated = await removeFavorite(userUid, item.id);
              setMovieFavorites(updated);
            },
          },
        ]
      );
    },
    [userUid]
  );

  const handleRemovePerson = useCallback(
    (item) => {
      Alert.alert(
        "Remove from favorites?",
        `Are you sure you want to remove "${item.name}" from favorites?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: async () => {
              const result = await toggleFavoritePerson(userUid, item);
              setPeopleFavorites(result.favorites);
            },
          },
        ]
      );
    },
    [userUid]
  );

  const renderMovie = useCallback(
    ({ item }) => (
      <FavoriteMovieItem item={item} onPress={handleSelectMovie} onRemove={handleRemoveMovie} />
    ),
    [handleSelectMovie, handleRemoveMovie]
  );

  const renderPerson = useCallback(
    ({ item }) => (
      <FavoritePersonItem item={item} onPress={handleSelectPerson} onRemove={handleRemovePerson} />
    ),
    [handleSelectPerson, handleRemovePerson]
  );

  const keyExtractor = useCallback((item) => String(item.id), []);

  const activeData = activeSegment === SEGMENTS.MOVIES ? movieFavorites : peopleFavorites;
  const activeRenderItem = activeSegment === SEGMENTS.MOVIES ? renderMovie : renderPerson;
  const emptyTitle = activeSegment === SEGMENTS.MOVIES
    ? "No favorite movies yet"
    : "No favorite actors yet";
  const emptySubtitle = activeSegment === SEGMENTS.MOVIES
    ? "Save movies from the Detail screen."
    : "Save actors from the Person screen.";

  const listContentStyle = useMemo(() => {
    if (activeData.length > 0) {
      return {
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.md,
        paddingBottom: theme.spacing.xxl,
      };
    }

    return {
      flexGrow: 1,
      justifyContent: "center",
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xxl,
    };
  }, [activeData.length]);

  if (loading) {
    return (
      <ScreenContainer>
        <LoadingState title="Loading favorites..." subtitle="Fetching your lists" />
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer>
        <EmptyState title="Unable to load" subtitle={error} actionLabel="Retry" onAction={loadAllFavorites} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text variant="title">Favorites</Text>
        <Text variant="caption">Your saved movies and actors</Text>
        <FavoritesSegmentedControl
          active={activeSegment}
          counts={counts}
          onChange={setActiveSegment}
        />
      </View>

      <FlatList
        data={activeData}
        keyExtractor={keyExtractor}
        renderItem={activeRenderItem}
        style={styles.list}
        contentContainerStyle={listContentStyle}
        ListEmptyComponent={
          <EmptyState
            title={emptyTitle}
            subtitle={emptySubtitle}
          />
        }
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
  segmentWrap: {
    marginTop: theme.spacing.sm,
    flexDirection: "row",
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.xs,
    backgroundColor: theme.colors.surface,
    gap: theme.spacing.xs,
  },
  segmentItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.lg,
  },
  segmentActive: {
    backgroundColor: theme.colors.accent,
  },
  segmentInactive: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  segmentText: {
    fontWeight: theme.typography.weights.bold,
  },
  segmentTextActive: {
    color: "#111",
  },
  segmentTextInactive: {
    color: theme.colors.textSecondary,
  },
  segmentBadge: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
  },
  segmentBadgeText: {
    color: "#111",
    fontWeight: theme.typography.weights.bold,
  },
  list: {
    flex: 1,
  },
  itemSeparator: {
    height: theme.spacing.lg,
  },
  card: {
    flexDirection: "row",
    gap: theme.spacing.md,
    alignItems: "center",
    position: "relative",
  },
  cardTapArea: {
    flexDirection: "row",
    flex: 1,
    gap: theme.spacing.md,
    alignItems: "center",
  },
  cardContent: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  metaText: {
    color: theme.colors.textSecondary,
  },
   posterBadge: {
    // Rozeti solda tut (ekrandaki gibi).
    alignSelf: "flex-start",
  },

  removeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.accent,
    backgroundColor: "rgba(0,0,0,0.6)",
    position: "absolute",
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    zIndex: 3,
    elevation: 3,
  },
});

import React, { useCallback, useContext, useEffect, useState } from "react";
import { View, FlatList, Pressable, StyleSheet } from "react-native";
import ScreenContainer from "../components/ScreenContainer";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import Text from "../components/Text";
import Card from "../components/Card";
import PosterImage from "../components/PosterImage";
import RatingBadge from "../components/RatingBadge";
import Button from "../components/Button";
import theme from "../theme";
import { getFavorites, removeFavorite } from "../utils/favoritesStorage";
import { buildPosterUrl } from "../constants/images";
import { useIsFocused } from "@react-navigation/native";
import { AuthContext } from "../firebase/AuthContext";

function FavoriteItem({ item, onPress, onRemove }) {
  return (
    <Card style={styles.card}>
      <Pressable style={styles.cardTapArea} onPress={() => onPress(item)}>
        <PosterImage uri={buildPosterUrl(item.poster_path)} width={80} height={120} />
        <View style={styles.cardContent}>
          <Text variant="subtitle" numberOfLines={2}>
            {item.title}
          </Text>
          <Text variant="caption" numberOfLines={2} style={styles.overview}>
            {item.overview || "No overview available."}
          </Text>
          <RatingBadge value={item.vote_average} />
        </View>
      </Pressable>
      <Button title="Remove" variant="ghost" onPress={() => onRemove(item.id)} />
    </Card>
  );
}

export default function FavoritesScreen({ navigation }) {
  const { user, loading: authLoading } = useContext(AuthContext);
  const userUid = user?.uid;
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isFocused = useIsFocused();

  const loadFavorites = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // userUid null ise storage otomatik "guest" key'ine gider.
      const data = await getFavorites(userUid);
      setFavorites(data);
    } catch (err) {
      setError(err?.message || "Failed to load favorites.");
    } finally {
      setLoading(false);
    }
  }, [userUid]);

  useEffect(() => {
    if (authLoading) return;
    if (isFocused) loadFavorites();
  }, [authLoading, isFocused, loadFavorites]);

  useEffect(() => {
    if (authLoading) return;
    loadFavorites();
  }, [authLoading, userUid, loadFavorites]);

  const handleRemove = useCallback(
    async (id) => {
      const updated = await removeFavorite(userUid, id);
      setFavorites(updated);
    },
    [setFavorites, userUid]
  );

  const handleSelect = (item) => navigation.navigate("Detail", { id: item.id, title: item.title });

  if (loading) {
    return (
      <ScreenContainer>
        <LoadingState title="Loading favorites..." subtitle="Fetching your list" />
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer>
        <EmptyState title="Unable to load" subtitle={error} actionLabel="Retry" onAction={loadFavorites} />
      </ScreenContainer>
    );
  }

  if (!favorites.length) {
    return (
      <ScreenContainer>
        <EmptyState title="No favorites yet" subtitle="Add movies from the Detail screen." />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <FlatList
        data={favorites}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <FavoriteItem item={item} onPress={handleSelect} onRemove={handleRemove} />
        )}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text variant="title">Favorites</Text>
            <Text variant="caption">Your saved movies</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  header: {
    gap: theme.spacing.xs,
  },
  card: {
    flexDirection: "row",
    gap: theme.spacing.md,
    alignItems: "center",
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
  overview: {
    color: theme.colors.textSecondary,
  },
});

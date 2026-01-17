import React, { useCallback, useContext, useEffect, useState } from "react";
import { View, FlatList, Pressable, StyleSheet } from "react-native";
import ScreenContainer from "../components/ScreenContainer";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import Text from "../components/Text";
import Card from "../components/Card";
import PosterImage from "../components/PosterImage";
import Button from "../components/Button";
import theme from "../theme";
import { buildCastPhotoUrl } from "../constants/images";
import { AuthContext } from "../firebase/AuthContext";
import { getFavoritePeople, toggleFavoritePerson } from "../utils/favoritePeopleStorage";
import { useIsFocused } from "@react-navigation/native";

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
      <Button title="Remove" variant="ghost" onPress={() => onRemove(item)} />
    </Card>
  );
}

export default function FavoritePeopleScreen({ navigation }) {
  const { user, loading: authLoading } = useContext(AuthContext);
  const userUid = user?.uid;
  const isFocused = useIsFocused();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadFavorites = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getFavoritePeople(userUid);
      setFavorites(data);
    } catch (err) {
      setError(err?.message || "Failed to load favorite people.");
    } finally {
      setLoading(false);
    }
  }, [userUid]);

  useEffect(() => {
    if (authLoading) return;
    if (isFocused) loadFavorites();
  }, [authLoading, isFocused, loadFavorites]);

  const handleRemove = useCallback(
    async (item) => {
      const result = await toggleFavoritePerson(userUid, item);
      setFavorites(result.favorites);
    },
    [userUid]
  );

  const handleSelect = useCallback(
    (item) => navigation.navigate("Person", { personId: item.id, name: item.name }),
    [navigation]
  );

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
        <EmptyState title="No favorite people" subtitle="Add people from the Person screen." />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <FlatList
        data={favorites}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <FavoritePersonItem item={item} onPress={handleSelect} onRemove={handleRemove} />
        )}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text variant="title">Favorite People</Text>
            <Text variant="caption">Your saved actors</Text>
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
  metaText: {
    color: theme.colors.textSecondary,
  },
});

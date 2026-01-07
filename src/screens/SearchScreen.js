import React, { useEffect, useMemo, useState } from "react";
import { View, FlatList, Pressable, StyleSheet } from "react-native";
import ScreenContainer from "../components/ScreenContainer";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import Text from "../components/Text";
import Card from "../components/Card";
import PosterImage from "../components/PosterImage";
import RatingBadge from "../components/RatingBadge";
import SearchInput from "../components/SearchInput";
import theme from "../theme";
import { searchMovies } from "../services/tmdb";
import { buildPosterUrl } from "../constants/images";

function SearchResultItem({ item, onPress }) {
  return (
    <Pressable onPress={() => onPress(item)}>
      <Card style={styles.card}>
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
      </Card>
    </Pressable>
  );
}

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 400);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    let active = true;

    async function runSearch() {
      if (!debouncedQuery) {
        setResults([]);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await searchMovies(debouncedQuery, 1);
        if (active) setResults(data?.results ?? []);
      } catch (err) {
        if (active) setError(err?.message || "Search failed.");
      } finally {
        if (active) setLoading(false);
      }
    }

    runSearch();
    return () => {
      active = false;
    };
  }, [debouncedQuery]);

  const listHeader = useMemo(() => {
    return (
      <View style={styles.header}>
        <Text variant="title">Search</Text>
        <Text variant="caption">Find your next movie</Text>
        <SearchInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search movies..."
          autoCapitalize="none"
        />
      </View>
    );
  }, [query]);

  const handleSelect = (item) => navigation.navigate("Detail", { id: item.id, title: item.title });

  if (loading && results.length === 0) {
    return (
      <ScreenContainer>
        <LoadingState title="Searching..." subtitle="Looking up movies" />
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer>
        <EmptyState title="Search failed" subtitle={error} />
      </ScreenContainer>
    );
  }

  if (!debouncedQuery) {
    return (
      <ScreenContainer>
        <View style={styles.container}>
          {listHeader}
          <EmptyState title="Start typing" subtitle="Search for movies by title." />
        </View>
      </ScreenContainer>
    );
  }

  if (!loading && results.length === 0) {
    return (
      <ScreenContainer>
        <View style={styles.container}>
          {listHeader}
          <EmptyState title="No results" subtitle="Try a different search term." />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <FlatList
        data={results}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <SearchResultItem item={item} onPress={handleSelect} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={listHeader}
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  header: {
    gap: theme.spacing.sm,
  },
  list: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  card: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  cardContent: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  overview: {
    color: theme.colors.textSecondary,
  },
});

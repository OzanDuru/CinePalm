import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import { getTrendingMovies, getPopularMovies } from "../services/tmdb";
import { buildPosterUrl } from "../constants/images";

function MoviePosterCard({ item, onPress }) {
  return (
    <Pressable onPress={() => onPress(item)} style={styles.posterCard}>
      <PosterImage uri={buildPosterUrl(item.poster_path)} width={120} height={180} />
      <Text variant="caption" style={styles.posterTitle} numberOfLines={2}>
        {item.title}
      </Text>
      <RatingBadge value={item.vote_average} style={styles.posterBadge} />
    </Pressable>
  );
}

function MovieListItem({ item, onPress }) {
  return (
    <Pressable onPress={() => onPress(item)}>
      <Card style={styles.listCard}>
        <PosterImage uri={buildPosterUrl(item.poster_path)} width={90} height={130} />
        <View style={styles.listContent}>
          <Text variant="subtitle" numberOfLines={2}>
            {item.title}
          </Text>
          <Text variant="caption" numberOfLines={3} style={styles.listOverview}>
            {item.overview || "No overview available."}
          </Text>
          <RatingBadge value={item.vote_average} />
        </View>
      </Card>
    </Pressable>
  );
}

export default function HomeScreen({ navigation }) {
  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [popularPage, setPopularPage] = useState(1);
  const [popularTotalPages, setPopularTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const openDetail = useCallback(
    (item) => navigation.navigate("Detail", { id: item.id, title: item.title }),
    [navigation]
  );

  const loadTrending = useCallback(async () => {
    const data = await getTrendingMovies("day", 1);
    setTrending(data?.results ?? []);
  }, []);

  const loadPopular = useCallback(async (page = 1, append = false) => {
    const data = await getPopularMovies(page);
    const results = data?.results ?? [];
    setPopular((prev) => (append ? [...prev, ...results] : results));
    setPopularPage(data?.page ?? page);
    setPopularTotalPages(data?.total_pages ?? 1);
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([loadTrending(), loadPopular(1, false)]);
    } catch (err) {
      setError(err?.message || "Failed to load movies.");
    } finally {
      setLoading(false);
    }
  }, [loadTrending, loadPopular]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleLoadMore = useCallback(async () => {
    if (loadingMore) return;
    if (popularPage >= popularTotalPages) return;
    setLoadingMore(true);
    try {
      await loadPopular(popularPage + 1, true);
    } catch (err) {
      setError(err?.message || "Failed to load more movies.");
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, popularPage, popularTotalPages, loadPopular]);

  const listHeader = useMemo(() => {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text variant="title">Trending Today</Text>
          <Text variant="caption">Top picks from TMDB</Text>
        </View>
        <FlatList
          data={trending}
          horizontal
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.horizontalList}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => <MoviePosterCard item={item} onPress={openDetail} />}
          ListEmptyComponent={
            <Text variant="caption" style={styles.emptyInline}>
              No trending movies yet.
            </Text>
          }
        />
        <View style={styles.sectionHeader}>
          <Text variant="title">Popular Movies</Text>
          <Text variant="caption">Scroll to load more</Text>
        </View>
      </View>
    );
  }, [trending, openDetail]);

  if (loading) {
    return (
      <ScreenContainer>
        <LoadingState title="Loading movies..." subtitle="Fetching the latest lists" />
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer>
        <EmptyState
          title="Something went wrong"
          subtitle={error}
          actionLabel="Retry"
          onAction={loadAll}
        />
      </ScreenContainer>
    );
  }

  if (trending.length === 0 && popular.length === 0) {
    return (
      <ScreenContainer>
        <EmptyState title="No movies yet" subtitle="Try again later." actionLabel="Retry" onAction={loadAll} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <FlatList
        data={popular}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.container}
        renderItem={({ item }) => <MovieListItem item={item} onPress={openDetail} />}
        ListHeaderComponent={listHeader}
        ListFooterComponent={
          popularPage < popularTotalPages ? (
            <View style={styles.footer}>
              <Button title={loadingMore ? "Loading..." : "Load More"} onPress={handleLoadMore} />
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

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.lg,
  },
  section: {
    gap: theme.spacing.md,
  },
  sectionHeader: {
    gap: 4,
  },
  horizontalList: {
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  posterCard: {
    width: 120,
    gap: theme.spacing.xs,
  },
  posterTitle: {
    color: theme.colors.textSecondary,
  },
  posterBadge: {
    alignSelf: "flex-start",
  },
  listCard: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  listContent: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  listOverview: {
    color: theme.colors.textSecondary,
  },
  footer: {
    paddingVertical: theme.spacing.md,
  },
  emptyInline: {
    color: theme.colors.textMuted,
  },
});

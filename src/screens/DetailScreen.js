import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import ScreenContainer from "../components/ScreenContainer";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import Text from "../components/Text";
import PosterImage from "../components/PosterImage";
import RatingBadge from "../components/RatingBadge";
import Button from "../components/Button";
import theme from "../theme";
import { getMovieDetails } from "../services/tmdb";
import { buildPosterUrl } from "../constants/images";

export default function DetailScreen({ route, navigation }) {
  const movieId = route?.params?.id;
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const genresText = useMemo(() => {
    if (!movie?.genres?.length) return "No genres listed.";
    return movie.genres.map((genre) => genre.name).join(" • ");
  }, [movie]);

  const loadDetails = useCallback(async () => {
    if (!movieId) {
      setError("Missing movie id.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getMovieDetails(movieId);
      setMovie(data);
    } catch (err) {
      setError(err?.message || "Failed to load movie details.");
    } finally {
      setLoading(false);
    }
  }, [movieId]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  if (loading) {
    return (
      <ScreenContainer>
        <LoadingState title="Loading details..." subtitle="Fetching movie information" />
      </ScreenContainer>
    );
  }

  if (error) {
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
    return (
      <ScreenContainer>
        <EmptyState title="Movie not found" subtitle="Try another title." />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <PosterImage
          uri={buildPosterUrl(movie.poster_path)}
          height={360}
          width={260}
          style={styles.poster}
        />

        <View style={styles.headerRow}>
          <Text variant="title" style={styles.title}>
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

        <View style={styles.actions}>
          <Button title="Back" variant="secondary" onPress={() => navigation.goBack()} />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  poster: {
    alignSelf: "center",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  title: {
    flex: 1,
  },
  meta: {
    color: theme.colors.textSecondary,
  },
  sectionTitle: {
    marginTop: theme.spacing.md,
  },
  overview: {
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  actions: {
    marginTop: theme.spacing.lg,
  },
});

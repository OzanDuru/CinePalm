import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenContainer from "../components/ScreenContainer";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import Text from "../components/Text";
import Card from "../components/Card";
import PosterImage from "../components/PosterImage";
import RatingBadge from "../components/RatingBadge";
import SearchInput from "../components/SearchInput";
import theme from "../theme";
import { getGenres, searchMovies } from "../services/tmdb";
import { request } from "../services/tmdbClient";
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
          <RatingBadge value={item.vote_average} style={{ alignSelf: "flex-start" }} />
        </View>
      </Card>
    </Pressable>
  );
}

export default function SearchScreen({ navigation }) {
  const listRef = useRef(null);
  const scrollTopVisible = useRef(false);
  const scrollTopOpacity = useRef(new Animated.Value(0)).current;

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- Filters / Discover (new, parallel to search) ---
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");
  const [ratingMin, setRatingMin] = useState(0);
  const [ratingMax, setRatingMax] = useState(10);
  const [voteCountMin, setVoteCountMin] = useState("");
  const [runtimeMin, setRuntimeMin] = useState("");
  const [runtimeMax, setRuntimeMax] = useState("");
  const [sortBy, setSortBy] = useState("popularity.desc");
  const [language, setLanguage] = useState("tr-TR");
  const [originalLanguage, setOriginalLanguage] = useState("any");
  const [includeAdult, setIncludeAdult] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState(null);
  const [discoverResults, setDiscoverResults] = useState([]);
  const [discoverPage, setDiscoverPage] = useState(1);
  const [discoverTotalPages, setDiscoverTotalPages] = useState(1);
  const [discoverLoading, setDiscoverLoading] = useState(false);
  const [discoverError, setDiscoverError] = useState(null);

  const handleChangeText = useCallback((text) => {
    setQuery(text);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    let active = true;

    async function runSearch() {
      if (!debouncedQuery) {
        if (active) {
          setResults([]);
          setError(null);
          setLoading(false);
        }
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

  // Load genre list once for filters.
  useEffect(() => {
    let active = true;
    async function loadGenres() {
      try {
        const data = await getGenres();
        if (active) setGenres(data?.genres ?? []);
      } catch {
        // ignore genre errors (filters are optional)
      }
    }
    loadGenres();
    return () => {
      active = false;
    };
  }, []);

  const filtersActive = useMemo(() => Boolean(appliedFilters), [appliedFilters]);
  const discoverMode = useMemo(
    () => filtersActive && !debouncedQuery,
    [filtersActive, debouncedQuery]
  );

  const fetchDiscoverMovies = useCallback(async (filters, page = 1) => {
    // Build discover params from applied filters only.
    const params = {
      page,
      // Discover results must always be English.
      language: "en-US",
      include_adult: filters.includeAdult,
      sort_by: filters.sortBy,
      with_genres: filters.selectedGenres.join(","),
      "primary_release_date.gte": filters.startYear ? `${filters.startYear}-01-01` : undefined,
      "primary_release_date.lte": filters.endYear ? `${filters.endYear}-12-31` : undefined,
      "vote_average.gte": filters.ratingMin,
      "vote_average.lte": filters.ratingMax,
      "vote_count.gte": filters.voteCountMin,
      "with_runtime.gte": filters.runtimeMin,
      "with_runtime.lte": filters.runtimeMax,
      with_original_language: filters.originalLanguage === "any" ? undefined : filters.originalLanguage,
    };

    return request("/discover/movie", { params });
  }, []);

  const handleApplyFilters = useCallback(async () => {
    const parsedVoteCount = voteCountMin ? Number(voteCountMin) : undefined;
    const parsedRuntimeMin = runtimeMin ? Number(runtimeMin) : undefined;
    const parsedRuntimeMax = runtimeMax ? Number(runtimeMax) : undefined;

    const safeVoteCountMin =
      sortBy === "vote_average.desc"
        ? Math.max(parsedVoteCount ?? 0, 200)
        : parsedVoteCount;

    const nextFilters = {
      selectedGenres,
      startYear,
      endYear,
      ratingMin,
      ratingMax,
      voteCountMin: safeVoteCountMin,
      runtimeMin: parsedRuntimeMin,
      runtimeMax: parsedRuntimeMax,
      sortBy,
      language,
      originalLanguage,
      includeAdult,
    };

    setAppliedFilters(nextFilters);
    setFiltersOpen(false);

    if (!debouncedQuery) {
      setDiscoverLoading(true);
      setDiscoverError(null);
      try {
        const data = await fetchDiscoverMovies(nextFilters, 1);
        setDiscoverResults(data?.results ?? []);
        setDiscoverPage(1);
        setDiscoverTotalPages(data?.total_pages ?? 1);
      } catch (err) {
        setDiscoverError(err?.message || "Discover failed.");
      } finally {
        setDiscoverLoading(false);
      }
    }
  }, [
    selectedGenres,
    startYear,
    endYear,
    ratingMin,
    ratingMax,
    voteCountMin,
    runtimeMin,
    runtimeMax,
    sortBy,
    language,
    originalLanguage,
    includeAdult,
    debouncedQuery,
    fetchDiscoverMovies,
  ]);

  const handleResetFilters = useCallback(() => {
    setSelectedGenres([]);
    setStartYear("");
    setEndYear("");
    setRatingMin(0);
    setRatingMax(10);
    setVoteCountMin("");
    setRuntimeMin("");
    setRuntimeMax("");
    setSortBy("popularity.desc");
    setLanguage("tr-TR");
    setOriginalLanguage("any");
    setIncludeAdult(false);
    // Clear applied discover state as well.
    setAppliedFilters(null);
    setDiscoverResults([]);
    setDiscoverPage(1);
    setDiscoverTotalPages(1);
    setDiscoverError(null);
  }, []);

  const handleToggleGenre = useCallback((id) => {
    setSelectedGenres((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  }, []);

  const loadMoreDiscover = useCallback(async () => {
    if (!appliedFilters || discoverLoading) return;
    if (discoverPage >= discoverTotalPages) return;
    const nextPage = discoverPage + 1;
    setDiscoverLoading(true);
    try {
      const data = await fetchDiscoverMovies(appliedFilters, nextPage);
      setDiscoverResults((prev) => [...prev, ...(data?.results ?? [])]);
      setDiscoverPage(nextPage);
    } catch (err) {
      setDiscoverError(err?.message || "Discover failed.");
    } finally {
      setDiscoverLoading(false);
    }
  }, [appliedFilters, discoverLoading, discoverPage, discoverTotalPages, fetchDiscoverMovies]);

  const listHeader = useMemo(() => {
    return (
      <View style={styles.header}>
        <Text variant="title">Search</Text>
        <Text variant="caption">Find your next movie</Text>
        <View style={styles.searchRow}>
          <SearchInput
            value={query}
            onChangeText={handleChangeText}
            placeholder="Search movies..."
            autoCapitalize="none"
            style={styles.searchInput}
          />
          <Pressable style={styles.filterButton} onPress={() => setFiltersOpen(true)}>
            <Ionicons name="options-outline" size={18} color={theme.colors.accent} />
            {filtersActive ? <View style={styles.filtersActiveDot} /> : null}
          </Pressable>
        </View>
        {filtersActive && debouncedQuery ? (
          <Text variant="caption" style={styles.filtersHint}>
            Filters ignored while typing.
          </Text>
        ) : null}
      </View>
    );
  }, [query, handleChangeText, filtersActive, debouncedQuery]);

  const listEmpty = useMemo(() => {
    if (loading) {
      return <LoadingState title="Searching..." subtitle="Looking up movies" />;
    }

    if (error) {
      return <EmptyState title="Search failed" subtitle={error} />;
    }

    if (!debouncedQuery) {
      return <EmptyState title="Start typing" subtitle="Search for movies by title." />;
    }

    return <EmptyState title="No results" subtitle="Try a different search term." />;
  }, [loading, error, debouncedQuery]);

  const discoverEmpty = useMemo(() => {
    if (discoverLoading) {
      return <LoadingState title="Loading filters..." subtitle="Finding matches" />;
    }
    if (discoverError) {
      return <EmptyState title="Discover failed" subtitle={discoverError} />;
    }
    return <EmptyState title="No matches" subtitle="Try adjusting your filters." />;
  }, [discoverLoading, discoverError]);

  const handleSelect = useCallback(
    (item) => navigation.navigate("Detail", { id: item.id, title: item.title }),
    [navigation]
  );

  const renderItem = useCallback(
    ({ item }) => <SearchResultItem item={item} onPress={handleSelect} />,
    [handleSelect]
  );

  const keyExtractor = useCallback((item) => String(item.id), []);

  const listData = discoverMode ? discoverResults : results;
  const listEmptyComponent = discoverMode ? discoverEmpty : listEmpty;

  const showScrollTop = useCallback(() => {
    if (scrollTopVisible.current) return;
    scrollTopVisible.current = true;
    Animated.timing(scrollTopOpacity, {
      toValue: 0.7,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [scrollTopOpacity]);

  const hideScrollTop = useCallback(() => {
    if (!scrollTopVisible.current) return;
    scrollTopVisible.current = false;
    Animated.timing(scrollTopOpacity, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [scrollTopOpacity]);

  return (
    <ScreenContainer>
      <FlatList
        ref={listRef}
        data={listData}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={[styles.list, listData.length === 0 && styles.listEmpty]}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmptyComponent}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="always"
        onEndReached={discoverMode ? loadMoreDiscover : undefined}
        onEndReachedThreshold={0.5}
        onScrollBeginDrag={hideScrollTop}
        onScrollEndDrag={showScrollTop}
        onMomentumScrollEnd={showScrollTop}
      />
      <Animated.View style={[styles.scrollTopWrap, { opacity: scrollTopOpacity }]}>
        <Pressable
          style={styles.scrollTopButton}
          onPress={() => listRef.current?.scrollToOffset({ offset: 0, animated: true })}
          hitSlop={12}
        >
          <Ionicons name="arrow-up" size={18} color={theme.colors.accent} />
        </Pressable>
      </Animated.View>
      {/* Filters modal (Discover) */}
      <Modal visible={filtersOpen} transparent animationType="slide" onRequestClose={() => setFiltersOpen(false)}>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={Keyboard.dismiss} />
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.modalSheet}
          >
            <View style={styles.modalHeader}>
              <Text variant="subtitle">Advanced Filters</Text>
              <Pressable onPress={() => setFiltersOpen(false)}>
                <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={styles.modalContent}
              keyboardShouldPersistTaps="handled"
            >
                {/* Genres */}
                <Text variant="caption" style={styles.sectionLabel}>Genres</Text>
                <View style={styles.chipWrap}>
                  {genres.map((g) => {
                    const active = selectedGenres.includes(g.id);
                    return (
                      <Pressable
                        key={g.id}
                        onPress={() => handleToggleGenre(g.id)}
                        style={[styles.chip, active && styles.chipActive]}
                      >
                        <Text variant="caption" style={active ? styles.chipTextActive : styles.chipText}>
                          {g.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {/* Year range */}
                <Text variant="caption" style={styles.sectionLabel}>Year Range</Text>
                <View style={styles.row}>
                  <TextInput
                    value={startYear}
                    onChangeText={setStartYear}
                    placeholder="Start (e.g., 2000)"
                    placeholderTextColor={theme.colors.textMuted}
                    keyboardType="number-pad"
                    style={styles.input}
                  />
                  <TextInput
                    value={endYear}
                    onChangeText={setEndYear}
                    placeholder="End (e.g., 2024)"
                    placeholderTextColor={theme.colors.textMuted}
                    keyboardType="number-pad"
                    style={styles.input}
                  />
                </View>

                {/* Rating */}
                <Text variant="caption" style={styles.sectionLabel}>Rating</Text>
                <View style={styles.row}>
                  <Pressable style={styles.stepper} onPress={() => setRatingMin(Math.max(0, ratingMin - 1))}>
                    <Ionicons name="remove" size={16} color={theme.colors.accent} />
                  </Pressable>
                  <Text variant="caption" style={styles.stepperValue}>Min {ratingMin}</Text>
                  <Pressable style={styles.stepper} onPress={() => setRatingMin(Math.min(10, ratingMin + 1))}>
                    <Ionicons name="add" size={16} color={theme.colors.accent} />
                  </Pressable>
                  <View style={styles.spacer} />
                  <Pressable style={styles.stepper} onPress={() => setRatingMax(Math.max(0, ratingMax - 1))}>
                    <Ionicons name="remove" size={16} color={theme.colors.accent} />
                  </Pressable>
                  <Text variant="caption" style={styles.stepperValue}>Max {ratingMax}</Text>
                  <Pressable style={styles.stepper} onPress={() => setRatingMax(Math.min(10, ratingMax + 1))}>
                    <Ionicons name="add" size={16} color={theme.colors.accent} />
                  </Pressable>
                </View>

                {/* Vote count */}
                <Text variant="caption" style={styles.sectionLabel}>Vote Count Min</Text>
                <View style={styles.chipWrap}>
                  {[200, 500, 1000, 5000].map((v) => {
                    const active = String(v) === String(voteCountMin);
                    return (
                      <Pressable
                        key={v}
                        onPress={() => setVoteCountMin(String(v))}
                        style={[styles.chip, active && styles.chipActive]}
                      >
                        <Text variant="caption" style={active ? styles.chipTextActive : styles.chipText}>
                          {v}+
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                <TextInput
                  value={voteCountMin}
                  onChangeText={setVoteCountMin}
                  placeholder="Custom min"
                  placeholderTextColor={theme.colors.textMuted}
                  keyboardType="number-pad"
                  style={styles.input}
                />

                {/* Runtime */}
                <Text variant="caption" style={styles.sectionLabel}>Runtime (min)</Text>
                <View style={styles.chipWrap}>
                  {[{ min: 80, max: 120 }, { min: 120, max: 180 }].map((r) => {
                    const active = String(r.min) === String(runtimeMin) && String(r.max) === String(runtimeMax);
                    return (
                      <Pressable
                        key={`${r.min}-${r.max}`}
                        onPress={() => {
                          setRuntimeMin(String(r.min));
                          setRuntimeMax(String(r.max));
                        }}
                        style={[styles.chip, active && styles.chipActive]}
                      >
                        <Text variant="caption" style={active ? styles.chipTextActive : styles.chipText}>
                          {r.min}-{r.max}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                <View style={styles.row}>
                  <TextInput
                    value={runtimeMin}
                    onChangeText={setRuntimeMin}
                    placeholder="Min"
                    placeholderTextColor={theme.colors.textMuted}
                    keyboardType="number-pad"
                    style={styles.input}
                  />
                  <TextInput
                    value={runtimeMax}
                    onChangeText={setRuntimeMax}
                    placeholder="Max"
                    placeholderTextColor={theme.colors.textMuted}
                    keyboardType="number-pad"
                    style={styles.input}
                  />
                </View>

                {/* Sort */}
                <Text variant="caption" style={styles.sectionLabel}>Sort By</Text>
                <View style={styles.chipWrap}>
                  {[
                    "popularity.desc",
                    "primary_release_date.desc",
                    "vote_average.desc",
                    "revenue.desc",
                    "original_title.asc",
                  ].map((opt) => {
                    const active = sortBy === opt;
                    const SORT_LABELS = {
                      "popularity.desc": "Most Popular",
                      "primary_release_date.desc": "Newest",
                      "vote_average.desc": "Top Rated",
                      "revenue.desc": "Highest Revenue",
                      "original_title.asc": "A \u2192 Z",
                    };
                    return (
                      <Pressable
                        key={opt}
                        onPress={() => setSortBy(opt)}
                        style={[styles.chip, active && styles.chipActive]}
                      >
                        <Text variant="caption" style={active ? styles.chipTextActive : styles.chipText}>
                          {/* User-friendly label while keeping raw sort value */}
                          {SORT_LABELS[opt]}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Text variant="caption" style={styles.sectionLabel}>Original Language</Text>
                <View style={styles.chipWrap}>
                  {["any", "en", "tr", "fr", "ja", "ko", "ar", "fa"].map((lng) => {
                    const active = originalLanguage === lng;
                    return (
                      <Pressable
                        key={lng}
                        onPress={() => setOriginalLanguage(lng)}
                        style={[styles.chip, active && styles.chipActive]}
                      >
                        <Text variant="caption" style={active ? styles.chipTextActive : styles.chipText}>
                          {lng.toUpperCase()}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {/* Adult */}
                <View style={styles.row}>
                  <Text variant="caption" style={styles.sectionLabel}>Include Adult</Text>
                  <Switch
                    value={includeAdult}
                    onValueChange={setIncludeAdult}
                    trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
                    thumbColor={includeAdult ? "#111" : theme.colors.textMuted}
                  />
                </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Pressable style={styles.footerButtonGhost} onPress={handleResetFilters}>
                <Text variant="caption" style={styles.footerButtonGhostText}>Reset</Text>
              </Pressable>
              <Pressable style={styles.footerButton} onPress={handleApplyFilters}>
                <Text variant="caption" style={styles.footerButtonText}>Apply</Text>
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: theme.spacing.sm,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  filtersActiveDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.accent,
  },
  filtersHint: {
    color: theme.colors.textSecondary,
  },
  list: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  listEmpty: {
    flexGrow: 1,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalSheet: {
    flexGrow: 1,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalContent: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  modalFooter: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  footerButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.accent,
    alignItems: "center",
  },
  footerButtonText: {
    color: "#111",
    fontWeight: theme.typography.weights.bold,
  },
  footerButtonGhost: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
  },
  footerButtonGhostText: {
    color: theme.colors.textSecondary,
  },
  sectionLabel: {
    color: theme.colors.textSecondary,
  },
  chipWrap: {
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
  chipActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  chipText: {
    color: theme.colors.textSecondary,
  },
  chipTextActive: {
    color: "#111",
    fontWeight: theme.typography.weights.bold,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.surface,
  },
  stepper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  stepperValue: {
    color: theme.colors.textSecondary,
  },
  spacer: {
    width: theme.spacing.sm,
  },
  scrollTopWrap: {
    position: "absolute",
    right: theme.spacing.lg,
    bottom: theme.spacing.lg,
    zIndex: 5,
  },
  scrollTopButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    borderWidth: 1,
    borderColor: theme.colors.accent,
  },
});

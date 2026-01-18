// src/screens/ProfileScreen.js
import React, { useCallback, useContext, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import ScreenContainer from "../components/ScreenContainer";
import Text from "../components/Text";
import Button from "../components/Button";
import Card from "../components/Card";
import theme from "../theme";

import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { AuthContext } from "../firebase/AuthContext";

const MOVIE_FAVORITES_PREFIX = "cinepalm:favorites";
const PEOPLE_FAVORITES_PREFIX = "cinepalm:favorite_people";

function keyForUser(prefix, userUid) {
  return userUid ? `${prefix}:${userUid}` : `${prefix}:guest`;
}

function prettyNameFromEmail(email) {
  if (!email) return "CinePalm";
  const local = email.split("@")[0] || "";
  const parts = local.split(/[._-]+/).filter(Boolean);
  if (!parts.length) return "CinePalm";
  return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
}

function getInitials(displayName, fallback = "CP") {
  if (!displayName) return fallback;
  const parts = displayName.split(" ").filter(Boolean);
  const initials = parts.slice(0, 2).map((p) => p[0].toUpperCase()).join("");
  return initials || fallback;
}

async function readCountForKey(key) {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return 0;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

function getAppVersion() {
  try {
    // expo-application varsa gerçek sürümü göster.
    // eslint-disable-next-line global-require
    const Application = require("expo-application");
    const version = Application?.nativeApplicationVersion;
    const build = Application?.nativeBuildVersion;
    if (version && build) return `${version} (${build})`;
    if (version) return version;
  } catch {
    // noop
  }
  return "v1.0";
}

export default function ProfileScreen({ navigation }) {
  // AuthContext'ten kullanici bilgisini al.
  const { user } = useContext(AuthContext);
  const userUid = user?.uid;

  const [movieCount, setMovieCount] = useState(0);
  const [peopleCount, setPeopleCount] = useState(0);

  const displayName = useMemo(() => prettyNameFromEmail(user?.email), [user?.email]);
  const initials = useMemo(() => getInitials(displayName), [displayName]);

  const refreshCounts = useCallback(async () => {
    const [movies, people] = await Promise.all([
      readCountForKey(keyForUser(MOVIE_FAVORITES_PREFIX, userUid)),
      readCountForKey(keyForUser(PEOPLE_FAVORITES_PREFIX, userUid)),
    ]);
    setMovieCount(movies);
    setPeopleCount(people);
  }, [userUid]);

  useFocusEffect(
    useCallback(() => {
      refreshCounts();
    }, [refreshCounts])
  );

  async function handleLogout() {
    try {
      await signOut(auth);
    } catch (e) {
      Alert.alert("Hata", "Logout başarısız.");
      console.log("LOGOUT_ERROR:", e);
    }
  }

  const handleClearCache = useCallback(() => {
    Alert.alert("Clear Local Cache", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          await Promise.all([
            AsyncStorage.removeItem(keyForUser(MOVIE_FAVORITES_PREFIX, userUid)),
            AsyncStorage.removeItem(keyForUser(PEOPLE_FAVORITES_PREFIX, userUid)),
          ]);
          refreshCounts();
        },
      },
    ]);
  }, [refreshCounts, userUid]);

  const handleGoFavorites = useCallback(() => {
    navigation.navigate("Tabs", { screen: "Favorites" });
  }, [navigation]);

  const handleResetPassword = useCallback(() => {
    navigation.navigate("ResetPassword");
  }, [navigation]);

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text variant="subtitle" style={styles.avatarText}>
              {initials}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text variant="title">{displayName}</Text>
            <Text variant="caption" style={styles.profileEmail}>
              {user?.email ?? "-"}
            </Text>
          </View>
        </Card>

        {/* Stats */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text variant="caption" style={styles.statLabel}>Saved Movies</Text>
            <Text variant="title">{movieCount}</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text variant="caption" style={styles.statLabel}>Saved Actors</Text>
            <Text variant="title">{peopleCount}</Text>
          </Card>
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text variant="subtitle">Quick Actions</Text>
        </View>
        <View style={styles.actionsWrap}>
          <Pressable style={styles.actionCard} onPress={handleGoFavorites}>
            <Ionicons name="heart" size={18} color={theme.colors.accent} />
            <Text variant="caption" style={styles.actionText}>Go to Favorites</Text>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
          </Pressable>

          <Pressable style={styles.actionCard} onPress={handleClearCache}>
            <Ionicons name="trash" size={18} color={theme.colors.accent} />
            <Text variant="caption" style={styles.actionText}>Clear Local Cache</Text>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
          </Pressable>

          <Pressable style={styles.actionCard} onPress={handleResetPassword}>
            <Ionicons name="key" size={18} color={theme.colors.accent} />
            <Text variant="caption" style={styles.actionText}>Reset Password</Text>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
          </Pressable>

          <View style={styles.actionCard}>
            <Ionicons name="information-circle" size={18} color={theme.colors.accent} />
            <Text variant="caption" style={styles.actionText}>App Version</Text>
            <Text variant="caption" style={styles.actionValue}>{getAppVersion()}</Text>
          </View>
        </View>

        <Button title="Logout" variant="secondary" onPress={handleLogout} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.lg,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  avatarText: {
    color: theme.colors.accent,
  },
  profileInfo: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  profileEmail: {
    color: theme.colors.textSecondary,
  },
  statsRow: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    gap: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statLabel: {
    color: theme.colors.textSecondary,
  },
  sectionHeader: {
    marginTop: theme.spacing.sm,
  },
  actionsWrap: {
    gap: theme.spacing.sm,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  actionText: {
    flex: 1,
    color: theme.colors.textPrimary,
  },
  actionValue: {
    color: theme.colors.textSecondary,
  },
});

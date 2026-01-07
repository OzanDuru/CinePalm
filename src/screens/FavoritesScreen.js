// src/screens/FavoritesScreen.js
import React, { useCallback, useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, Alert } from "react-native";
import ScreenContainer from "../components/ScreenContainer";

import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";

import { AuthContext } from "../firebase/AuthContext";
import { listFavorites, removeFavorite, listWatchlist, removeWatchlist } from "../firebase/db";

export default function FavoritesScreen() {
  const { user } = useContext(AuthContext);

  const [tab, setTab] = useState("favorites"); // favorites | watchlist
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = tab === "favorites" ? await listFavorites(user.uid) : await listWatchlist(user.uid);
      setItems(data);
    } catch (e) {
      console.log("LIST_ERROR:", e);
      Alert.alert("Hata", "Liste çekilemedi.");
    } finally {
      setLoading(false);
    }
  }, [user, tab]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleRemove(itemId) {
    if (!user) return;
    try {
      if (tab === "favorites") await removeFavorite(user.uid, itemId);
      else await removeWatchlist(user.uid, itemId);
      await load();
    } catch (e) {
      console.log("REMOVE_ERROR:", e);
      Alert.alert("Hata", "Silinemedi.");
    }
  }

  if (!user) {
    return (
      <ScreenContainer>
        <EmptyState title="Login gerekli" subtitle="Listelerini görmek için giriş yap." />
      </ScreenContainer>
    );
  }

  if (loading) {
    return (
      <ScreenContainer>
        <LoadingState title="Loading..." subtitle="Fetching your list" />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.header}>My Lists</Text>
        <Text style={styles.desc}>Firestore: Favorites / Watchlist</Text>

        <View style={styles.switchRow}>
          <Pressable
            style={[styles.switchBtn, tab === "favorites" && styles.switchActive]}
            onPress={() => setTab("favorites")}
          >
            <Text style={[styles.switchText, tab === "favorites" && styles.switchTextActive]}>Favorites</Text>
          </Pressable>

          <Pressable
            style={[styles.switchBtn, tab === "watchlist" && styles.switchActive]}
            onPress={() => setTab("watchlist")}
          >
            <Text style={[styles.switchText, tab === "watchlist" && styles.switchTextActive]}>Watchlist</Text>
          </Pressable>
        </View>

        {items.length === 0 ? (
          <EmptyState title="No items yet" subtitle="Detail ekranından eklediğin içerikler burada görünecek." />
        ) : (
          <FlatList
            data={items}
            keyExtractor={(i) => String(i.id)}
            contentContainerStyle={{ gap: 12, paddingTop: 12, paddingBottom: 20 }}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardSub}>id: {item.id}</Text>
                </View>

                <Pressable style={styles.delBtn} onPress={() => handleRemove(item.id)}>
                  <Text style={styles.delText}>Remove</Text>
                </Pressable>
              </View>
            )}
          />
        )}

        <Pressable style={styles.refreshBtn} onPress={load}>
          <Text style={styles.refreshText}>Refresh</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff", gap: 10 },
  header: { fontSize: 28, fontWeight: "800" },
  desc: { fontSize: 14, color: "#555" },

  switchRow: { flexDirection: "row", gap: 10, marginTop: 10 },
  switchBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center",
  },
  switchActive: { backgroundColor: "#111" },
  switchText: { fontWeight: "800", color: "#111" },
  switchTextActive: { color: "#fff" },

  card: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  cardTitle: { fontWeight: "900" },
  cardSub: { color: "#666", marginTop: 2 },

  delBtn: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12 },
  delText: { fontWeight: "800" },

  refreshBtn: { borderWidth: 1, borderColor: "#ddd", borderRadius: 12, padding: 12, alignItems: "center", marginTop: 10 },
  refreshText: { fontWeight: "900" },
});

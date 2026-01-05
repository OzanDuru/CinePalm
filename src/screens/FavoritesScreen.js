// src/screens/FavoritesScreen.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function FavoritesScreen() {
  const isEmpty = true; // şimdilik boş senaryo

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Lists</Text>
      <Text style={styles.desc}>Favorites / Watchlist (demo UI).</Text>

      {isEmpty ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>No items yet</Text>
          <Text style={styles.emptyDesc}>
            Favori veya watchlist'e eklediğin içerikler burada gözükecek.
          </Text>
        </View>
      ) : (
        <Text>(Buraya sonra liste gelecek)</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff", gap: 10 },
  header: { fontSize: 28, fontWeight: "700" },
  desc: { fontSize: 14, color: "#555" },
  emptyBox: { borderWidth: 1, borderColor: "#eee", borderRadius: 14, padding: 16, gap: 6, marginTop: 10 },
  emptyTitle: { fontSize: 16, fontWeight: "800" },
  emptyDesc: { color: "#555", lineHeight: 20 },
});

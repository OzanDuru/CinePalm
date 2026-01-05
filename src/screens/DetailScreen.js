// src/screens/DetailScreen.js
import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

export default function DetailScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Detail</Text>
      <Text style={styles.desc}>Seçilen içerik detay sayfası (demo UI).</Text>

      <View style={styles.posterPlaceholder} />

      <Text style={styles.title}>Movie / Series Title</Text>

      <View style={styles.metaRow}>
        <Text style={styles.meta}>⭐ 8.7</Text>
        <Text style={styles.meta}>📅 2014-11-07</Text>
      </View>

      <Text style={styles.overview}>
        Description / overview alanı. Week 3'te TMDB'den gerçek veri gelecek.
      </Text>

      <View style={styles.actionsRow}>
        <Pressable style={styles.secondaryBtn} onPress={() => console.log("Add Favorite (demo)")}>
          <Text style={styles.btnText}>Add Favorite</Text>
        </Pressable>
        <Pressable style={styles.secondaryBtn} onPress={() => console.log("Add Watchlist (demo)")}>
          <Text style={styles.btnText}>Add Watchlist</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff", gap: 10 },
  header: { fontSize: 28, fontWeight: "700" },
  desc: { fontSize: 14, color: "#555" },
  posterPlaceholder: { height: 220, borderRadius: 16, backgroundColor: "#f1f5f9" },
  title: { fontSize: 20, fontWeight: "800", marginTop: 6 },
  metaRow: { flexDirection: "row", gap: 14 },
  meta: { color: "#444", fontWeight: "600" },
  overview: { color: "#444", lineHeight: 20, marginTop: 6 },
  actionsRow: { flexDirection: "row", gap: 12, marginTop: 10 },
  secondaryBtn: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: "#ddd", alignItems: "center" },
  btnText: { fontWeight: "700" },
});

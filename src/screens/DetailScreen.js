// src/screens/DetailScreen.js
import React, { useContext, useMemo } from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import ScreenContainer from "../components/ScreenContainer";

import { AuthContext } from "../firebase/AuthContext";
import { addFavorite, addWatchlist } from "../firebase/db";

export default function DetailScreen({ route, navigation }) {
  const { user } = useContext(AuthContext);
  const { id, title } = route.params || {};

  const item = useMemo(() => {
    return {
      id: String(id ?? ""),
      title: title ?? "Untitled",
      posterUrl: "",
      rating: 0,
      type: "demo", // Week 3'te movie/tv olacak
    };
  }, [id, title]);

  async function handleAddFavorite() {
    if (!user) return Alert.alert("Login gerekli", "Favori eklemek için giriş yap.");
    try {
      await addFavorite(user.uid, item);
      Alert.alert("OK", "Favorilere eklendi.");
    } catch (e) {
      console.log("ADD_FAV_ERROR:", e);
      Alert.alert("Hata", "Favori eklenemedi.");
    }
  }

  async function handleAddWatchlist() {
    if (!user) return Alert.alert("Login gerekli", "Watchlist eklemek için giriş yap.");
    try {
      await addWatchlist(user.uid, item);
      Alert.alert("OK", "Watchlist’e eklendi.");
    } catch (e) {
      console.log("ADD_WL_ERROR:", e);
      Alert.alert("Hata", "Watchlist eklenemedi.");
    }
  }

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.header}>Detail</Text>
        <Text style={styles.desc}>Week 2: Firestore ekleme</Text>

        <View style={styles.posterPlaceholder} />

        <Text style={styles.title}>{title}</Text>

        <View style={styles.metaRow}>
          <Text style={styles.meta}>🆔 {id}</Text>
          <Text style={styles.meta}>👤 {user?.email ?? "Guest"}</Text>
        </View>

        <Text style={styles.overview}>
          Şimdilik demo veri. Week 3'te TMDB’den gerçek içerik gelecek.
        </Text>

        <View style={styles.actionsRow}>
          <Pressable style={styles.secondaryBtn} onPress={handleAddFavorite}>
            <Text style={styles.btnText}>Add Favorite</Text>
          </Pressable>

          <Pressable style={styles.secondaryBtn} onPress={handleAddWatchlist}>
            <Text style={styles.btnText}>Add Watchlist</Text>
          </Pressable>
        </View>

        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff", gap: 10 },
  header: { fontSize: 28, fontWeight: "700" },
  desc: { fontSize: 14, color: "#555" },
  posterPlaceholder: { height: 220, borderRadius: 16, backgroundColor: "#f1f5f9" },
  title: { fontSize: 20, fontWeight: "800", marginTop: 6 },
  metaRow: { flexDirection: "row", gap: 14, flexWrap: "wrap" },
  meta: { color: "#444", fontWeight: "600" },
  overview: { color: "#444", lineHeight: 20, marginTop: 6 },
  actionsRow: { flexDirection: "row", gap: 12, marginTop: 10 },
  secondaryBtn: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: "#ddd", alignItems: "center" },
  btnText: { fontWeight: "700" },
  backBtn: { marginTop: 10 },
  backText: { fontWeight: "700" },
});

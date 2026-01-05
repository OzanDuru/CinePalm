// src/screens/ProfileScreen.js
import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Profile</Text>
      <Text style={styles.desc}>Kullanıcı bilgisi + logout (demo UI).</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>demo@mail.com</Text>
      </View>

      <Pressable style={styles.primaryBtn} onPress={() => console.log("Logout (demo)")}>
        <Text style={styles.primaryBtnText}>Logout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff", gap: 12 },
  header: { fontSize: 28, fontWeight: "700" },
  desc: { fontSize: 14, color: "#555" },
  card: { borderWidth: 1, borderColor: "#eee", borderRadius: 14, padding: 14, gap: 6 },
  label: { color: "#555", fontWeight: "700" },
  value: { fontSize: 16, fontWeight: "800" },
  primaryBtn: { backgroundColor: "#111", padding: 14, borderRadius: 12, alignItems: "center" },
  primaryBtnText: { color: "#fff", fontWeight: "700" },
});

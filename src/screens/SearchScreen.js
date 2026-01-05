// src/screens/SearchScreen.js
import React, { useState } from "react";
import { View, Text, TextInput, FlatList, StyleSheet } from "react-native";

const DUMMY_RESULTS = [
  { id: "1", title: "Avatar" },
  { id: "2", title: "Avengers" },
  { id: "3", title: "Arrival" },
];

export default function SearchScreen() {
  const [q, setQ] = useState("");

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Search</Text>
      <Text style={styles.desc}>Arama (demo). Week 3'te TMDB bağlanacak.</Text>

      <TextInput
        style={styles.input}
        placeholder="Search movie or TV series..."
        value={q}
        onChangeText={setQ}
      />

      <FlatList
        data={DUMMY_RESULTS}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ gap: 10, paddingTop: 10 }}
        renderItem={({ item }) => (
          <View style={styles.resultCard}>
            <View style={styles.posterPlaceholder} />
            <Text style={styles.resultTitle}>{item.title}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff", gap: 10 },
  header: { fontSize: 28, fontWeight: "700" },
  desc: { fontSize: 14, color: "#555" },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 12 },
  resultCard: { borderWidth: 1, borderColor: "#eee", borderRadius: 14, padding: 12, gap: 10 },
  posterPlaceholder: { height: 120, borderRadius: 12, backgroundColor: "#f1f5f9" },
  resultTitle: { fontSize: 16, fontWeight: "700" },
});

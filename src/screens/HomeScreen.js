// src/screens/HomeScreen.js
import React from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import ScreenContainer from "../components/ScreenContainer";


const DUMMY = [
  { id: "1", title: "Interstellar" },
  { id: "2", title: "The Dark Knight" },
  { id: "3", title: "Inception" },
  { id: "4", title: "Breaking Bad (TV)" },
];

export default function HomeScreen() {
  return (
    <ScreenContainer>
    <View style={styles.container}>
      <Text style={styles.header}>Home</Text>
      <Text style={styles.desc}>Trending & Popular (şimdilik dummy liste).</Text>

      <FlatList
        data={DUMMY}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 12, paddingTop: 10 }}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => console.log("Open Detail:", item.title)}>
            <View style={styles.posterPlaceholder} />
            <Text style={styles.cardTitle}>{item.title}</Text>
          </Pressable>
        )}
      />
    </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  header: { fontSize: 28, fontWeight: "700" },
  desc: { fontSize: 14, color: "#555", marginTop: 6 },
  card: { borderWidth: 1, borderColor: "#eee", borderRadius: 14, padding: 12, gap: 10 },
  posterPlaceholder: { height: 140, borderRadius: 12, backgroundColor: "#f1f5f9" },
  cardTitle: { fontSize: 16, fontWeight: "700" },
});

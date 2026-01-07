import React from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import ScreenContainer from "../components/ScreenContainer";

// Demo veri: ileride API/TMDB baglandiginda burasi gercek data olur.
const DUMMY = [
  { id: "1", title: "Interstellar" },
  { id: "2", title: "The Dark Knight" },
  { id: "3", title: "Inception" },
  { id: "4", title: "Breaking Bad (TV)" },
];

export default function HomeScreen() {
  // React Navigation hook: baska ekrana gitmek icin kullaniliyor.
  const navigation = useNavigation();

  const openDetail = (item) => {
    // Detay ekranina parametre gonderiyoruz (id + title).
    console.log("HOME -> DETAIL NAV", item.title);
    navigation.navigate("Detail", { id: item.id, title: item.title });
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.header}>Home</Text>
        <Text style={styles.desc}>Trending & Popular (demo).</Text>

        <FlatList
          data={DUMMY}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 12, paddingTop: 12 }}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <Pressable style={styles.card} onPress={() => openDetail(item)}>
              {/* Gercek projede burasi film posteri olur */}
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
  desc: { fontSize: 14, color: "#555" },
  card: { borderWidth: 1, borderColor: "#eee", borderRadius: 14, padding: 12, gap: 10 },
  posterPlaceholder: { height: 140, borderRadius: 12, backgroundColor: "#f1f5f9" },
  cardTitle: { fontSize: 16, fontWeight: "700" },
});

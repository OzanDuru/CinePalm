import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";

// LoadingState:
// Tek tip yukleniyor ekrani gostermek icin tekrar kullanilan component.
export default function LoadingState({
  title = "Loading...",
  subtitle = "Please wait",
}) {
  return (
    <View style={styles.wrap}>
      {/* Native loading spinner */}
      <ActivityIndicator size="large" />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.sub}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 10,
    backgroundColor: "#fff",
  },
  title: { fontSize: 18, fontWeight: "800" },
  sub: { color: "#666" },
});

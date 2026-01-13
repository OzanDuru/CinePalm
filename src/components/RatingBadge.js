import React from "react";
import { View, StyleSheet } from "react-native";
import Text from "./Text";
import theme from "../theme";

function formatRating(value) {
  if (value === null || value === undefined) return "N/A";
  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) return "N/A";
  return numberValue.toFixed(1);
}

export default function RatingBadge({ value, style }) {
  return (
    <View style={[styles.badge, style]}>
      <Text style={styles.label}>TMDB</Text>
      <Text style={styles.value}>{formatRating(value)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: theme.colors.accent,
  },
  label: {
    color: "#111",
    fontWeight: theme.typography.weights.black,
    fontSize: theme.typography.sizes.xs,
    letterSpacing: 0.5,
  },
  value: {
    color: "#111",
    fontWeight: theme.typography.weights.bold,
    fontSize: theme.typography.sizes.sm,
  },
});

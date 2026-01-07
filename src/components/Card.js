import React from "react";
import { View, StyleSheet } from "react-native";
import theme from "../theme";

const styles = StyleSheet.create({
  base: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
});

export default function Card({ children, style }) {
  return <View style={[styles.base, style]}>{children}</View>;
}

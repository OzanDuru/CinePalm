import React from "react";
import { Text as RNText, StyleSheet } from "react-native";
import theme from "../theme";

const variants = StyleSheet.create({
  title: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.black,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  body: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.textPrimary,
  },
  caption: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.textSecondary,
  },
});

export default function Text({ variant = "body", style, children, ...props }) {
  return (
    <RNText {...props} style={[variants[variant] || variants.body, style]}>
      {children}
    </RNText>
  );
}

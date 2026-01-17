import React from "react";
import { Pressable, StyleSheet } from "react-native";
import Text from "./Text";
import theme from "../theme";

const styles = StyleSheet.create({
  base: {
    // Keep identical sizing across variants to prevent layout shifts.
    minHeight: 44,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  primary: {
    backgroundColor: theme.colors.accent,
    borderColor: "transparent",
  },
  secondary: {
    backgroundColor: "transparent",
    borderColor: theme.colors.accent,
  },
  ghost: {
    backgroundColor: "transparent",
    borderColor: "transparent",
  },
  disabled: {
    opacity: 0.6,
  },
  textBase: {
    fontSize: theme.typography.sizes.md,
    lineHeight: theme.typography.sizes.md + 4,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  textPrimary: {
    color: "#111",
    fontWeight: theme.typography.weights.bold,
  },
  textSecondary: {
    color: theme.colors.accent,
    fontWeight: theme.typography.weights.bold,
  },
  textGhost: {
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.weights.bold,
  },
});

export default function Button({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  style,
  textStyle,
}) {
  const isPrimary = variant === "primary";
  const isSecondary = variant === "secondary";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        isPrimary && styles.primary,
        isSecondary && styles.secondary,
        variant === "ghost" && styles.ghost,
        (disabled || pressed) && styles.disabled,
        style,
      ]}
    >
      <Text
        style={[
          styles.textBase,
          isPrimary && styles.textPrimary,
          isSecondary && styles.textSecondary,
          variant === "ghost" && styles.textGhost,
          textStyle,
        ]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {title}
      </Text>
    </Pressable>
  );
}

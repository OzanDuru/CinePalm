import React from "react";
import { View, Image, StyleSheet } from "react-native";
import Text from "./Text";
import theme from "../theme";

export default function PosterImage({ uri, style, height = 180, width = 120, borderRadius }) {
  const radius = borderRadius ?? theme.radius.md;

  if (!uri) {
    return (
      <View style={[styles.placeholder, { height, width, borderRadius: radius }, style]}>
        <Text variant="caption" style={styles.placeholderText}>
          No Image
        </Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={[styles.image, { height, width, borderRadius: radius }, style]}
      resizeMode="cover"
    />
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: theme.colors.surface,
  },
  placeholder: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: theme.colors.textMuted,
  },
});

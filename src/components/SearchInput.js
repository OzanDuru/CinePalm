import React from "react";
import { TextInput, StyleSheet, View } from "react-native";
import theme from "../theme";

export default function SearchInput({ value, onChangeText, placeholder = "Search", style, ...props }) {
  return (
    <View style={[styles.wrapper, style]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        style={styles.input}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  input: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.md,
  },
});

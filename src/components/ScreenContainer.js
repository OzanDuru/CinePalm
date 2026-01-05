import React from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


/**
 * ScreenContainer:
 * - iPhone notch / status bar / home indicator taşmalarını otomatik çözer
 * - Her ekran için ortak "root container" standardı sağlar
 */
export default function ScreenContainer({ children, style, edges = ["top", "bottom", "left", "right"] }) {
  return (
    <SafeAreaView edges={edges} style={[styles.base, style]}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    backgroundColor: "#fff",
  },
});

import React from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ScreenContainer:
// Tum ekranlar icin ortak bir "root container" saglar.
// - Notch / status bar / home indicator tasmalarini engeller.
// - Tek bir yerde arka plan rengi ve temel flex ayari kontrol edilir.
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

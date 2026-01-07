import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

// EmptyState:
// Veri olmayan durumlarda kullanilan standart bos ekran.
// Istege bagli aksiyon butonu gosterilebilir.
export default function EmptyState({
  title = "Nothing here",
  subtitle = "Try again later.",
  actionLabel,
  onAction,
}) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.sub}>{subtitle}</Text>

      {/* actionLabel ve onAction varsa buton gosterilir */}
      {actionLabel && onAction ? (
        <Pressable style={styles.btn} onPress={onAction}>
          <Text style={styles.btnText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
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
  sub: { color: "#666", textAlign: "center", lineHeight: 20 },
  btn: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  btnText: { fontWeight: "800" },
});

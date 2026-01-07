// src/screens/ResetPasswordScreen.js
import React, { useState } from "react";
import { View, TextInput, StyleSheet, Alert } from "react-native";
import ScreenContainer from "../components/ScreenContainer";
import Text from "../components/Text";
import Button from "../components/Button";
import Card from "../components/Card";
import theme from "../theme";

import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase/firebase";

export default function ResetPasswordScreen({ navigation }) {
  // Email input state
  const [email, setEmail] = useState("");
  // Yuklenme durumuna gore buton disable edilir
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    const e = email.trim();
    if (!e) return Alert.alert("Eksik bilgi", "Email gir.");

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, e);
      Alert.alert("Gönderildi", "Şifre sıfırlama maili gönderildi.");
      navigation.navigate("Login");
    } catch (err) {
      console.log("RESET_ERROR:", err?.code, err?.message);

      let msg = "İşlem başarısız.";
      if (err?.code === "auth/invalid-email") msg = "Email formatı yanlış.";
      if (err?.code === "auth/user-not-found") msg = "Bu email ile kullanıcı yok.";
      Alert.alert("Hata", msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <View style={styles.hero}>
          <View style={styles.brandRow}>
            <View style={styles.brandDot} />
            <Text variant="title">CinePalm</Text>
          </View>
          <Text variant="caption" style={styles.heroSubtitle}>
            Recover access to your account
          </Text>
          <Text variant="subtitle">Reset Password</Text>
        </View>

        <Card style={styles.card}>
          <Text variant="caption" style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={theme.colors.textMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </Card>

        <Button title={loading ? "Loading..." : "Send reset email"} onPress={handleReset} disabled={loading} />

        <Button
          title="Back to Login"
          variant="ghost"
          onPress={() => navigation.navigate("Login")}
          style={styles.linkButton}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: theme.spacing.lg, gap: theme.spacing.lg },
  hero: {
    gap: theme.spacing.xs,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  brandDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: theme.colors.accent,
  },
  heroSubtitle: {
    color: theme.colors.textSecondary,
  },
  card: { gap: theme.spacing.sm },
  label: { color: theme.colors.textSecondary },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.surface,
  },
  linkButton: { alignSelf: "flex-start" },
});

// src/screens/LoginScreen.js
import React, { useState } from "react";
import { View, TextInput, StyleSheet, Alert } from "react-native";
import ScreenContainer from "../components/ScreenContainer";
import Text from "../components/Text";
import Button from "../components/Button";
import Card from "../components/Card";
import theme from "../theme";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebase";

export default function LoginScreen({ navigation }) {
  // Form input state'leri
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  // Firebase istegi sirasinda button'u disable etmek icin
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    const e = email.trim();

    // Basit dogrulama: email ve sifre bos olamaz
    if (!e || !pass) {
      Alert.alert("Eksik bilgi", "Email ve şifre gir.");
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, e, pass);
      // Basarili olunca Auth state guncellenir ve App Tabs'a gecer.
    } catch (err) {
      console.log("LOGIN_ERROR:", err?.code, err?.message);

      // Firebase hata kodlarini kullaniciya anlasilir hale getiriyoruz.
      let msg = "Giriş başarısız.";
      if (err?.code === "auth/invalid-email") msg = "Email formatı yanlış.";
      if (err?.code === "auth/user-not-found") msg = "Bu email ile kullanıcı yok. Register yap.";
      if (err?.code === "auth/wrong-password") msg = "Şifre yanlış.";
      if (err?.code === "auth/invalid-credential") msg = "Email veya şifre yanlış.";

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
            Sign in to your premium list
          </Text>
          <Text variant="subtitle">Login</Text>
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

          <Text variant="caption" style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={theme.colors.textMuted}
            value={pass}
            onChangeText={setPass}
            secureTextEntry
          />
        </Card>

        <Button title={loading ? "Loading..." : "Login"} onPress={handleLogin} disabled={loading} />

        <View style={styles.linksColumn}>
          <Button
            title="Create account"
            variant="ghost"
            onPress={() => navigation.navigate("Register")}
            style={styles.linkButton}
          />
          <Button
            title="Forgot password?"
            variant="ghost"
            onPress={() => navigation.navigate("ResetPassword")}
            style={styles.linkButton}
          />
        </View>
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
  linksColumn: { gap: theme.spacing.xs },
  linkButton: { alignSelf: "flex-start" },
});

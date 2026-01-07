// src/screens/RegisterScreen.js
import React, { useState } from "react";
import { View, TextInput, StyleSheet, Alert } from "react-native";
import ScreenContainer from "../components/ScreenContainer";
import Text from "../components/Text";
import Button from "../components/Button";
import Card from "../components/Card";
import theme from "../theme";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebase";

export default function RegisterScreen({ navigation }) {
  // Kayit formu input state'leri
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [pass2, setPass2] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    const e = email.trim();

    // Giris validasyonlari
    if (!e || !pass || !pass2) return Alert.alert("Eksik bilgi", "Email ve şifreleri gir.");
    if (pass.length < 6) return Alert.alert("Hata", "Şifre en az 6 karakter olmalı.");
    if (pass !== pass2) return Alert.alert("Hata", "Şifreler aynı değil.");

    try {
      setLoading(true);
      await createUserWithEmailAndPassword(auth, e, pass);
      // Basarili olunca AuthContext user'i doldurur ve Tabs'a gecilir.
    } catch (err) {
      console.log("REGISTER_ERROR:", err?.code, err?.message);
      let msg = "Kayıt başarısız.";
      if (err?.code === "auth/email-already-in-use") msg = "Bu email zaten kayıtlı. Login yap.";
      if (err?.code === "auth/invalid-email") msg = "Email formatı yanlış.";
      if (err?.code === "auth/weak-password") msg = "Şifre çok zayıf. 6+ karakter gir.";
      Alert.alert("Hata", msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text variant="title">Register</Text>

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
            placeholder="Password (min 6)"
            placeholderTextColor={theme.colors.textMuted}
            value={pass}
            onChangeText={setPass}
            secureTextEntry
          />

          <Text variant="caption" style={styles.label}>Password again</Text>
          <TextInput
            style={styles.input}
            placeholder="Password again"
            placeholderTextColor={theme.colors.textMuted}
            value={pass2}
            onChangeText={setPass2}
            secureTextEntry
          />
        </Card>

        <Button title={loading ? "Loading..." : "Create account"} onPress={handleRegister} disabled={loading} />

        <Button title="Back to Login" variant="ghost" onPress={() => navigation.navigate("Login")} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: theme.spacing.lg, gap: theme.spacing.lg },
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
});

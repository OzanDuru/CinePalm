// src/screens/ResetPasswordScreen.js
import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert, ActivityIndicator } from "react-native";
import ScreenContainer from "../components/ScreenContainer";

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
        <Text style={styles.header}>Reset Password</Text>
        <Text style={styles.desc}>Email adresine sıfırlama linki gönderir.</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Pressable style={styles.primaryBtn} onPress={handleReset} disabled={loading}>
          {loading ? <ActivityIndicator /> : <Text style={styles.primaryText}>Send reset email</Text>}
        </Pressable>

        <Pressable onPress={() => navigation.navigate("Login")}>
          <Text style={styles.link}>← Back to Login</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff", gap: 12 },
  header: { fontSize: 28, fontWeight: "800" },
  desc: { fontSize: 14, color: "#555", marginBottom: 6 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 12, padding: 12 },
  primaryBtn: { backgroundColor: "#111", padding: 14, borderRadius: 12, alignItems: "center" },
  primaryText: { color: "#fff", fontWeight: "800" },
  link: { color: "#111", fontWeight: "800", marginTop: 4 },
});

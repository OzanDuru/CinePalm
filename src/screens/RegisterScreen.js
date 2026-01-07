// src/screens/RegisterScreen.js
import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert, ActivityIndicator } from "react-native";
import ScreenContainer from "../components/ScreenContainer";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebase";

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [pass2, setPass2] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    const e = email.trim();

    if (!e || !pass || !pass2) return Alert.alert("Eksik bilgi", "Email ve şifreleri gir.");
    if (pass.length < 6) return Alert.alert("Hata", "Şifre en az 6 karakter olmalı.");
    if (pass !== pass2) return Alert.alert("Hata", "Şifreler aynı değil.");

    try {
      setLoading(true);
      await createUserWithEmailAndPassword(auth, e, pass);
      // Başarılı olunca AuthContext user'ı doldurur ve RootNav otomatik Tabs'a geçer.
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
        <Text style={styles.header}>Register</Text>
        <Text style={styles.desc}>Firebase Auth (Week 2)</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Password (min 6)"
          value={pass}
          onChangeText={setPass}
          secureTextEntry
        />

        <TextInput
          style={styles.input}
          placeholder="Password again"
          value={pass2}
          onChangeText={setPass2}
          secureTextEntry
        />

        <Pressable style={styles.primaryBtn} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator /> : <Text style={styles.primaryText}>Create account</Text>}
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

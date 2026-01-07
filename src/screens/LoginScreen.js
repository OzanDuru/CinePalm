// src/screens/LoginScreen.js
import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert, ActivityIndicator } from "react-native";
import ScreenContainer from "../components/ScreenContainer";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebase";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    const e = email.trim();

    if (!e || !pass) {
      Alert.alert("Eksik bilgi", "Email ve şifre gir.");
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, e, pass);
      // Başarılı olunca RootNavigator otomatik Tabs'a geçer (user dolduğu için)
    } catch (err) {
      console.log("LOGIN_ERROR:", err?.code, err?.message);

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
        <Text style={styles.header}>Login</Text>
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
          placeholder="Password"
          value={pass}
          onChangeText={setPass}
          secureTextEntry
        />

        <Pressable style={styles.primaryBtn} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator /> : <Text style={styles.primaryText}>Login</Text>}
        </Pressable>

        <View style={styles.linksRow}>
          <Pressable onPress={() => navigation.navigate("Register")}>
            <Text style={styles.link}>Create account</Text>
          </Pressable>

          <Pressable onPress={() => navigation.navigate("ResetPassword")}>
            <Text style={styles.link}>Forgot password?</Text>
          </Pressable>
        </View>
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
  linksRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  link: { color: "#111", fontWeight: "700" },
});

// src/screens/ResetPasswordScreen.js
import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import ScreenContainer from "../components/ScreenContainer";


export default function ResetPasswordScreen() {
  const [email, setEmail] = useState("");

  return (
    <ScreenContainer>
    <View style={styles.container}>
      <Text style={styles.header}>Reset Password</Text>
      <Text style={styles.desc}>
        Şifre sıfırlama (demo). Week 2’de Firebase reset ile bağlanacak.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Pressable style={styles.primaryBtn} onPress={() => console.log("Send reset mail (demo)")}>
        <Text style={styles.primaryBtnText}>Send Reset Email</Text>
      </Pressable>

      <Pressable onPress={() => console.log("Back to Login (demo)")}>
        <Text style={styles.link}>Back to Login</Text>
      </Pressable>
    </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff", gap: 12 },
  header: { fontSize: 28, fontWeight: "700" },
  desc: { fontSize: 14, color: "#555" },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 12 },
  primaryBtn: { backgroundColor: "#111", padding: 14, borderRadius: 12, alignItems: "center" },
  primaryBtnText: { color: "#fff", fontWeight: "700" },
  link: { color: "#2563eb", fontWeight: "600", marginTop: 6 },
});

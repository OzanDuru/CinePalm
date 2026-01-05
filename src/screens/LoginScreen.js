// src/screens/LoginScreen.js
import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // 👁️ icon

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false); // 👈 yeni state

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Login</Text>
      <Text style={styles.desc}>
        Kullanıcı giriş ekranı (şimdilik demo UI). Firebase Week 2'de bağlanacak.
      </Text>

      {/* Email */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      {/* Password + Eye Icon */}
      <View style={styles.passwordRow}>
        <TextInput
          style={[styles.input, styles.passwordInput]}
          placeholder="Password"
          value={pass}
          onChangeText={setPass}
          secureTextEntry={!showPass} // 👈 toggle
        />

        <Pressable onPress={() => setShowPass(!showPass)}>
          <Ionicons
            name={showPass ? "eye-off" : "eye"}
            size={22}
            color="#555"
          />
        </Pressable>
      </View>

      {/* Login Button */}
      <Pressable
        style={styles.primaryBtn}
        onPress={() => console.log("Login (demo)")}
      >
        <Text style={styles.primaryBtnText}>Login</Text>
      </Pressable>

      {/* Links */}
      <View style={styles.linksRow}>
        <Pressable onPress={() => console.log("Go Register (demo)")}>
          <Text style={styles.link}>Register</Text>
        </Pressable>

        <Pressable onPress={() => console.log("Go Reset (demo)")}>
          <Text style={styles.link}>Reset Password</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff", gap: 12 },
  header: { fontSize: 28, fontWeight: "700" },
  desc: { fontSize: 14, color: "#555" },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
  },

  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  passwordInput: {
    flex: 1,
  },

  primaryBtn: {
    backgroundColor: "#111",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "700" },

  linksRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  link: { color: "#2563eb", fontWeight: "600" },
});
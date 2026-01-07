import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import ScreenContainer from "../components/ScreenContainer";

export default function ResetPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.header}>Reset Password</Text>
        <Text style={styles.desc}>Demo reset UI (Week 2’de Firebase email reset).</Text>

        <TextInput
          style={styles.input}
          placeholder="Your email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Pressable
          style={styles.primaryBtn}
          onPress={() => {
            console.log("RESET PASSWORD (demo):", email);
            navigation.navigate("Login");
          }}
        >
          <Text style={styles.primaryText}>Send Reset Link</Text>
        </Pressable>

        <Pressable onPress={() => navigation.navigate("Login")}>
          <Text style={styles.link}>Back to Login</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff", gap: 12 },
  header: { fontSize: 28, fontWeight: "800" },
  desc: { color: "#555", marginBottom: 6 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 12, padding: 12 },
  primaryBtn: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#111",
    alignItems: "center",
    marginTop: 4,
  },
  primaryText: { color: "#fff", fontWeight: "800" },
  link: { fontWeight: "700", color: "#111", marginTop: 6 },
});

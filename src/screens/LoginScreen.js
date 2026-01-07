import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import ScreenContainer from "../components/ScreenContainer";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.header}>Login</Text>
        <Text style={styles.desc}>Demo auth UI (Week 2’de Firebase bağlanacak).</Text>

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

        <Pressable
          style={styles.primaryBtn}
          onPress={() => {
            console.log("LOGIN (demo)");
            navigation.goBack();
          }}
        >
          <Text style={styles.primaryText}>Login</Text>
        </Pressable>

        <View style={styles.linksRow}>
          <Pressable onPress={() => navigation.navigate("ResetPassword")}>
            <Text style={styles.link}>Forgot password?</Text>
          </Pressable>

          <Pressable onPress={() => navigation.navigate("Register")}>
            <Text style={styles.link}>Create account</Text>
          </Pressable>
        </View>
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
  linksRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  link: { fontWeight: "700", color: "#111" },
});

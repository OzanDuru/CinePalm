import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import ScreenContainer from "../components/ScreenContainer";

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [pass2, setPass2] = useState("");

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.header}>Register</Text>
        <Text style={styles.desc}>Demo register UI (Week 2’de Firebase bağlanacak).</Text>

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

        <TextInput
          style={styles.input}
          placeholder="Confirm password"
          value={pass2}
          onChangeText={setPass2}
          secureTextEntry
        />

        <Pressable
          style={styles.primaryBtn}
          onPress={() => {
            console.log("REGISTER (demo)");
            navigation.navigate("Login");
          }}
        >
          <Text style={styles.primaryText}>Create Account</Text>
        </Pressable>

        <Pressable onPress={() => navigation.navigate("Login")}>
          <Text style={styles.link}>Already have an account? Login</Text>
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

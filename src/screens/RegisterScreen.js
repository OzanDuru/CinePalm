import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";

export default function RegisterScreen() {
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    return (
    <View style={styles.container}>
        <Text style={styles.header}>Register</Text>
        <Text style={styles.desc}>Yeni kullanıcı kayıt ekranı (demo UI).</Text>

        <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        />

        <TextInput
        placeholder="Password"
        value={pass}
        onChangeText={setPass}
        secureTextEntry
        />
        <Pressable style={styles.primaryBtn} onPress={() => console.log("Register (demo)")}>
        <Text style={styles.primaryBtnText}>Create Account</Text>
        </Pressable>

        <Pressable onPress={() => console.log("Back to Login (demo)")}>
            <Text style={styles.link}>Back to Login</Text>
        </Pressable>


        
    </View>
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

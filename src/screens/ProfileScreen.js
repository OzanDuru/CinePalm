// src/screens/ProfileScreen.js
import React, { useContext } from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import ScreenContainer from "../components/ScreenContainer";

import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { AuthContext } from "../firebase/AuthContext";

export default function ProfileScreen() {
  // AuthContext'ten kullanici bilgisini al.
  const { user } = useContext(AuthContext);

  async function handleLogout() {
    try {
      await signOut(auth);
    } catch (e) {
      Alert.alert("Hata", "Logout başarısız.");
      console.log("LOGOUT_ERROR:", e);
    }
  }

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.header}>Profile</Text>
        <Text style={styles.desc}>Kullanıcı bilgisi + logout (Firebase).</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email ?? "-"}</Text>
        </View>

        <Pressable style={styles.btn} onPress={handleLogout}>
          <Text style={styles.btnText}>Logout</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff", gap: 12 },
  header: { fontSize: 28, fontWeight: "800" },
  desc: { fontSize: 14, color: "#555" },
  card: { borderWidth: 1, borderColor: "#eee", borderRadius: 14, padding: 14, gap: 6, marginTop: 10 },
  label: { color: "#666", fontWeight: "700" },
  value: { fontWeight: "800" },
  btn: { marginTop: 10, backgroundColor: "#111", padding: 14, borderRadius: 12, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "900" },
});

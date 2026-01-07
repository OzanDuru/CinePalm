import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import ScreenContainer from "../components/ScreenContainer";

export default function ProfileScreen({ navigation }) {
  const goRoot = (screen) => {
    const tabNav = navigation.getParent?.();
    const rootNav = tabNav?.getParent?.();

    if (rootNav) {
      console.log("NAV VIA ROOT ->", screen);
      rootNav.navigate(screen);
    } else {
      console.log("NAV FALLBACK ->", screen);
      navigation.navigate(screen);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.header}>Profile</Text>
        <Text style={styles.desc}>Auth ekranlarına buradan geçiş (demo).</Text>

        <Pressable style={styles.btn} onPress={() => goRoot("Login")}>
          <Text style={styles.btnText}>Login</Text>
        </Pressable>

        <Pressable style={styles.btn} onPress={() => goRoot("Register")}>
          <Text style={styles.btnText}>Register</Text>
        </Pressable>

        <Pressable style={styles.btn} onPress={() => goRoot("ResetPassword")}>
          <Text style={styles.btnText}>Reset Password</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff", gap: 14 },
  header: { fontSize: 28, fontWeight: "800" },
  desc: { color: "#555", marginBottom: 10 },
  btn: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  btnText: { fontWeight: "700", fontSize: 16 },
});

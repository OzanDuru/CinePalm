// src/screens/ProfileScreen.js
import React, { useContext } from "react";
import { View, StyleSheet, Alert } from "react-native";
import ScreenContainer from "../components/ScreenContainer";
import Text from "../components/Text";
import Button from "../components/Button";
import Card from "../components/Card";
import theme from "../theme";

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
        <Text variant="title">Profile</Text>

        <Card style={styles.card}>
          <Text variant="caption" style={styles.label}>
            Email
          </Text>
          <Text variant="subtitle">{user?.email ?? "-"}</Text>
        </Card>

        <Button title="Logout" variant="secondary" onPress={handleLogout} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  card: {
    gap: theme.spacing.xs,
  },
  label: {
    color: theme.colors.textSecondary,
  },
});

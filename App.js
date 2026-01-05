import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import ResetPasswordScreen from "./src/screens/ResetPasswordScreen";
import HomeScreen from "./src/screens/HomeScreen";
import SearchScreen from "./src/screens/SearchScreen";
import FavoritesScreen from "./src/screens/FavoritesScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import DetailScreen from "./src/screens/DetailScreen";

const SCREENS = {
  Login: LoginScreen,
  Register: RegisterScreen,
  Reset: ResetPasswordScreen,
  Home: HomeScreen,
  Search: SearchScreen,
  Lists: FavoritesScreen,
  Profile: ProfileScreen,
  Detail: DetailScreen,
};

export default function App() {
  const [current, setCurrent] = useState("Home");
  const Screen = SCREENS[current];

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.devBar}>
        {Object.keys(SCREENS).map((name) => (
          <Pressable key={name} onPress={() => setCurrent(name)} style={styles.devBtn}>
            <Text style={styles.devBtnText}>{name}</Text>
          </Pressable>
        ))}
      </View>

      <Screen />
    </View>
  );
}

const styles = StyleSheet.create({
  devBar: { flexDirection: "row", flexWrap: "wrap", gap: 8, padding: 10, backgroundColor: "#f8fafc" },
  devBtn: { paddingVertical: 6, paddingHorizontal: 10, borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10 },
  devBtnText: { fontWeight: "700" },
});

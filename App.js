import React from "react";
import { Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import HomeScreen from "./src/screens/HomeScreen";
import DetailScreen from "./src/screens/DetailScreen";

import SearchScreen from "./src/screens/SearchScreen";
import FavoritesScreen from "./src/screens/FavoritesScreen";
import ProfileScreen from "./src/screens/ProfileScreen";

import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import ResetPasswordScreen from "./src/screens/ResetPasswordScreen";

const RootStack = createNativeStackNavigator();
const HomeStackNav = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStack() {
  return (
    <HomeStackNav.Navigator>
      <HomeStackNav.Screen name="Home" component={HomeScreen} options={{ title: "CinePalm" }} />
      <HomeStackNav.Screen name="Detail" component={DetailScreen} options={{ title: "Detail" }} />
    </HomeStackNav.Navigator>
  );
}

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarActiveTintColor: "#111",
        tabBarInactiveTintColor: "#666",
        tabBarStyle: { backgroundColor: "#fff" },
        tabBarIcon: ({ focused }) => {
          let icon = "[]";
          if (route.name === "HomeTab") icon = focused ? "🏠" : "🏡";
          if (route.name === "Search") icon = focused ? "🔎" : "🔍";
          if (route.name === "Favorites") icon = focused ? "❤️" : "🤍";
          if (route.name === "Profile") icon = focused ? "👤" : "👥";
          return <Text style={{ fontSize: 18 }}>{icon}</Text>;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStack} options={{ title: "Home", headerShown: false }} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  console.log("APP RUNNING (EMOJI TABS)");
  return (
    <NavigationContainer>
      <RootStack.Navigator>
        <RootStack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
        <RootStack.Screen name="Login" component={LoginScreen} />
        <RootStack.Screen name="Register" component={RegisterScreen} />
        <RootStack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ title: "Reset Password" }} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

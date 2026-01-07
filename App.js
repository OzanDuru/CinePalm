import React, { useContext } from "react";
import { Text } from "react-native";
import { useFonts } from "expo-font";
import { Ionicons } from "@expo/vector-icons";

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

import { AuthProvider, AuthContext } from "./src/firebase/AuthContext";
import LoadingState from "./src/components/LoadingState";

const AuthNav = createNativeStackNavigator();
const HomeStackNav = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AuthStack() {
  return (
    <AuthNav.Navigator>
      <AuthNav.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <AuthNav.Screen name="Register" component={RegisterScreen} options={{ title: "Register" }} />
      <AuthNav.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ title: "Reset Password" }} />
    </AuthNav.Navigator>
  );
}

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
        headerShown: false,
        tabBarActiveTintColor: "#111",
        tabBarInactiveTintColor: "#666",
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = "home-outline";
          if (route.name === "HomeTab") iconName = focused ? "home" : "home-outline";
          if (route.name === "Search") iconName = focused ? "search" : "search-outline";
          if (route.name === "Favorites") iconName = focused ? "heart" : "heart-outline";
          if (route.name === "Profile") iconName = focused ? "person" : "person-outline";
          return <Ionicons name={iconName} size={size ?? 22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStack} options={{ title: "Home" }} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function RootNav() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <LoadingState title="Starting..." subtitle="Checking session" />;
  }

  return user ? <Tabs /> : <AuthStack />;
}

export default function App() {
  const [fontsLoaded] = useFonts(Ionicons.font);
  if (!fontsLoaded) return null;

  console.log("APP RUNNING (AUTH + TABS CLEAN ROOT)");

  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNav />
      </NavigationContainer>
    </AuthProvider>
  );
}

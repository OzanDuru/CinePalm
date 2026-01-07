import React, { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import { Ionicons } from "@expo/vector-icons";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./src/firebase/firebase";

import { AuthProvider } from "./src/firebase/AuthContext";

import HomeScreen from "./src/screens/HomeScreen";
import DetailScreen from "./src/screens/DetailScreen";
import SearchScreen from "./src/screens/SearchScreen";
import FavoritesScreen from "./src/screens/FavoritesScreen";
import ProfileScreen from "./src/screens/ProfileScreen";

import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import ResetPasswordScreen from "./src/screens/ResetPasswordScreen";

// Uygulamadaki tum navigator yapilari:
// - RootStack: Auth (Login/Register/Reset) ve ana Tabs ayrimi
// - HomeStackNav: Home tab icindeki sayfalar (Home -> Detail)
// - Tab: Ana uygulama sekmeleri
const RootStack = createNativeStackNavigator();
const HomeStackNav = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Home tab'i icinde stack mantigi:
// "Detail" ekranina giderken tab bar kaybolmasin diye ayri stack kullaniliyor.
function HomeStack() {
  return (
    <HomeStackNav.Navigator>
      <HomeStackNav.Screen name="Home" component={HomeScreen} options={{ title: "CinePalm" }} />
      <HomeStackNav.Screen name="Detail" component={DetailScreen} options={{ title: "Detail" }} />
    </HomeStackNav.Navigator>
  );
}

// Uygulama icindeki ana sekmeler:
// Giris yapmis kullanicilara gosterilir.
function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // Tab'larda her ekrana ozel header yerine custom tasarim icin header kapali.
        headerShown: false,
        tabBarActiveTintColor: "#111",
        tabBarInactiveTintColor: "#999",
        tabBarIcon: ({ focused, color, size }) => {
          // Route adina ve focus durumuna gore ikon secimi.
          let iconName = "home-outline";
          if (route.name === "HomeTab") iconName = focused ? "home" : "home-outline";
          if (route.name === "Search") iconName = focused ? "search" : "search-outline";
          if (route.name === "Favorites") iconName = focused ? "heart" : "heart-outline";
          if (route.name === "Profile") iconName = focused ? "person" : "person-outline";
          return <Ionicons name={iconName} size={size ?? 22} color={color} />;
        },
      })}
    >
      {/* Home tab'i icinde Detail ekranina stack ile gidiliyor */}
      <Tab.Screen name="HomeTab" component={HomeStack} options={{ title: "Home" }} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Auth stack: giris yapmamis kullanicilar icin.
function AuthStack() {
  return (
    <RootStack.Navigator>
      <RootStack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <RootStack.Screen name="Register" component={RegisterScreen} options={{ title: "Register" }} />
      <RootStack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ title: "Reset Password" }} />
    </RootStack.Navigator>
  );
}

export default function App() {
  // Ionicons fontu yuklenmeden icon kullanimi hata verebilir.
  const [fontsLoaded] = useFonts(Ionicons.font);
  // undefined = auth durumu kontrol ediliyor, null = cikis yapmis, object = giris yapmis
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    // Firebase auth state degisince (login/logout) user state guncellenir.
    // Bu state, Tabs veya AuthStack secimini belirler.
    const unsub = onAuthStateChanged(auth, (u) => setUser(u ?? null));
    return unsub;
  }, []);

  // Fontlar veya auth durumu hazir degilse hic bir sey render etmiyoruz.
  if (!fontsLoaded) return null;
  if (user === undefined) return null;

  console.log("APP RUNNING (AUTH GATE + PROVIDER)");

  return (
    <AuthProvider>
      <NavigationContainer>
        {/* Auth gate: kullaniciya gore navigator secimi */}
        {user ? <Tabs /> : <AuthStack />}
      </NavigationContainer>
    </AuthProvider>
  );
}

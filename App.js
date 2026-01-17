import React, { useEffect, useState } from "react";// Temel React ve React Native kutuphaneleri
import { Image } from "react-native";// Resim gosterimi icin
import { useFonts } from "expo-font";// Font yukleme
import { Ionicons } from "@expo/vector-icons";// Icon kutuphanesi

import { NavigationContainer } from "@react-navigation/native";// Navigation konteyneri
import { createNativeStackNavigator } from "@react-navigation/native-stack";// Stack navigator
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";// Tab navigator

import { onAuthStateChanged } from "firebase/auth";// Firebase auth state dinleme login logout kontrolu
import { auth } from "./src/firebase/firebase";// Firebase auth instance

import { AuthProvider } from "./src/firebase/AuthContext";//Auth bilgilerini tüm uygulamaya yaymak icin provider
import theme from "./src/theme";// Tema ve stil ayarlari

// Ekranlar

import DetailScreen from "./src/screens/DetailScreen";
import HomeScreen from "./src/screens/HomeScreen";
import SearchScreen from "./src/screens/SearchScreen";
import FavoritesScreen from "./src/screens/FavoritesScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import ResetPasswordScreen from "./src/screens/ResetPasswordScreen";
import PersonScreen from "./src/screens/PersonScreen";
import FavoritePeopleScreen from "./src/screens/FavoritePeopleScreen";


// Uygulamadaki tum navigator yapilari:
// - RootStack: Auth (Login/Register/Reset) ve ana Tabs ayrimi
// - HomeStackNav: Home tab icindeki sayfalar (Home -> Detail)
// - Tab: Ana uygulama sekmeleri
const RootStack = createNativeStackNavigator();
const HomeStackNav = createNativeStackNavigator();
const AppStackNav = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Home tab'i icinde stack mantigi:
// "Detail" ekranina giderken tab bar kaybolmasin diye ayri stack kullaniliyor.
function HomeStack() {
  return (
    <HomeStackNav.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.headercolor },// Header arka plan rengi
        //headerTintColor: theme.colors.headerbackbuttoncolor,// Header metin rengi  bizde logo var
      }}
    >
      <HomeStackNav.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerTitle: () => (
            <Image
              source={require("./assets/cinepalm-logo.jpg")}
              style={{ width: 140, height: 34, resizeMode: "contain" }}
            />
          ),
        }}
      />

      

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
        tabBarActiveTintColor: theme.colors.tabiconscolor,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
        },
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
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}

// Auth stack: giris yapmamis kullanicilar icin.
function AuthStack() {
  return (
    <RootStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.textPrimary,
        headerTitleStyle: { fontWeight: "700" },
        headerTitle: () => (
          <Image
            source={require("./assets/cinepalm-logo.jpg")}
            style={{ width: 140, height: 34, resizeMode: "contain" }}
          />
        ),
      }}
    >
      <RootStack.Screen name="Login" component={LoginScreen} />
      <RootStack.Screen name="Register" component={RegisterScreen} />
      <RootStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </RootStack.Navigator>
  );
}

// Authenticated stack: Tabs + Detail (global)
function AppStack() {
  return (
    <AppStackNav.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.textPrimary,
        headerTitleStyle: { fontWeight: "700" },
      }}
    >
      <AppStackNav.Screen name="Tabs" component={Tabs} options={{ headerShown: false, }} />
      <AppStackNav.Screen name="Detail" component={DetailScreen} options={{ title: "Detail",headerBackTitle: "Back" }} />
      <AppStackNav.Screen name="Person" component={PersonScreen} options={{ title: "Person", headerBackTitle: "Back" }} />
      <AppStackNav.Screen name="FavoritePeople" component={FavoritePeopleScreen} options={{ title: "Favorite People", headerBackTitle: "Back" }} />
    </AppStackNav.Navigator>
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
    return unsub; //When this component is removed, stop listening to Firebase auth changes.
  }, []);//Runs only once when the component first appears (mount)

  // Fontlar veya auth durumu hazir degilse hic bir sey render etmiyoruz.
  if (!fontsLoaded) return null;
  if (user === undefined) return null;

  console.log("APP RUNNING (AUTH GATE + PROVIDER)");

  return (
    <AuthProvider>
      <NavigationContainer>
        {user ? <AppStack /> : <AuthStack />} 
      </NavigationContainer>
    </AuthProvider>
  );
}

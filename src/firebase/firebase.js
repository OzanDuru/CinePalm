import { initializeApp } from "firebase/app";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase proje konfigurasyonu:
// Bu bilgiler Firebase Console > Project Settings ekranindan gelir.
const firebaseConfig = {
  apiKey: "AIzaSyCvgHwgwghFS6mvAZ5140x47anyCs_Q4NU",
  authDomain: "cinepalm-9760d.firebaseapp.com",
  projectId: "cinepalm-9760d",
  storageBucket: "cinepalm-9760d.firebasestorage.app",
  messagingSenderId: "709560155544",
  appId: "1:709560155544:web:af5ca61f9fdf64fc217fed",
};

// Firebase uygulamasini baslat.
const app = initializeApp(firebaseConfig);

// React Native icin auth persistence:
// Kullanici kapanip acilsa bile oturumun AsyncStorage'da tutulmasini saglar.
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

// Firestore baglantisi:
// Diger dosyalarda bu db instance'i kullanilarak okuma/yazma yapilir.
export const db = getFirestore(app);

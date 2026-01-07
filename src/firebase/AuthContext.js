import React, { createContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

// AuthContext:
// Uygulama icindeki her yerden "user" ve "loading" bilgisine erismek icin.
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // user: giris yapan kullanici nesnesi, null ise cikis yapmis
  const [user, setUser] = useState(null);
  // loading: auth durumunun ilk kez okunup okunmadigini belirtir
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Firebase auth degisikliklerini dinle:
    // Login/Logout oldugunda user guncellenir.
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

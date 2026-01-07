import { collection, deleteDoc, doc, getDocs, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "./firebase";

// Firestore veri modeli (bu uygulama icin):
// users/{uid}/favorites/{itemId}
// users/{uid}/watchlist/{itemId}

// FAVORITES
export async function addFavorite(uid, item) {
  // Belge id'si olarak item.id kullaniliyor (string'e cevrilir).
  const ref = doc(db, "users", uid, "favorites", String(item.id));
  // merge: true => mevcut belge varsa sadece gunceller, yoksa olusturur.
  await setDoc(ref, { ...item, createdAt: serverTimestamp() }, { merge: true });
}

export async function removeFavorite(uid, itemId) {
  // Belirli favoriyi belge id'si ile sil.
  const ref = doc(db, "users", uid, "favorites", String(itemId));
  await deleteDoc(ref);
}

export async function listFavorites(uid) {
  // Koleksiyonun tum belgelerini cek ve listeye map'le.
  const col = collection(db, "users", uid, "favorites");
  const snap = await getDocs(col);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// WATCHLIST
export async function addWatchlist(uid, item) {
  const ref = doc(db, "users", uid, "watchlist", String(item.id));
  await setDoc(ref, { ...item, createdAt: serverTimestamp() }, { merge: true });
}

export async function removeWatchlist(uid, itemId) {
  const ref = doc(db, "users", uid, "watchlist", String(itemId));
  await deleteDoc(ref);
}

export async function listWatchlist(uid) {
  const col = collection(db, "users", uid, "watchlist");
  const snap = await getDocs(col);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

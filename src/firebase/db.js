import { collection, deleteDoc, doc, getDocs, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "./firebase";

// FAVORITES
export async function addFavorite(uid, item) {
  const ref = doc(db, "users", uid, "favorites", String(item.id));
  await setDoc(ref, { ...item, createdAt: serverTimestamp() }, { merge: true });
}

export async function removeFavorite(uid, itemId) {
  const ref = doc(db, "users", uid, "favorites", String(itemId));
  await deleteDoc(ref);
}

export async function listFavorites(uid) {
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

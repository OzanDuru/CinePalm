// favoritesStorage.js
// Amaç: Favorileri AsyncStorage'da saklamak.
// Önemli fark: Her kullanıcı için ayrı storage key kullanıyoruz.
// Böylece kullanıcı değişince favoriler de değişir.
import AsyncStorage from "@react-native-async-storage/async-storage";

// Bu prefix sabit: her user'ın favori key'i bunun üstüne kurulacak.
const STORAGE_KEY_PREFIX = "cinepalm:favorites";

/**
 * keyForUser(userUid)
 * - AsyncStorage bir "key-value" (anahtar-değer) sistemidir.
 * - Aynı key'e yazarsan herkes aynı listeyi görür.
 * - Bu yüzden key'i userUid ile özelleştiriyoruz.
 *
 * Örnek:
 * - userUid = "abc123"  -> "cinepalm:favorites:abc123"
 * - userUid yoksa       -> "cinepalm:favorites:guest" (misafir mod)
 */
function keyForUser(userUid) {
  return userUid
    ? `${STORAGE_KEY_PREFIX}:${userUid}`
    : `${STORAGE_KEY_PREFIX}:guest`;
}

/**
 * readFavorites(userUid)
 * - Storage'dan favoriler listesini okur.
 * - Storage'da JSON string tutulur, bu string JSON.parse ile diziye çevrilir.
 * - Bozuk veri / parse hatasında boş dizi döndürerek uygulamayı crash'ten korur.
 */
async function readFavorites(userUid) {
  // 1) Bu user'a ait key ile oku
  const raw = await AsyncStorage.getItem(keyForUser(userUid));

  // 2) Hiç kayıt yoksa boş dizi dön
  if (!raw) return [];

  // 3) JSON string -> JS array
  try {
    const parsed = JSON.parse(raw);

    // 4) Beklediğimiz veri türü array olmalı. Değilse boş dön.
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // JSON bozuksa uygulama patlamasın diye boş dön
    return [];
  }
}

/**
 * writeFavorites(userUid, favorites)
 * - Favoriler dizisini ilgili kullanıcı key'ine JSON string olarak kaydeder.
 */
async function writeFavorites(userUid, favorites) {
  await AsyncStorage.setItem(
    keyForUser(userUid),
    JSON.stringify(favorites)
  );
}

/**
 * getFavorites(userUid)
 * - UI tarafı "favori listesini getir" dediğinde çağırır.
 */
export async function getFavorites(userUid) {
  return readFavorites(userUid);
}

/**
 * isFavorite(userUid, id)
 * - Bu film favorilerde var mı? true/false döndürür.
 * - String karşılaştırma: id bazen number bazen string gelebilir diye.
 */
export async function isFavorite(userUid, id) {
  const favorites = await readFavorites(userUid);
  return favorites.some((item) => String(item.id) === String(id));
}

/**
 * addFavorite(userUid, movie)
 * - Favoriye ekler (zaten varsa eklemez).
 * - unshift: liste başına koyar (en yeni favori en üstte görünsün).
 */
export async function addFavorite(userUid, movie) {
  const favorites = await readFavorites(userUid);

  const exists = favorites.some(
    (item) => String(item.id) === String(movie.id)
  );

  if (!exists) {
    favorites.unshift(movie);
    await writeFavorites(userUid, favorites);
  }

  return favorites;
}

/**
 * removeFavorite(userUid, id)
 * - Favorilerden çıkarır ve güncel listeyi kaydeder.
 */
export async function removeFavorite(userUid, id) {
  const favorites = await readFavorites(userUid);

  const updated = favorites.filter(
    (item) => String(item.id) !== String(id)
  );

  await writeFavorites(userUid, updated);
  return updated;
}

/**
 * toggleFavorite(userUid, movie)
 * - Tek butonla ekle/çıkar.
 * - exists=true ise çıkarır, false ise ekler.
 * - Geri { favorites, isFavorite } döndürür (UI hemen güncellensin diye)
 */
export async function toggleFavorite(userUid, movie) {
  const favorites = await readFavorites(userUid);

  const exists = favorites.some(
    (item) => String(item.id) === String(movie.id)
  );

  const updated = exists
    ? favorites.filter((item) => String(item.id) !== String(movie.id))
    : [movie, ...favorites];

  await writeFavorites(userUid, updated);

  return {
    favorites: updated,
    isFavorite: !exists,
  };
}

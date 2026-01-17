// favoritePeopleStorage.js
// Amaç: Favori kişiler AsyncStorage'da saklanır (kullanıcıya özel).
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY_PREFIX = "cinepalm:favorite_people";

function keyForUser(userUid) {
  return userUid
    ? `${STORAGE_KEY_PREFIX}:${userUid}`
    : `${STORAGE_KEY_PREFIX}:guest`;
}

async function readFavorites(userUid) {
  const raw = await AsyncStorage.getItem(keyForUser(userUid));
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeFavorites(userUid, favorites) {
  await AsyncStorage.setItem(keyForUser(userUid), JSON.stringify(favorites));
}

export async function getFavoritePeople(userUid) {
  return readFavorites(userUid);
}

export async function isFavoritePerson(userUid, personId) {
  const favorites = await readFavorites(userUid);
  return favorites.some((item) => String(item.id) === String(personId));
}

export async function toggleFavoritePerson(userUid, personObj) {
  const favorites = await readFavorites(userUid);
  const exists = favorites.some(
    (item) => String(item.id) === String(personObj.id)
  );

  const updated = exists
    ? favorites.filter((item) => String(item.id) !== String(personObj.id))
    : [personObj, ...favorites];

  await writeFavorites(userUid, updated);

  return {
    favorites: updated,
    isFavorite: !exists,
  };
}

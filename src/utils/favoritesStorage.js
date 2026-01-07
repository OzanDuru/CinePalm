import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "cinepalm:favorites";

async function readFavorites() {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

async function writeFavorites(favorites) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
}

export async function getFavorites() {
  return readFavorites();
}

export async function isFavorite(id) {
  const favorites = await readFavorites();
  return favorites.some((item) => String(item.id) === String(id));
}

export async function addFavorite(movie) {
  const favorites = await readFavorites();
  const exists = favorites.some((item) => String(item.id) === String(movie.id));
  if (!exists) {
    favorites.unshift(movie);
    await writeFavorites(favorites);
  }
  return favorites;
}

export async function removeFavorite(id) {
  const favorites = await readFavorites();
  const updated = favorites.filter((item) => String(item.id) !== String(id));
  await writeFavorites(updated);
  return updated;
}

export async function toggleFavorite(movie) {
  const favorites = await readFavorites();
  const exists = favorites.some((item) => String(item.id) === String(movie.id));
  const updated = exists
    ? favorites.filter((item) => String(item.id) !== String(movie.id))
    : [movie, ...favorites];
  await writeFavorites(updated);
  return { favorites: updated, isFavorite: !exists };
}

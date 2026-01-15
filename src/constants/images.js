export const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

export function buildPosterUrl(path) {
  if (!path) return null;
  return `${IMAGE_BASE_URL}${path}`;
}

const TMDB_IMAGES_BASE = "https://image.tmdb.org/t/p";

export function buildCastPhotoUrl(path, size = "w185") {
  if (!path) return null;
  return `${TMDB_IMAGES_BASE}/${size}${path}`;
}

export function buildBackdropUrl(path, size = "w780") {
  if (!path) return null;
  return `${TMDB_IMAGES_BASE}/${size}${path}`;
}
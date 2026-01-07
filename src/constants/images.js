export const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

export function buildPosterUrl(path) {
  if (!path) return null;
  return `${IMAGE_BASE_URL}${path}`;
}

import { request } from "./tmdbClient";

export function getTrendingMovies(timeWindow = "day", page = 1) {
  return request(`/trending/movie/${timeWindow}`, { params: { page } });
}

export function getPopularMovies(page = 1) {
  return request("/movie/popular", { params: { page } });
}

export function getTopRatedMovies(page = 1) {
  return request("/movie/top_rated", { params: { page } });
}

export function searchMovies(query, page = 1) {
  if (!query) {
    return Promise.resolve({ results: [], page: 1, total_pages: 0, total_results: 0 });
  }
  return request("/search/movie", { params: { query, page, include_adult: false } });
}

export function getMovieDetails(id) {
  return request(`/movie/${id}`);
}

export function getGenres() {
  return request("/genre/movie/list");
}

export function getMovieCredits(id) {
  return request(`/movie/${id}/credits`);
}

export function getMovieImages(id) {
  return request(`/movie/${id}/images`);
}

export function getMovieVideos(id) {
  return request(`/movie/${id}/videos`);
}

export function getMovieExternalIds(id) {
  return request(`/movie/${id}/external_ids`);
}

// --- People / Person endpoints ---
export function getPersonDetails(personId) {
  return request(`/person/${personId}`);
}

export function getPersonMovieCredits(personId) {
  return request(`/person/${personId}/movie_credits`);
}

export function getPersonImages(personId) {
  return request(`/person/${personId}/images`);
}

export function searchPeople(query, page = 1) {
  if (!query) {
    return Promise.resolve({ results: [], page: 1, total_pages: 0, total_results: 0 });
  }
  return request("/search/person", { params: { query, page, include_adult: false } });
}

// Optional: TV credits if needed later
export function getPersonTvCredits(personId) {
  return request(`/person/${personId}/tv_credits`);
}

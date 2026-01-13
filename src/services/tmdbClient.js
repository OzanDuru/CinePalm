import { ENV, validateEnv } from "../config/env";

function normalizeBaseUrl(url) { 
  if (!url) return "";
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

async function parseJsonSafely(response) {
  try {
    return await response.json();
  } catch (error) {
    return null;
  }
}

export async function request(path, { method = "GET", params, body } = {}) {
  validateEnv();

  const baseUrl = normalizeBaseUrl(ENV.apiBaseUrl);
  const url = new URL(`${baseUrl}${path}`);

  if (params) { // Query parametrelerini ekle -> "https://api.themoviedb.org/3/search/movie?query=batman&page=1&language=tr-TR"

    for (const [key, value] of Object.entries(params)) {
      if (value != null && value !== "") {
        url.searchParams.append(key, String(value));
      }
    }
  }


  const response = await fetch(url.toString(), {
    method,
    headers: {
      Authorization: `Bearer ${ENV.apiReadToken}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await parseJsonSafely(response);

  if (!response.ok) {
    const message = data?.status_message || "TMDB request failed.";
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

const requiredEnv = [
  "EXPO_PUBLIC_API_BASE_URL",
  "EXPO_PUBLIC_API_KEY",
  "EXPO_PUBLIC_API_READ_TOKEN",
];

function getMissingEnv() {
  return requiredEnv.filter((key) => !process.env[key]);
}

export function validateEnv() {
  const missing = getMissingEnv();
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}. ` +
        "Set them in your local .env (do not commit secrets)."
    );
  }
}

export const ENV = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
  apiKey: process.env.EXPO_PUBLIC_API_KEY,
  apiReadToken: process.env.EXPO_PUBLIC_API_READ_TOKEN,
};

const API_BASE_URL_ENV_NAME = "EXPO_PUBLIC_API_BASE_URL";

const removeTrailingSlashes = (value: string) => value.replace(/\/+$/, "");

export function getApiBaseUrlFromEnv(envValue = process.env.EXPO_PUBLIC_API_BASE_URL): string {
  const rawValue = envValue?.trim();
  if (!rawValue) {
    throw new Error(`${API_BASE_URL_ENV_NAME} is required`);
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawValue);
  } catch {
    throw new Error(
      `${API_BASE_URL_ENV_NAME} must be a valid URL, for example http://localhost:4000`
    );
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    throw new Error(`${API_BASE_URL_ENV_NAME} must use http or https`);
  }

  return removeTrailingSlashes(rawValue);
}

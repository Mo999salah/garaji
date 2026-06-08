import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

interface SavedLoginCredentials {
  email: string;
  password: string;
}

const CREDENTIALS_KEY = "garaji.saved-login";
const SECURE_STORE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainService: "garaji.auth.credentials",
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

function isValidCredentials(value: unknown): value is SavedLoginCredentials {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;
  return typeof record.email === "string" && typeof record.password === "string";
}

export async function canSaveLoginCredentials() {
  if (Platform.OS === "web") {
    return false;
  }

  return SecureStore.isAvailableAsync();
}

export async function loadSavedLoginCredentials(): Promise<SavedLoginCredentials | null> {
  if (!(await canSaveLoginCredentials())) {
    return null;
  }

  const rawValue = await SecureStore.getItemAsync(CREDENTIALS_KEY, SECURE_STORE_OPTIONS);

  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as unknown;
    return isValidCredentials(parsed) ? parsed : null;
  } catch {
    await clearSavedLoginCredentials();
    return null;
  }
}

export async function saveLoginCredentials(credentials: SavedLoginCredentials) {
  if (!(await canSaveLoginCredentials())) {
    return;
  }

  await SecureStore.setItemAsync(
    CREDENTIALS_KEY,
    JSON.stringify({
      email: credentials.email.trim(),
      password: credentials.password,
    }),
    SECURE_STORE_OPTIONS,
  );
}

export async function clearSavedLoginCredentials() {
  if (!(await canSaveLoginCredentials())) {
    return;
  }

  await SecureStore.deleteItemAsync(CREDENTIALS_KEY, SECURE_STORE_OPTIONS);
}

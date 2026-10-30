import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// Saves the login token securely.
// On a phone, SecureStore uses the encrypted Keychain (iOS) / Keystore (Android).
// SecureStore doesn't exist on the web, so there we fall back to localStorage.

export async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  return SecureStore.getItemAsync(key);
}

export async function setItem(key: string, value: string | null) {
  if (Platform.OS === "web") {
    try {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    } catch {
      // storage unavailable (private mode); the user just stays logged in for this session
    }
    return;
  }
  if (value === null) await SecureStore.deleteItemAsync(key);
  else await SecureStore.setItemAsync(key, value);
}

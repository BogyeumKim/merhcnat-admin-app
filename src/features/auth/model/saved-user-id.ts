import * as SecureStore from 'expo-secure-store';

const SAVED_USER_ID_KEY = 'login.savedUserId';

/**
 * "아이디 저장": only the account ID is kept on the device (never the password), in the Keychain / Keystore through
 * `expo-secure-store`, not in the plain key-value store. A failure to read or write is never an error for the user:
 * the field is simply empty next time.
 */
export async function loadSavedUserId(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(SAVED_USER_ID_KEY);
  } catch {
    return null;
  }
}

/** Keeps the ID when the box is checked, forgets it when it is not. */
export async function rememberUserId(userId: string, remember: boolean): Promise<void> {
  try {
    if (remember) {
      await SecureStore.setItemAsync(SAVED_USER_ID_KEY, userId, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
    } else {
      await SecureStore.deleteItemAsync(SAVED_USER_ID_KEY);
    }
  } catch {
    // Not worth interrupting a sign-in for.
  }
}

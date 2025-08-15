// Centralized environment variable access for client IDs and other public config

export const GOOGLE_IOS_CLIENT_ID = process.env
  .EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID as string | undefined;

export const GOOGLE_ANDROID_CLIENT_ID = process.env
  .EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID as string | undefined;

export const GOOGLE_WEB_CLIENT_ID = process.env
  .EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID as string | undefined;

// Optional helper to ensure required vars exist in development
export function assertEnvPresent() {
  if (__DEV__) {
    if (!GOOGLE_IOS_CLIENT_ID) console.warn("Missing GOOGLE_IOS_CLIENT_ID");
    if (!GOOGLE_ANDROID_CLIENT_ID)
      console.warn("Missing GOOGLE_ANDROID_CLIENT_ID");
    if (!GOOGLE_WEB_CLIENT_ID) console.warn("Missing GOOGLE_WEB_CLIENT_ID");
  }
}



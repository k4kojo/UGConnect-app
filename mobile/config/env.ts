// Google OAuth Configuration
export const GOOGLE_IOS_CLIENT_ID = process.env
  .EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID as string | undefined;

export const GOOGLE_ANDROID_CLIENT_ID = process.env
  .EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID as string | undefined;

export const GOOGLE_WEB_CLIENT_ID = process.env
  .EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID as string | undefined;

// Paystack Configuration
export const PAYSTACK_PUBLIC_KEY = process.env
  .EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY as string | undefined;

export const PAYSTACK_SECRET_KEY = process.env
  .EXPO_PUBLIC_PAYSTACK_SECRET_KEY as string | undefined;

// Optional helper to ensure required vars exist in development
export function assertEnvPresent() {
  if (__DEV__) {
    // Google OAuth
    if (!GOOGLE_IOS_CLIENT_ID) console.warn("Missing GOOGLE_IOS_CLIENT_ID");
    if (!GOOGLE_ANDROID_CLIENT_ID)
      console.warn("Missing GOOGLE_ANDROID_CLIENT_ID");
    if (!GOOGLE_WEB_CLIENT_ID) console.warn("Missing GOOGLE_WEB_CLIENT_ID");
    
    // Paystack
    if (!PAYSTACK_PUBLIC_KEY) console.warn("Missing PAYSTACK_PUBLIC_KEY");
  }
}



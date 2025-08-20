import { signOutUser } from "@/firebase/authService";
import { logoutUser } from "@/services/authService";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import { Alert } from "react-native";

export function useHandleLogout() {
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = useCallback(async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      const [firebaseRes, apiRes] = await Promise.allSettled([
        signOutUser(),
        logoutUser(),
      ]);

      const firebaseOk =
        firebaseRes.status === "fulfilled" && firebaseRes.value.success;
      const apiOk = apiRes.status === "fulfilled" && apiRes.value.success;

      if (firebaseOk || apiOk) {
        router.replace("/(auth)/sign-in");
      } else {
        const errMsg =
          (firebaseRes.status === "fulfilled" && !firebaseRes.value.success
            ? firebaseRes.value.error
            : null) ||
          (apiRes.status === "fulfilled" && !apiRes.value.success
            ? apiRes.value.error
            : null) ||
          "Unknown error";
        Alert.alert("Logout Failed", errMsg);
      }
    } finally {
      setLoggingOut(false);
    }
  }, [loggingOut]);

  return { loggingOut, handleLogout };
}
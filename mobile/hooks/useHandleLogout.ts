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
      const res = await logoutUser();
      if (res.success) {
        router.replace("/(auth)/sign-in");
      } else {
        Alert.alert("Logout Failed", res.error || "Unknown error");
      }
    } finally {
      setLoggingOut(false);
    }
  }, [loggingOut]);

  return { loggingOut, handleLogout };
}
import store, { prefetchInitialData } from "@/redux/store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect, Stack, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { Provider } from "react-redux";

import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/context/ThemeContext";

function AuthGate({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);
  const segments = useSegments();
  const root = segments[0] as string | undefined;
  const inPublicGroup = root === "(auth)" || root === "accountRecovery"; // allow password recovery when not authed

  useEffect(() => {
    const check = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        const authed = !!token;
        setIsAuthed(authed);
        if (authed) {
          // Prefetch core data once at startup/login
          // We cannot use hooks here, so dispatch directly from the store
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          prefetchInitialData(store.dispatch);
        }
      } finally {
        setLoading(false);
      }
    };
    check();
  }, [segments]);

  if (loading) return null;
  if (isAuthed && root === "(auth)") return <Redirect href="/tabs" />;
  if (!isAuthed && !inPublicGroup) return <Redirect href="/(auth)/sign-in" />;
  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <>
      <Provider store={store}>
        <ThemeProvider>
          <LanguageProvider>
            <AuthGate>
              <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" options={{ gestureEnabled: false }} />
              <Stack.Screen name="tabs" options={{ gestureEnabled: false }} />
              </Stack>
            </AuthGate>
          </LanguageProvider>
          <StatusBar style="auto" />
        </ThemeProvider>
      </Provider>
    </>
  );
}

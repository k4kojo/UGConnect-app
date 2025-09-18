import { Stack } from 'expo-router';
import React from 'react';

export default function MedicationLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="analytics" />
      <Stack.Screen name="details/[id]" />
      <Stack.Screen name="log/[id]" />
    </Stack>
  );
}

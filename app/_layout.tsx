import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" backgroundColor="#050a05" />
      <Stack screenOptions={{ headerShown: false, animation: 'none' }} />
    </>
  );
}

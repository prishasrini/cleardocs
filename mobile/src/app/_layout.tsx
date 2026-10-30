import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "@/lib/auth";
import { colors } from "@/constants/theme";

// Keep the splash screen up until we know whether the user is logged in
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <RootNavigator />
    </AuthProvider>
  );
}

function RootNavigator() {
  const { token, isLoading } = useAuth();

  if (isLoading) return null; // splash screen still showing
  SplashScreen.hide();

  // Protected routes: logged-in users only see the (app) screens,
  // logged-out users only see sign-in and sign-up. Expo Router
  // switches between them automatically when the token changes.
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.paper } }}>
      <Stack.Protected guard={!!token}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={!token}>
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="sign-up" options={{ animation: "slide_from_right" }} />
      </Stack.Protected>
    </Stack>
  );
}

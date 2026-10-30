import { Stack } from "expo-router";
import { colors } from "@/constants/theme";

// Screens for logged-in users: the tabs, plus detail screens that open on top of them
export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.ink,
        headerStyle: { backgroundColor: colors.paper },
        headerShadowVisible: false,
        headerBackTitle: "Back",
        contentStyle: { backgroundColor: colors.paper },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="service/[slug]" options={{ title: "New request" }} />
      <Stack.Screen name="request/[id]" options={{ title: "Request" }} />
    </Stack>
  );
}

import Ionicons from "@expo/vector-icons/Ionicons";
import type { ColorValue } from "react-native";
import { Tabs } from "expo-router";
import { useAuth } from "@/lib/auth";
import { colors } from "@/constants/theme";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

// Filled icon for the selected tab, outline icon for the others
function TabIcon({ name, color, focused }: { name: IconName; color: ColorValue; focused: boolean }) {
  return <Ionicons name={focused ? name : (`${name}-outline` as IconName)} size={24} color={color as string} />;
}

const icon = (name: IconName) => {
  const Icon = (props: { color: ColorValue; focused: boolean }) => <TabIcon name={name} {...props} />;
  Icon.displayName = `TabIcon(${name})`;
  return Icon;
};

export default function TabsLayout() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.stamp,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.line },
        headerStyle: { backgroundColor: colors.paper },
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: "800", color: colors.ink },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Services", tabBarIcon: icon("documents") }} />
      <Tabs.Screen name="requests" options={{ title: "My requests", tabBarIcon: icon("time") }} />
      {/* The Admin tab only exists for admin accounts (href: null hides it) */}
      <Tabs.Screen
        name="admin"
        options={{ title: "Admin", tabBarIcon: icon("shield-checkmark"), href: isAdmin ? undefined : null }}
      />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: icon("person-circle") }} />
    </Tabs>
  );
}

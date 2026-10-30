import { Alert, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import Button from "@/components/Button";
import { API_URL } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { colors, radius, text } from "@/constants/theme";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const initials = user?.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  function confirmSignOut() {
    // Alert with buttons doesn't exist on the web, so ask with the browser's confirm there
    if (Platform.OS === "web") {
      if (window.confirm("Log out of ClearDocs?")) signOut();
      return;
    }
    Alert.alert("Log out?", "You'll need your password to log back in.", [
      { text: "Cancel", style: "cancel" },
      { text: "Log out", style: "destructive", onPress: signOut },
    ]);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={[text.heading, { marginTop: 14 }]}>{user?.name}</Text>
        <Text style={text.small}>{user?.email}</Text>
        {user?.role === "admin" && (
          <View style={styles.adminBadge}>
            <Text style={styles.adminText}>Admin</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={text.label}>Server</Text>
        <Text style={text.small}>{API_URL}</Text>
      </View>

      <Button title="Log out" variant="secondary" onPress={confirmSignOut} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 16 },
  card: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 24,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.stampSoft,
    borderWidth: 2,
    borderColor: colors.stamp,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 24, fontWeight: "800", color: colors.stamp },
  adminBadge: {
    marginTop: 10,
    backgroundColor: colors.ink,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  adminText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  info: { gap: 4, paddingHorizontal: 4 },
});

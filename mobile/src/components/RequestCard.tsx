import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { colors, radius, text } from "@/constants/theme";
import { formatDate } from "@/lib/format";
import type { DocRequest } from "@/lib/types";
import StatusBadge from "./StatusBadge";

// One request in a list. Cards slide in one after another.
export default function RequestCard({
  request,
  index,
  showUser,
}: {
  request: DocRequest;
  index: number;
  showUser?: boolean;
}) {
  const userName = typeof request.user === "object" ? request.user.name : null;

  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 60).duration(350)}>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push({ pathname: "/request/[id]", params: { id: request._id } })}
        style={({ pressed }) => [styles.card, pressed && { transform: [{ scale: 0.98 }], borderColor: colors.stamp }]}
      >
        <View style={styles.top}>
          <Text style={[text.heading, { fontSize: 17, flex: 1 }]} numberOfLines={1}>
            {request.service.title}
          </Text>
          <StatusBadge status={request.status} />
        </View>
        <Text style={text.small}>
          {showUser && userName ? `${userName} · ` : ""}
          {request.files.length} {request.files.length === 1 ? "file" : "files"} · {formatDate(request.createdAt)}
        </Text>
        <Text style={styles.ref}>#{request._id.slice(-6).toUpperCase()}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
    gap: 6,
  },
  top: { flexDirection: "row", alignItems: "center", gap: 10 },
  ref: { fontSize: 12, color: colors.muted, fontVariant: ["tabular-nums"] },
});

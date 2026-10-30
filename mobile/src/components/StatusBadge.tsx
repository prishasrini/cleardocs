import { StyleSheet, Text, View } from "react-native";
import { STATUS_INFO } from "@/lib/format";
import type { RequestStatus } from "@/lib/types";

export default function StatusBadge({ status }: { status: RequestStatus }) {
  const info = STATUS_INFO[status];
  return (
    <View style={[styles.badge, { backgroundColor: info.bg }]}>
      <View style={[styles.dot, { backgroundColor: info.color }]} />
      <Text style={[styles.text, { color: info.color }]}>{info.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
  text: { fontSize: 13, fontWeight: "700" },
});

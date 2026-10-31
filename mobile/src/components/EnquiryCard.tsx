import { useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { colors, radius, text } from "@/constants/theme";
import { formatDate } from "@/lib/format";
import type { Enquiry } from "@/lib/types";

// "document-attestation" -> "Document attestation"
function serviceLabel(slug?: string) {
  if (!slug) return "General question";
  const words = slug.replace(/-/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

// One contact form message. Tap the card to show the full message; tap email or phone to reply.
export default function EnquiryCard({ enquiry, index }: { enquiry: Enquiry; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 60).duration(350)}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={() => setExpanded((open) => !open)}
        style={({ pressed }) => [styles.card, pressed && { borderColor: colors.stamp }]}
      >
        <View style={styles.top}>
          <Text style={[text.heading, { fontSize: 17, flex: 1 }]} numberOfLines={1}>
            {enquiry.name}
          </Text>
          <Text style={styles.date}>{formatDate(enquiry.createdAt)}</Text>
        </View>
        <Text style={styles.service}>{serviceLabel(enquiry.service)}</Text>
        <Text style={text.body} numberOfLines={expanded ? undefined : 2}>
          {enquiry.message}
        </Text>

        {expanded && (
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="link"
              onPress={() => Linking.openURL(`mailto:${enquiry.email}?subject=Your ClearDocs enquiry`)}
              style={styles.action}
            >
              <Ionicons name="mail-outline" size={18} color={colors.stamp} />
              <Text style={styles.actionText} numberOfLines={1}>
                {enquiry.email}
              </Text>
            </Pressable>
            {!!enquiry.phone && (
              <Pressable
                accessibilityRole="link"
                onPress={() => Linking.openURL(`tel:${enquiry.phone!.replace(/\s/g, "")}`)}
                style={styles.action}
              >
                <Ionicons name="call-outline" size={18} color={colors.stamp} />
                <Text style={styles.actionText}>{enquiry.phone}</Text>
              </Pressable>
            )}
          </View>
        )}
        {!expanded && <Text style={styles.hint}>Tap to read and reply</Text>}
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
  date: { fontSize: 13, color: colors.muted },
  service: { fontSize: 13, fontWeight: "700", color: colors.stamp },
  actions: { marginTop: 8, gap: 8, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 10 },
  action: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 4 },
  actionText: { fontSize: 15, fontWeight: "600", color: colors.stamp, flexShrink: 1 },
  hint: { fontSize: 12, color: colors.muted },
});

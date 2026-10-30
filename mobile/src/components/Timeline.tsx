import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInLeft, useAnimatedStyle, useSharedValue, withDelay, withTiming } from "react-native-reanimated";
import { colors, text } from "@/constants/theme";
import { formatDate, STATUS_INFO, STATUS_ORDER } from "@/lib/format";
import type { DocRequest } from "@/lib/types";

// Shows every stage of a request. Finished stages fill in with an animation.
export default function Timeline({ request }: { request: DocRequest }) {
  const rejected = request.status === "rejected";
  const currentIndex = rejected ? -1 : STATUS_ORDER.indexOf(request.status);

  // When was each stage reached? (the latest history entry for that status)
  const reachedAt = (status: string) => [...request.history].reverse().find((h) => h.status === status);

  const stages = rejected ? [...STATUS_ORDER.slice(0, 2), "rejected" as const] : STATUS_ORDER;

  return (
    <View>
      {stages.map((status, i) => {
        const done = rejected ? status === "rejected" || !!reachedAt(status) : i <= currentIndex;
        const entry = reachedAt(status);
        const isLast = i === stages.length - 1;
        const info = STATUS_INFO[status];
        const nextDone =
          !isLast && (rejected ? !!reachedAt(stages[i + 1]) || stages[i + 1] === "rejected" : i + 1 <= currentIndex);

        return (
          <Animated.View key={status} entering={FadeInLeft.delay(i * 90).duration(350)} style={styles.row}>
            <View style={styles.rail}>
              <Dot done={done} color={status === "rejected" ? colors.danger : colors.stamp} delay={i * 150} />
              {!isLast && <Line filled={nextDone} delay={i * 150 + 150} />}
            </View>
            <View style={[styles.content, !done && { opacity: 0.45 }]}>
              <Text style={[text.label, { fontSize: 15 }]}>{info.label}</Text>
              {entry?.note ? <Text style={text.small}>{entry.note}</Text> : null}
              {entry ? <Text style={styles.when}>{formatDate(entry.at, true)}</Text> : null}
            </View>
          </Animated.View>
        );
      })}
    </View>
  );
}

function Dot({ done, color, delay }: { done: boolean; color: string; delay: number }) {
  const scale = useSharedValue(0.6);
  useEffect(() => {
    scale.value = withDelay(delay, withTiming(done ? 1 : 0.8, { duration: 300 }));
  }, [done, delay, scale]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View
      style={[
        styles.dot,
        style,
        done
          ? { backgroundColor: color, borderColor: color }
          : { backgroundColor: colors.surface, borderColor: colors.line },
      ]}
    />
  );
}

// The connecting line grows downward when the next stage is reached
function Line({ filled, delay }: { filled: boolean; delay: number }) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withDelay(delay, withTiming(filled ? 1 : 0, { duration: 450 }));
  }, [filled, delay, progress]);
  const style = useAnimatedStyle(() => ({ height: `${progress.value * 100}%` }));

  return (
    <View style={styles.line}>
      <Animated.View style={[styles.lineFill, style]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 14, minHeight: 64 },
  rail: { alignItems: "center", width: 18 },
  dot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2.5, marginTop: 2 },
  line: { flex: 1, width: 2.5, backgroundColor: colors.line, marginVertical: 3, borderRadius: 2, overflow: "hidden" },
  lineFill: { width: "100%", backgroundColor: colors.stamp },
  content: { flex: 1, paddingBottom: 18, gap: 2 },
  when: { fontSize: 12, color: colors.muted, marginTop: 2 },
});

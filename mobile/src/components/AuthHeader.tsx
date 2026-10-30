import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring } from "react-native-reanimated";
import { colors, text } from "@/constants/theme";

// The top of the sign-in and sign-up screens: a violet "stamp" that presses down, then the title
export default function AuthHeader({ title, subtitle }: { title: string; subtitle: string }) {
  const scale = useSharedValue(1.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(150, withSpring(1, { damping: 9, stiffness: 160 }));
    opacity.value = withDelay(150, withSpring(1));
  }, [scale, opacity]);

  const stampStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }, { rotate: "-8deg" }],
  }));

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.stamp, stampStyle]}>
        <View style={styles.stampInner}>
          <Text style={styles.stampText}>Clear</Text>
          <Text style={styles.stampText}>Docs</Text>
        </View>
      </Animated.View>
      <Text style={[text.title, { marginTop: 28 }]}>{title}</Text>
      <Text style={[text.body, { marginTop: 6 }]}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 28 },
  stamp: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 3,
    borderColor: colors.stamp,
    padding: 4,
  },
  stampInner: {
    flex: 1,
    borderRadius: 40,
    borderWidth: 1.5,
    borderColor: colors.stamp,
    alignItems: "center",
    justifyContent: "center",
  },
  stampText: { color: colors.stamp, fontWeight: "800", fontSize: 15, lineHeight: 17 },
});

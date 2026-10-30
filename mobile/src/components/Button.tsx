import { ActivityIndicator, Pressable, StyleSheet, Text, type PressableProps } from "react-native";
import { colors, radius } from "@/constants/theme";

type Props = PressableProps & {
  title: string;
  variant?: "primary" | "secondary";
  loading?: boolean;
};

// The app's main button. It shrinks slightly while pressed so taps feel physical.
export default function Button({ title, variant = "primary", loading, disabled, style, ...rest }: Props) {
  const isPrimary = variant === "primary";
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      style={(state) => [
        styles.base,
        isPrimary ? styles.primary : styles.secondary,
        state.pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 },
        (disabled || loading) && { opacity: 0.55 },
        typeof style === "function" ? style(state) : style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? "#fff" : colors.ink} />
      ) : (
        <Text style={[styles.text, { color: isPrimary ? "#fff" : colors.ink }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
  },
  primary: { backgroundColor: colors.ink },
  secondary: { borderWidth: 1.5, borderColor: colors.ink, backgroundColor: "transparent" },
  text: { fontSize: 16, fontWeight: "700" },
});

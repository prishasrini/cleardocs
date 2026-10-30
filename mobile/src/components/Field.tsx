import { useState } from "react";
import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import { colors, radius, text } from "@/constants/theme";

type Props = TextInputProps & { label: string; error?: string };

// A labelled text input with an error message underneath
export default function Field({ label, error, style, ...rest }: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrap}>
      <Text style={text.label}>{label}</Text>
      <TextInput
        {...rest}
        placeholderTextColor={colors.muted}
        onFocus={(e) => {
          setFocused(true);
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          rest.onBlur?.(e);
        }}
        accessibilityLabel={label}
        style={[
          styles.input,
          focused && styles.focused,
          !!error && styles.invalid,
          rest.multiline && { minHeight: 96, textAlignVertical: "top" },
          style,
        ]}
      />
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  input: {
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.ink,
  },
  focused: { borderColor: colors.stamp },
  invalid: { borderColor: colors.danger },
  error: { color: colors.danger, fontSize: 13 },
});

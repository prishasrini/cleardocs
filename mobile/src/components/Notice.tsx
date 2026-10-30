import { StyleSheet, Text, View } from "react-native";
import { colors, radius } from "@/constants/theme";
import Button from "./Button";

type Props = {
  title: string;
  message?: string;
  tone?: "neutral" | "error";
  actionTitle?: string;
  onAction?: () => void;
};

// Used for empty lists and error messages, always with a next step
export default function Notice({ title, message, tone = "neutral", actionTitle, onAction }: Props) {
  const isError = tone === "error";
  return (
    <View style={[styles.box, isError && { backgroundColor: colors.dangerSoft, borderColor: "transparent" }]}>
      <Text style={[styles.title, isError && { color: colors.danger }]}>{title}</Text>
      {!!message && <Text style={[styles.message, isError && { color: colors.danger }]}>{message}</Text>}
      {!!actionTitle && onAction && (
        <Button
          title={actionTitle}
          variant="secondary"
          onPress={onAction}
          style={{ marginTop: 14, alignSelf: "flex-start" }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 18,
  },
  title: { fontSize: 16, fontWeight: "700", color: colors.ink },
  message: { fontSize: 14, color: colors.muted, marginTop: 4, lineHeight: 20 },
});

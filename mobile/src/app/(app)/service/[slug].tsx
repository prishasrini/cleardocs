import { useCallback, useState } from "react";
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, Stack, useLocalSearchParams } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import Ionicons from "@expo/vector-icons/Ionicons";
import Animated, { FadeIn, FadeOut, LinearTransition } from "react-native-reanimated";
import Button from "@/components/Button";
import Field from "@/components/Field";
import Notice from "@/components/Notice";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatPrice, formatSize } from "@/lib/format";
import { useLoad } from "@/lib/useLoad";
import { colors, radius, text } from "@/constants/theme";

const MAX_FILES = 5;
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB, the same limit as the backend

// The "start a request" screen: service details, file picker, notes, submit
export default function NewRequestScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { token } = useAuth();
  const load = useCallback(() => api.services().then((all) => all.find((s) => s.slug === slug) ?? null), [slug]);
  const { data: service, error: loadError, loading } = useLoad(load);

  const [files, setFiles] = useState<DocumentPicker.DocumentPickerAsset[]>([]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function pickFiles() {
    setError("");
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "image/jpeg", "image/png", "image/webp"],
      multiple: true,
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;

    const tooBig = result.assets.filter((a) => (a.size ?? 0) > MAX_SIZE);
    const ok = result.assets.filter((a) => (a.size ?? 0) <= MAX_SIZE);
    const combined = [...files, ...ok].slice(0, MAX_FILES);

    if (tooBig.length) setError(`${tooBig.map((f) => f.name).join(", ")} is larger than 5 MB and was skipped.`);
    else if (files.length + ok.length > MAX_FILES) setError(`You can attach up to ${MAX_FILES} files.`);
    setFiles(combined);
  }

  function removeFile(uri: string) {
    setFiles((current) => current.filter((f) => f.uri !== uri));
  }

  async function submit() {
    if (!service) return;
    if (files.length === 0) {
      setError("Attach at least one document.");
      return;
    }
    setError("");
    setSubmitting(true);

    // Files are sent as multipart/form-data, the same format a browser form upload uses
    const form = new FormData();
    form.append("serviceId", service._id);
    if (notes.trim()) form.append("notes", notes.trim());
    for (const f of files) {
      if (Platform.OS === "web" && f.file) {
        form.append("files", f.file); // on the web the picker gives us a real File
      } else {
        // On a phone, React Native uploads a file from its uri
        form.append("files", {
          uri: f.uri,
          name: f.name,
          type: f.mimeType ?? "application/octet-stream",
        } as unknown as Blob);
      }
    }

    try {
      const created = await api.createRequest(token!, form);
      // Replace this screen with the new request, so "back" goes to the services list
      router.replace({ pathname: "/request/[id]", params: { id: created._id, justCreated: "1" } });
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  }

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={colors.stamp} />;
  if (loadError || !service) {
    return (
      <View style={{ padding: 20 }}>
        <Notice tone="error" title="Couldn't open this service" message={loadError || "It may have been removed."} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: service.title }} />

      <View>
        <Text style={text.body}>{service.description}</Text>
        <View style={styles.meta}>
          <Text style={styles.metaItem}>From {formatPrice(service.startingPrice)}</Text>
          <Text style={styles.metaItem}>{service.turnaround}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={text.heading}>What to upload</Text>
        {service.requiredDocuments.map((doc) => (
          <View key={doc} style={styles.reqRow}>
            <Ionicons name="checkmark-circle" size={18} color={colors.stamp} />
            <Text style={text.body}>{doc}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.rowBetween}>
          <Text style={text.heading}>Your documents</Text>
          <Text style={text.small}>
            {files.length}/{MAX_FILES}
          </Text>
        </View>

        {files.map((f) => (
          <Animated.View
            key={f.uri}
            entering={FadeIn.duration(250)}
            exiting={FadeOut.duration(200)}
            layout={LinearTransition}
            style={styles.file}
          >
            <Ionicons
              name={f.mimeType === "application/pdf" ? "document-text" : "image"}
              size={24}
              color={colors.stamp}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.fileName} numberOfLines={1}>
                {f.name}
              </Text>
              {!!f.size && <Text style={text.small}>{formatSize(f.size)}</Text>}
            </View>
            <Pressable
              onPress={() => removeFile(f.uri)}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={`Remove ${f.name}`}
            >
              <Ionicons name="close-circle" size={24} color={colors.muted} />
            </Pressable>
          </Animated.View>
        ))}

        {files.length < MAX_FILES && (
          <Pressable
            onPress={pickFiles}
            accessibilityRole="button"
            style={({ pressed }) => [styles.dropzone, pressed && { backgroundColor: colors.stampSoft }]}
          >
            <Ionicons name="cloud-upload-outline" size={30} color={colors.stamp} />
            <Text style={styles.dropTitle}>{files.length ? "Add more files" : "Choose files"}</Text>
            <Text style={text.small}>PDF, JPG or PNG, up to 5 MB each</Text>
          </Pressable>
        )}
      </View>

      <Field
        label="Notes (optional)"
        value={notes}
        onChangeText={setNotes}
        multiline
        maxLength={1000}
        placeholder="For example: needed for a job in Dubai by 20 November"
      />

      {!!error && <Notice tone="error" title="Check your request" message={error} />}

      <Button title="Submit request" onPress={submit} loading={submitting} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 24, paddingBottom: 48 },
  meta: { flexDirection: "row", gap: 10, marginTop: 14 },
  metaItem: {
    backgroundColor: colors.stampSoft,
    color: colors.stamp,
    fontWeight: "700",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    overflow: "hidden",
  },
  section: { gap: 10 },
  reqRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  file: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: 12,
  },
  fileName: { fontSize: 15, fontWeight: "600", color: colors.ink },
  dropzone: {
    alignItems: "center",
    gap: 4,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.stamp,
    borderRadius: radius.lg,
    paddingVertical: 26,
    backgroundColor: colors.surface,
  },
  dropTitle: { fontSize: 16, fontWeight: "700", color: colors.stamp, marginTop: 4 },
});

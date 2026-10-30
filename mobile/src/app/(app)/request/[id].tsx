import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";
import Button from "@/components/Button";
import Field from "@/components/Field";
import Notice from "@/components/Notice";
import StatusBadge from "@/components/StatusBadge";
import Timeline from "@/components/Timeline";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatDate, formatSize, STATUS_INFO } from "@/lib/format";
import type { RequestStatus } from "@/lib/types";
import { useLoad } from "@/lib/useLoad";
import { colors, radius, text } from "@/constants/theme";

const ALL_STATUSES: RequestStatus[] = ["submitted", "in_review", "processing", "completed", "rejected"];

export default function RequestDetailScreen() {
  const { id, justCreated } = useLocalSearchParams<{ id: string; justCreated?: string }>();
  const { token, user } = useAuth();
  const load = useCallback(() => api.getRequest(token!, id), [token, id]);
  const { data: request, error, loading, refreshing, refresh, setData } = useLoad(load);
  const isAdmin = user?.role === "admin";

  // Admin status update
  const [newStatus, setNewStatus] = useState<RequestStatus | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  async function saveStatus() {
    if (!request || !newStatus) return;
    setSaving(true);
    setSaveError("");
    try {
      const updated = await api.updateStatus(token!, request._id, newStatus, note.trim() || undefined);
      setData(updated); // show the new status right away; the timeline animates the change
      setNewStatus(null);
      setNote("");
    } catch (err) {
      setSaveError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  // Files are private: ask the API for a short-lived link, then open it in the browser
  async function openFile(storedName: string) {
    try {
      const { url } = await api.fileLink(token!, id, storedName);
      await Linking.openURL(url);
    } catch (err) {
      Alert.alert("Couldn't open the file", (err as Error).message);
    }
  }

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={colors.stamp} />;
  if (error || !request) {
    return (
      <View style={{ padding: 20 }}>
        <Notice
          tone="error"
          title="Couldn't load this request"
          message={error}
          actionTitle="Try again"
          onAction={refresh}
        />
      </View>
    );
  }

  const info = STATUS_INFO[request.status];
  const customer = typeof request.user === "object" ? request.user : null;

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.stamp} />}
      keyboardShouldPersistTaps="handled"
    >
      {justCreated === "1" && (
        <Animated.View entering={ZoomIn.springify().damping(12)} style={styles.success}>
          <Ionicons name="checkmark-circle" size={26} color={colors.ok} />
          <View style={{ flex: 1 }}>
            <Text style={[text.label, { color: colors.ok }]}>Request submitted</Text>
            <Text style={[text.small, { color: colors.ok }]}>We&apos;ll review your scans within one working day.</Text>
          </View>
        </Animated.View>
      )}

      <Animated.View entering={FadeInDown.duration(350)} style={styles.header}>
        <Text style={text.small}>
          #{request._id.slice(-6).toUpperCase()} · {formatDate(request.createdAt)}
        </Text>
        <Text style={text.title}>{request.service.title}</Text>
        <StatusBadge status={request.status} />
        <Text style={[text.body, { marginTop: 4 }]}>{info.hint}</Text>
        {customer && isAdmin && (
          <Text style={text.small}>
            Customer: {customer.name} ({customer.email})
          </Text>
        )}
      </Animated.View>

      <View style={styles.card}>
        <Text style={[text.heading, { marginBottom: 16 }]}>Progress</Text>
        {/* key makes the timeline replay its animation after a status change */}
        <Timeline key={request.status + request.history.length} request={request} />
      </View>

      <View style={styles.card}>
        <Text style={[text.heading, { marginBottom: 8 }]}>Documents</Text>
        {request.files.map((f) => (
          <Pressable
            key={f.storedName}
            accessibilityRole="link"
            onPress={() => openFile(f.storedName)}
            style={styles.fileRow}
          >
            <Ionicons
              name={f.mimeType === "application/pdf" ? "document-text" : "image"}
              size={22}
              color={colors.stamp}
            />
            <Text style={styles.fileName} numberOfLines={1}>
              {f.originalName}
            </Text>
            <Text style={text.small}>{formatSize(f.size)}</Text>
          </Pressable>
        ))}
        {!!request.notes && (
          <View style={{ marginTop: 12 }}>
            <Text style={text.label}>Your notes</Text>
            <Text style={[text.body, { marginTop: 4 }]}>{request.notes}</Text>
          </View>
        )}
      </View>

      {isAdmin && (
        <View style={[styles.card, { borderColor: colors.ink }]}>
          <Text style={text.heading}>Update status</Text>
          <Text style={[text.small, { marginTop: 2, marginBottom: 12 }]}>
            The customer sees the change straight away.
          </Text>
          <View style={styles.chips}>
            {ALL_STATUSES.filter((s) => s !== request.status).map((s) => {
              const active = s === newStatus;
              return (
                <Pressable
                  key={s}
                  onPress={() => setNewStatus(active ? null : s)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  style={[
                    styles.chip,
                    active && { backgroundColor: STATUS_INFO[s].color, borderColor: STATUS_INFO[s].color },
                  ]}
                >
                  <Text style={[styles.chipText, active && { color: "#fff" }]}>{STATUS_INFO[s].label}</Text>
                </Pressable>
              );
            })}
          </View>
          {newStatus && (
            <Animated.View entering={FadeInDown.duration(250)} style={{ gap: 12, marginTop: 14 }}>
              <Field
                label="Note for the customer (optional)"
                value={note}
                onChangeText={setNote}
                placeholder={newStatus === "rejected" ? "What needs fixing?" : "For example: sent to MEA"}
              />
              {!!saveError && <Notice tone="error" title="Couldn't update" message={saveError} />}
              <Button
                title={`Mark as ${STATUS_INFO[newStatus].label.toLowerCase()}`}
                onPress={saveStatus}
                loading={saving}
              />
            </Animated.View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 16, paddingBottom: 48 },
  success: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.okSoft,
    borderRadius: radius.md,
    padding: 14,
  },
  header: { gap: 8 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 18,
  },
  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  fileName: { flex: 1, fontSize: 15, fontWeight: "600", color: colors.ink },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipText: { fontWeight: "600", color: colors.inkSoft },
});

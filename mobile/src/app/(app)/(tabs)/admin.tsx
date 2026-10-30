import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Notice from "@/components/Notice";
import RequestCard from "@/components/RequestCard";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { STATUS_INFO } from "@/lib/format";
import type { RequestStatus } from "@/lib/types";
import { useLoad } from "@/lib/useLoad";
import { colors, text } from "@/constants/theme";

const FILTERS: (RequestStatus | "all")[] = ["all", "submitted", "in_review", "processing", "completed", "rejected"];

// Admins see every customer's requests and can filter by status.
// Tapping a request opens it, where the status can be changed.
export default function AdminScreen() {
  // Changing the filter creates a new load function, which makes useLoad fetch again
  const { token, user } = useAuth();
  const [filter, setFilter] = useState<RequestStatus | "all">("all");
  const load = useCallback(() => api.allRequests(token!, filter === "all" ? undefined : filter), [token, filter]);
  const { data: requests, error, loading, refreshing, refresh } = useLoad(load);

  if (user?.role !== "admin") {
    return (
      <View style={{ padding: 20 }}>
        <Notice title="Admins only" message="This area is for the ClearDocs team." />
      </View>
    );
  }

  return (
    <FlatList
      data={requests ?? []}
      keyExtractor={(r) => r._id}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.stamp} />}
      ListHeaderComponent={
        <View style={{ gap: 12 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {FILTERS.map((f) => {
              const active = f === filter;
              return (
                <Pressable
                  key={f}
                  onPress={() => setFilter(f)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && { color: "#fff" }]}>
                    {f === "all" ? "All" : STATUS_INFO[f].label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
          {loading && <ActivityIndicator color={colors.stamp} />}
          {!!error && (
            <Notice
              tone="error"
              title="Couldn't load requests"
              message={error}
              actionTitle="Try again"
              onAction={refresh}
            />
          )}
          {!loading && !!requests?.length && <Text style={text.small}>{requests.length} requests</Text>}
        </View>
      }
      ListEmptyComponent={
        !loading && !error ? (
          <Notice title="Nothing here" message="No requests match this filter right now." />
        ) : undefined
      }
      renderItem={({ item, index }) => <RequestCard request={item} index={index} showUser />}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 20, gap: 12, paddingBottom: 40 },
  chip: {
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipText: { fontWeight: "600", color: colors.inkSoft },
});

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
import EnquiryCard from "@/components/EnquiryCard";
import Notice from "@/components/Notice";
import RequestCard from "@/components/RequestCard";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { STATUS_INFO } from "@/lib/format";
import type { RequestStatus } from "@/lib/types";
import { useLoad } from "@/lib/useLoad";
import { colors, radius, text } from "@/constants/theme";

type Section = "requests" | "enquiries";

// The admin area has two sections:
//  - Requests: every customer's document requests, filterable by status
//  - Enquiries: messages sent from the website's Contact form
export default function AdminScreen() {
  const { user } = useAuth();
  const [section, setSection] = useState<Section>("requests");

  if (user?.role !== "admin") {
    return (
      <View style={{ padding: 20 }}>
        <Notice title="Admins only" message="This area is for the ClearDocs team." />
      </View>
    );
  }

  const switcher = (
    <View style={styles.segment} accessibilityRole="tablist">
      {(["requests", "enquiries"] as Section[]).map((s) => {
        const active = s === section;
        return (
          <Pressable
            key={s}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => setSection(s)}
            style={[styles.segmentItem, active && styles.segmentItemActive]}
          >
            <Text style={[styles.segmentText, active && { color: colors.ink }]}>
              {s === "requests" ? "Requests" : "Enquiries"}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  // Each section is its own component, so it loads its own data
  return section === "requests" ? <RequestsSection header={switcher} /> : <EnquiriesSection header={switcher} />;
}

const FILTERS: (RequestStatus | "all")[] = ["all", "submitted", "in_review", "processing", "completed", "rejected"];

function RequestsSection({ header }: { header: React.ReactNode }) {
  const { token } = useAuth();
  const [filter, setFilter] = useState<RequestStatus | "all">("all");
  // Changing the filter creates a new load function, which makes useLoad fetch again
  const load = useCallback(() => api.allRequests(token!, filter === "all" ? undefined : filter), [token, filter]);
  const { data: requests, error, loading, refreshing, refresh } = useLoad(load);

  return (
    <FlatList
      data={requests ?? []}
      keyExtractor={(r) => r._id}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.stamp} />}
      ListHeaderComponent={
        <View style={{ gap: 12 }}>
          {header}
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

function EnquiriesSection({ header }: { header: React.ReactNode }) {
  const { token } = useAuth();
  const load = useCallback(() => api.enquiries(token!), [token]);
  const { data: enquiries, error, loading, refreshing, refresh } = useLoad(load);

  return (
    <FlatList
      data={enquiries ?? []}
      keyExtractor={(e) => e._id}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.stamp} />}
      ListHeaderComponent={
        <View style={{ gap: 12 }}>
          {header}
          {loading && <ActivityIndicator color={colors.stamp} />}
          {!!error && (
            <Notice
              tone="error"
              title="Couldn't load enquiries"
              message={error}
              actionTitle="Try again"
              onAction={refresh}
            />
          )}
          {!loading && !!enquiries?.length && (
            <Text style={text.small}>
              {enquiries.length} {enquiries.length === 1 ? "message" : "messages"} from the website. Newest first.
            </Text>
          )}
        </View>
      }
      ListEmptyComponent={
        !loading && !error ? (
          <Notice
            title="No enquiries yet"
            message="Messages sent from the Contact page on the website will appear here."
          />
        ) : undefined
      }
      renderItem={({ item, index }) => <EnquiryCard enquiry={item} index={index} />}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 20, gap: 12, paddingBottom: 40 },
  segment: {
    flexDirection: "row",
    backgroundColor: colors.line,
    borderRadius: radius.sm,
    padding: 3,
  },
  segmentItem: { flex: 1, alignItems: "center", paddingVertical: 9, borderRadius: radius.sm - 2 },
  segmentItemActive: {
    backgroundColor: colors.surface,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  segmentText: { fontWeight: "700", color: colors.muted },
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

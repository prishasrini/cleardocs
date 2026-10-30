import { useCallback } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import Notice from "@/components/Notice";
import RequestCard from "@/components/RequestCard";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useLoad } from "@/lib/useLoad";
import { colors, text } from "@/constants/theme";

export default function MyRequestsScreen() {
  const { token } = useAuth();
  const load = useCallback(() => api.myRequests(token!), [token]);
  const { data: requests, error, loading, refreshing, refresh } = useLoad(load);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={colors.stamp} />;

  const active = requests?.filter((r) => r.status !== "completed").length ?? 0;

  return (
    <FlatList
      data={requests ?? []}
      keyExtractor={(r) => r._id}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.stamp} />}
      ListHeaderComponent={
        <View style={{ marginBottom: 6 }}>
          <Text style={text.small}>
            {requests?.length
              ? `${active} in progress, ${requests.length - active} completed. Pull down to refresh.`
              : ""}
          </Text>
          {!!error && (
            <Notice
              tone="error"
              title="Couldn't load your requests"
              message={error}
              actionTitle="Try again"
              onAction={refresh}
            />
          )}
        </View>
      }
      ListEmptyComponent={
        !error ? (
          <Notice
            title="No requests yet"
            message="Pick a service, upload your scans, and you'll follow every stage here."
            actionTitle="Start a request"
            onAction={() => router.navigate("/")}
          />
        ) : undefined
      }
      renderItem={({ item, index }) => <RequestCard request={item} index={index} />}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 20, gap: 12, paddingBottom: 40 },
});

import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import Ionicons from "@expo/vector-icons/Ionicons";
import Notice from "@/components/Notice";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatPrice } from "@/lib/format";
import { useLoad } from "@/lib/useLoad";
import { colors, radius, text } from "@/constants/theme";

export default function ServicesScreen() {
  const { user } = useAuth();
  const { data: services, error, loading, refreshing, refresh } = useLoad(api.services);
  const firstName = user?.name.split(" ")[0];

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={colors.stamp} />;

  return (
    <FlatList
      data={services ?? []}
      keyExtractor={(s) => s._id}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.stamp} />}
      ListHeaderComponent={
        <View style={{ marginBottom: 8 }}>
          <Text style={text.title}>Hi {firstName}</Text>
          <Text style={[text.body, { marginTop: 4 }]}>What do you need done? Pick a service to start a request.</Text>
          {!!error && (
            <View style={{ marginTop: 16 }}>
              <Notice
                tone="error"
                title="Couldn't load services"
                message={error}
                actionTitle="Try again"
                onAction={refresh}
              />
            </View>
          )}
        </View>
      }
      renderItem={({ item, index }) => (
        <Animated.View entering={FadeInDown.delay(index * 70).duration(380)}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push({ pathname: "/service/[slug]", params: { slug: item.slug } })}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          >
            <View style={styles.cardTop}>
              <Text style={[text.heading, { flex: 1 }]}>{item.title}</Text>
              <Ionicons name="arrow-forward-circle" size={28} color={colors.stamp} />
            </View>
            <Text style={text.small}>{item.summary}</Text>
            <View style={styles.meta}>
              <View>
                <Text style={styles.metaLabel}>From</Text>
                <Text style={styles.metaValue}>{formatPrice(item.startingPrice)}</Text>
              </View>
              <View>
                <Text style={styles.metaLabel}>Takes</Text>
                <Text style={styles.metaValue}>{item.turnaround}</Text>
              </View>
            </View>
          </Pressable>
        </Animated.View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 20, gap: 14, paddingBottom: 40 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 18,
    gap: 6,
  },
  pressed: { transform: [{ scale: 0.98 }], borderColor: colors.stamp },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  meta: {
    flexDirection: "row",
    gap: 28,
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  metaLabel: { fontSize: 12, color: colors.muted },
  metaValue: { fontSize: 15, fontWeight: "700", color: colors.ink },
});

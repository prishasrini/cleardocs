import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";

// Loads data for a screen and reloads it every time the screen comes back into view
// (so a new request shows up in "My requests" right after you submit it).
// Returns the data plus the state a screen needs for spinners, errors and pull-to-refresh.
// Pass a function wrapped in useCallback: when it changes (e.g. a new filter), the data reloads.
export function useLoad<T>(load: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const run = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      try {
        const result = await load();
        setData(result);
        setError("");
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setRefreshing(false);
      }
    },
    [load],
  );

  useFocusEffect(
    useCallback(() => {
      run();
    }, [run]),
  );

  return {
    data,
    error,
    loading: data === null && !error,
    refreshing,
    refresh: () => run(true),
    setData,
  };
}

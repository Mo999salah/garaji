import { useCallback, useMemo, useState } from 'react';
import { RefreshControl } from 'react-native';

type RefetchFn = () => Promise<unknown>;

export function useScreenRefresh(primaryRefetch: RefetchFn, secondaryRefetch?: RefetchFn) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const tasks = secondaryRefetch
        ? [primaryRefetch(), secondaryRefetch()]
        : [primaryRefetch()];
      await Promise.all(tasks);
    } finally {
      setRefreshing(false);
    }
  }, [primaryRefetch, secondaryRefetch]);

  return useMemo(
    () => <RefreshControl onRefresh={() => void onRefresh()} refreshing={refreshing} />,
    [onRefresh, refreshing],
  );
}

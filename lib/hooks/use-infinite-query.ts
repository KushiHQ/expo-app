import React, { useState, useEffect, useCallback, useRef } from "react";
import { cast } from "../types/utils";

// Helper type to extract the array type from the data result
type ExtractArrayType<T> = T extends { [key: string]: (infer U)[] }
  ? U[]
  : any[];

export const useInfiniteQuery = <
  TData extends { [key: string]: any[] }, // Data shape (e.g. { hostings: [...] })
  TVariables extends { limit?: number; offset?: number;[key: string]: any }, // Variables shape
>(
  useQueryHook: (options: {
    variables: TVariables;
  }) => [{ data?: TData; fetching: boolean; error?: any }, any],
  options: {
    queryKey: keyof TData; // The key where the list is stored (e.g. "hostings")
    variables: Omit<TVariables, "limit" | "offset">; // Your filters, excluding pagination
    limit?: number;
  },
) => {
  const { queryKey, variables, limit = 10 } = options;

  // State for pagination and data
  const [offset, setOffset] = useState(0);
  const [allData, setAllData] = useState<ExtractArrayType<TData>>(cast([]));
  const [hasMore, setHasMore] = useState(true);

  // Track the previous variables to detect filter changes and reset
  const prevVariablesRef = useRef(variables);

  // 1. Reset if filters change
  useEffect(() => {
    if (
      JSON.stringify(prevVariablesRef.current) !== JSON.stringify(variables)
    ) {
      setOffset(0);
      setHasMore(true);
      setAllData(cast([])); // Clear current list to prevent stale data mixing
      prevVariablesRef.current = variables;
    }
  }, [variables]);

  // 2. Call the provided hook with dynamic limit/offset
  const [{ data, fetching, error }, reexecute] = useQueryHook({
    variables: {
      ...variables,
      limit,
      offset,
    } as TVariables,
  });

  // 3. Sync data when the hook returns a result
  useEffect(() => {
    if (data && data[queryKey]) {
      const incomingList = data[queryKey];

      // Check if we've reached the end
      if (incomingList.length < limit) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      setAllData((prev) => {
        // If we are at offset 0, strictly replace the data (reset or new filter)
        if (offset === 0) {
          return incomingList;
        }

        // Safety: Ensure we don't append the exact same data twice if strict mode causes re-renders
        // (Optional: You could add ID duplication checks here if your API is flaky)
        return [...prev, ...incomingList];
      });
    }
  }, [data, queryKey, limit, offset]);

  // 4. Load More Action
  const loadMore = useCallback(() => {
    if (fetching || !hasMore) return;

    // Set offset to the current length of data
    setAllData((currentData) => {
      setOffset(currentData.length);
      return currentData;
    });
  }, [fetching, hasMore]);

  // 5. Manual Refresh
  const refresh = useCallback(() => {
    setOffset(0);
    setHasMore(true);
    reexecute();
  }, [reexecute]);

  return {
    data: allData,
    fetching,
    error,
    loadMore,
    hasMore,
    refresh,
  };
};

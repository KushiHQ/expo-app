import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { UseQueryResponse, AnyVariables } from "urql";
import { InputMaybe, PaginationInput } from "../services/graphql/generated";

type Pagable = {
  pagination?: InputMaybe<PaginationInput>;
};

export function useInfiniteQuery<
  TData extends Record<TKey, any[]>,
  TKey extends string,
  TVariables extends AnyVariables & Pagable,
>(
  useQueryHook: (options: {
    variables: TVariables;
    pause?: boolean;
    [key: string]: any;
  }) => UseQueryResponse<TData, TVariables>,
  options: {
    queryKey: TKey;
    initialVariables: Omit<TVariables, "pagination">;
    limit?: number;
  },
) {
  const { queryKey, initialVariables, limit = 20 } = options;
  type Val = TData[TKey][number];

  const [variables, setVariables] = useState<Omit<TVariables, "pagination">>(
    initialVariables,
  );

  // Sync with initialVariables if they change from outside
  useEffect(() => {
    if (initialVariables) {
      setVariables(initialVariables);
    }
  }, [JSON.stringify(initialVariables)]);

  const [pagination, setPagination] = useState<PaginationInput>({
    limit,
    offset: 0,
  });
  const [items, setItems] = useState<Val[]>([]);
  const [hasNextPage, setHasNextPage] = useState(true);

  // 1. Reset if variables (filters) change
  const prevVariablesRef = useRef(JSON.stringify(variables));
  useEffect(() => {
    const currentVars = JSON.stringify(variables);
    if (prevVariablesRef.current !== currentVars) {
      setItems([]);
      setPagination({ limit, offset: 0 });
      setHasNextPage(true);
      prevVariablesRef.current = currentVars;
    }
  }, [variables, limit]);

  // 2. Call the provided hook
  const [{ data, fetching, error }, reexecute] = useQueryHook({
    variables: useMemo(
      () =>
        ({
          ...variables,
          pagination,
        }) as unknown as TVariables,
      [variables, pagination],
    ),
  });

  // 3. Sync data
  useEffect(() => {
    if (data && data[queryKey]) {
      const newItems = data[queryKey] as Val[];

      if (newItems.length > 0) {
        setItems((prev) => {
          // If we are at offset 0, strictly replace the data
          if (pagination.offset === 0) return newItems;

          // Basic duplicate prevention by ID if items have IDs
          const existingIds = new Set(
            prev.map((i: any) => i.id).filter(Boolean),
          );
          const uniqueNewItems = newItems.filter(
            (i: any) => !i.id || !existingIds.has(i.id),
          );

          return [...prev, ...uniqueNewItems];
        });
        setHasNextPage(newItems.length === (pagination.limit ?? 20));
      } else {
        setHasNextPage(false);
      }
    } else if (data && !data[queryKey]) {
      setHasNextPage(false);
    }
  }, [data, queryKey, pagination.limit, pagination.offset]);

  const loadMore = useCallback(() => {
    if (hasNextPage && !fetching) {
      setPagination((prev) => ({
        ...prev,
        offset: (prev.offset ?? 0) + (prev.limit ?? 20),
      }));
    }
  }, [hasNextPage, fetching]);

  const refresh = useCallback(() => {
    setPagination({ limit, offset: 0 });
    setHasNextPage(true);
    reexecute({ requestPolicy: "network-only" });
  }, [reexecute, limit]);

  return {
    items,
    fetching,
    error,
    loadMore,
    hasNextPage,
    refresh,
    setVariables,
    variables,
  };
}

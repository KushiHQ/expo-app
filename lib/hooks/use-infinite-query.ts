import { useState, useEffect, useCallback, useMemo } from 'react';
import { UseQueryResponse, AnyVariables } from 'urql';
import { InputMaybe, PaginationInput } from '../services/graphql/generated';

type Pagable = {
  pagination?: InputMaybe<PaginationInput>;
};

type State<Val, TVariables> = {
  items: Val[];
  hasNextPage: boolean;
  variables: Omit<TVariables, 'pagination'>;
  pagination: PaginationInput;
};

function mergePages<Val>(existing: Val[], page: Val[]): Val[] {
  const existingIds = new Set(existing.map((i: any) => i?.id).filter(Boolean));
  return [...existing, ...page.filter((i: any) => !i?.id || !existingIds.has(i.id))];
}

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
    initialVariables: Omit<TVariables, 'pagination'>;
    limit?: number;
    requestPolicy?: 'cache-first' | 'cache-only' | 'network-only' | 'cache-and-network';
  },
) {
  const { queryKey, initialVariables, limit = 20, requestPolicy } = options;
  type Val = TData[TKey][number];

  const [state, setState] = useState<State<Val, TVariables>>({
    items: [],
    hasNextPage: true,
    variables: initialVariables,
    pagination: { limit, offset: 0 },
  });

  // Sync with initialVariables if they change from outside. Items are CLEARED:
  // a variable change (e.g. a new filter) means the accumulated list belongs to
  // the old query — keeping it lets mergePages later weld stale rows from the
  // previous filter onto the new results (the "filter shows other types" bug).
  // Pagination (loadMore) is the only path that keeps + merges items.
  const initialVarsJson = JSON.stringify(initialVariables);
  useEffect(() => {
    setState((prev) => {
      if (JSON.stringify(prev.variables) === initialVarsJson) return prev;
      return {
        ...prev,
        items: [],
        hasNextPage: true,
        variables: initialVariables,
        pagination: { limit, offset: 0 },
      };
    });
  }, [initialVarsJson, limit]);

  const setVariables = useCallback(
    (
      newVars:
        | Omit<TVariables, 'pagination'>
        | ((prev: Omit<TVariables, 'pagination'>) => Omit<TVariables, 'pagination'>),
    ) => {
      setState((prev) => {
        const nextVars = typeof newVars === 'function' ? newVars(prev.variables) : newVars;

        if (JSON.stringify(nextVars) === JSON.stringify(prev.variables)) {
          return prev;
        }

        return {
          ...prev,
          items: [],
          hasNextPage: true,
          variables: nextVars,
          pagination: { limit, offset: 0 },
        };
      });
    },
    [limit],
  );

  const queryVariables = useMemo(
    () =>
      ({
        ...state.variables,
        pagination: state.pagination,
      }) as unknown as TVariables,
    [state.variables, state.pagination],
  );

  const [{ data, fetching, error }, reexecute] = useQueryHook({
    variables: queryVariables,
    ...(requestPolicy && { requestPolicy }),
  });

  const currentPage = (data?.[queryKey] ?? undefined) as Val[] | undefined;
  const offset = state.pagination.offset ?? 0;

  // The list is derived during render so it updates in the same frame the
  // response arrives. `state.items` only serves as the fallback while a fetch
  // for new variables/offset is in flight (urql exposes no data for the new
  // operation yet), which keeps the previous results on screen instead of
  // blanking the list.
  const items = useMemo(() => {
    if (!currentPage) return state.items;
    if (offset === 0) return currentPage;
    return mergePages(state.items, currentPage);
  }, [currentPage, state.items, offset]);

  // Persist the derived list so it survives as the fallback above. Also tracks
  // whether another page is available.
  useEffect(() => {
    if (currentPage) {
      setState((prev) => {
        const atStart = (prev.pagination.offset ?? 0) === 0;
        return {
          ...prev,
          items: atStart ? currentPage : mergePages(prev.items, currentPage),
          hasNextPage: currentPage.length === (prev.pagination.limit ?? 20),
        };
      });
    } else if ((data && !currentPage) || error) {
      setState((prev) => (prev.hasNextPage ? { ...prev, hasNextPage: false } : prev));
    }
  }, [currentPage, data, error]);

  const loadMore = useCallback(() => {
    if (state.hasNextPage && !fetching && !error) {
      setState((prev) => ({
        ...prev,
        pagination: {
          ...prev.pagination,
          offset: (prev.pagination.offset ?? 0) + (prev.pagination.limit ?? 20),
        },
      }));
    }
  }, [state.hasNextPage, fetching, error]);

  const refresh = useCallback(() => {
    setState((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, offset: 0 },
      hasNextPage: true,
    }));
    reexecute({ requestPolicy: 'network-only' });
  }, [reexecute]);

  return {
    items,
    fetching,
    error,
    loadMore,
    hasNextPage: state.hasNextPage,
    refresh,
    setVariables,
    variables: state.variables,
    /**
     * True while a fetch is in flight with nothing to display. Because the
     * previous list is retained across variable changes, this can only be true
     * when the screen would otherwise be blank.
     */
    showInitialSkeleton: fetching && items.length === 0,
    /** True only once a fetch has settled with no rows — never flashes mid-fetch. */
    showEmpty: !fetching && !error && currentPage !== undefined && items.length === 0,
  };
}

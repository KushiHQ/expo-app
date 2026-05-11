import { useState, useEffect, useCallback, useMemo } from "react";
import { UseQueryResponse, AnyVariables } from "urql";
import { InputMaybe, PaginationInput } from "../services/graphql/generated";

type Pagable = {
	pagination?: InputMaybe<PaginationInput>;
};

type State<Val, TVariables> = {
	items: Val[];
	hasNextPage: boolean;
	variables: Omit<TVariables, "pagination">;
	pagination: PaginationInput;
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
		requestPolicy?: "cache-first" | "cache-only" | "network-only" | "cache-and-network";
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

	// Sync with initialVariables if they change from outside
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
				| Omit<TVariables, "pagination">
				| ((prev: Omit<TVariables, "pagination">) => Omit<TVariables, "pagination">),
		) => {
			setState((prev) => {
				const nextVars = typeof newVars === "function" ? newVars(prev.variables) : newVars;

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

	// Sync data
	useEffect(() => {
		if (data && data[queryKey]) {
			const newItems = data[queryKey] as Val[];

			setState((prev) => {
				if (newItems.length > 0) {
					// If we are at offset 0, strictly replace the data
					if (prev.pagination.offset === 0) {
						return {
							...prev,
							items: newItems,
							hasNextPage: newItems.length === (prev.pagination.limit ?? 20),
						};
					}

					// Basic duplicate prevention by ID if items have IDs
					const existingIds = new Set(
						prev.items.map((i: any) => (i as any).id).filter(Boolean),
					);
					const uniqueNewItems = newItems.filter(
						(i: any) => !(i as any).id || !existingIds.has((i as any).id),
					);

					return {
						...prev,
						items: [...prev.items, ...uniqueNewItems],
						hasNextPage: newItems.length === (prev.pagination.limit ?? 20),
					};
				} else {
					return { ...prev, hasNextPage: false };
				}
			});
		} else if (data && !data[queryKey]) {
			setState((prev) => (prev.hasNextPage ? { ...prev, hasNextPage: false } : prev));
		} else if (error) {
			setState((prev) => (prev.hasNextPage ? { ...prev, hasNextPage: false } : prev));
		}
	}, [data, queryKey, error]);

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
		reexecute({ requestPolicy: "network-only" });
	}, [reexecute]);

	return {
		items: state.items,
		fetching,
		error,
		loadMore,
		hasNextPage: state.hasNextPage,
		refresh,
		setVariables,
		variables: state.variables,
	};
}

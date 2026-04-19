import DetailsLayout from "@/components/layouts/details";
import {
	TransactionStatus,
	useTransactionsQuery,
} from "@/lib/services/graphql/generated";
import { useLocalSearchParams } from "expo-router";
import React, { useState, useMemo } from "react";
import { View, FlatList, RefreshControl, ScrollView } from "react-native";
import TransactionCard from "@/components/atoms/a-transaction-card";
import TextPill from "@/components/molecules/m-text-pill-pill";
import EmptyList from "@/components/molecules/m-empty-list";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { useInfiniteQuery } from "@/lib/hooks/use-infinite-query";

export default function TransactionsScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const [status, setStatus] = useState<TransactionStatus | "All">("All");
	const colors = useThemeColors();

	const {
		items: transactions,
		fetching,
		loadMore,
		hasNextPage,
		refresh,
	} = useInfiniteQuery(useTransactionsQuery, {
		queryKey: "transactions",
		initialVariables: {
			filter: {
				userId: id,
				status: status === "All" ? undefined : status,
			},
		},
		limit: 20,
	});

	const statuses = React.useMemo(
		() => ["All", ...Object.values(TransactionStatus)],
		[],
	);

	const getLabel = (s: string) =>
		s === "All" ? "All" : s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

	const renderHeader = useMemo(
		() => (
			<View className="mb-4">
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={{ paddingHorizontal: 20 }}
				>
					<View className="flex-row gap-2 py-2">
						{statuses.map((item) => (
							<TextPill
								key={item}
								selected={status === item}
								onSelect={(val) => {
									const found = statuses.find((s) => getLabel(s) === val);
									if (found) setStatus(found as any);
								}}
							>
								{getLabel(item)}
							</TextPill>
						))}
					</View>
				</ScrollView>
			</View>
		),
		[status, statuses],
	);

	const renderFooter = () => {
		if (!fetching || !transactions.length) return null;
		return (
			<View className="py-5">
				<View
					className="h-20 w-full rounded-xl mb-3"
					style={{ backgroundColor: colors.shade, opacity: 0.2 }}
				/>
			</View>
		);
	};

	return (
		<DetailsLayout title="Transactions" scrollable={false}>
			<FlatList
				data={transactions}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => (
					<View className="px-5">
						<TransactionCard transaction={item} />
					</View>
				)}
				ListHeaderComponent={renderHeader}
				ListFooterComponent={renderFooter}
				ListEmptyComponent={
					!fetching ? (
						<View className="px-5">
							<EmptyList message="No transactions found" />
						</View>
					) : (
						<View className="px-5 gap-3">
							{Array.from({ length: 5 }).map((_, index) => (
								<View
									key={index}
									className="h-20 w-full rounded-xl mb-3"
									style={{ backgroundColor: colors.shade, opacity: 0.2 }}
								/>
							))}
						</View>
					)
				}
				contentContainerStyle={{ paddingBottom: 20 }}
				onEndReached={() => {
					if (hasNextPage) loadMore();
				}}
				onEndReachedThreshold={0.5}
				refreshControl={
					<RefreshControl
						refreshing={fetching && transactions.length === 0}
						onRefresh={refresh}
						tintColor={colors.primary}
					/>
				}
			/>
		</DetailsLayout>
	);
}

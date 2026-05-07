import ProfileLayout from "@/components/layouts/profile";
import EmptyList from "@/components/molecules/m-empty-list";
import HostingCard, {
	HostingCardSkeleton,
} from "@/components/molecules/m-hosting-card";
import { HotingVariantFilter } from "@/components/molecules/m-hosting-variant-filter";
import HostingFilterManager from "@/components/organisms/o-hosting-filter-manager";
import {
	PublishStatus,
	useHostingsQuery,
} from "@/lib/services/graphql/generated";
import { useHostingFilterStore } from "@/lib/stores/hostings";
import { useInfiniteQuery } from "@/lib/hooks/use-infinite-query";
import { View, FlatList } from "react-native";
import { RefreshControl } from "react-native-gesture-handler";

export default function GuestHome() {
	const { filter, updateFilter } = useHostingFilterStore();

	const {
		items: hostings,
		fetching,
		loadMore,
		hasNextPage,
		refresh,
	} = useInfiniteQuery(useHostingsQuery, {
		queryKey: "hostings",
		initialVariables: {
			filters: { ...filter, publishStatus: PublishStatus.Live, onSale: true },
		},
	});

	return (
		<ProfileLayout scrollable={false}>
			<FlatList
				showsVerticalScrollIndicator={false}
				data={hostings}
				keyExtractor={(item) => item.id}
				contentContainerStyle={{ padding: 24, paddingTop: 12 }}
				renderItem={({ item, index }) => (
					<View className="mb-10">
						<HostingCard index={index} hosting={item} />
					</View>
				)}
				ListHeaderComponent={
					<View className="mb-10">
						<View className="gap-6">
							<HostingFilterManager />
							<HotingVariantFilter
								value={filter.category?.valueOf()}
								onSelect={(v) =>
									updateFilter({ category: v === "All" ? undefined : v })
								}
							/>
						</View>
						{fetching && !hostings.length && (
							<View className="gap-6 mt-10">
								{Array.from({ length: 5 }).map((_, index) => (
									<HostingCardSkeleton key={index} />
								))}
							</View>
						)}
					</View>
				}
				ListEmptyComponent={
					!fetching && !hostings.length ? (
						<EmptyList message="No hostings yet" />
					) : null
				}
				onEndReached={() => {
					if (hasNextPage) loadMore();
				}}
				onEndReachedThreshold={0.5}
				refreshControl={
					<RefreshControl refreshing={fetching} onRefresh={() => refresh()} />
				}
			/>
		</ProfileLayout>
	);
}

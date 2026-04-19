import SearchInput from "@/components/atoms/a-search-input";
import Skeleton from "@/components/atoms/a-skeleton";
import ThemedText from "@/components/atoms/a-themed-text";
import { CircumGrid2H, CircumGrid41 } from "@/components/icons/i-grid";
import { MultiList } from "@/components/icons/i-list";
import DetailsLayout from "@/components/layouts/details";
import EmptyList from "@/components/molecules/m-empty-list";
import ListingCard from "@/components/organisms/o-listing-card";
import ListingListItem from "@/components/organisms/o-listing-list-item";
import { Fonts } from "@/lib/constants/theme";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { useUser } from "@/lib/hooks/user";
import { useHostListingsQuery } from "@/lib/services/graphql/generated";
import { useRouter } from "expo-router";
import { useInfiniteQuery } from "@/lib/hooks/use-infinite-query";
import React from "react";
import { FlatList, Pressable, RefreshControl, View } from "react-native";
import { FlatGrid } from "react-native-super-grid";

export default function HostListings() {
	const router = useRouter();
	const { user, updateUser } = useUser();
	const [title, setTitle] = React.useState("");
	const debouncedTitle = useDebounce(title, 500);

	const {
		items: hostings,
		fetching,
		loadMore,
		hasNextPage,
		refresh,
	} = useInfiniteQuery(useHostListingsQuery, {
		queryKey: "hostings",
		initialVariables: {
			filters: {
				creatorId: user.user?.id,
				title: title.length ? debouncedTitle : undefined,
			},
		},
	});

	const colors = useThemeColors();

	const handleView = () => {
		if (user.hostListingsView === "list") {
			updateUser({ hostListingsView: "grid" });
		} else if (user.hostListingsView === "grid") {
			updateUser({ hostListingsView: "block" });
		} else {
			updateUser({ hostListingsView: "list" });
		}
	};

	const renderHeader = () => (
		<View className="gap-8 mb-4">
			<SearchInput onChangeText={setTitle} placeholder="Search..." />
			<View className="gap-4">
				<View className="flex-row items-center justify-between px-1 pr-2">
					<ThemedText style={{ fontFamily: Fonts.medium }}>
						My Listings
					</ThemedText>
					<Pressable onPress={handleView}>
						{user.hostListingsView === "list" ? (
							<MultiList color={colors.text} size={20} />
						) : user.hostListingsView === "block" ? (
							<CircumGrid2H color={colors.text} size={20} />
						) : (
							<CircumGrid41 color={colors.text} size={20} />
						)}
					</Pressable>
				</View>
				{!fetching && !hostings.length && (
					<EmptyList
						message="No listings yet"
						buttonTitle="Create Listing"
						onButtonPress={() => router.push("/hostings/form")}
					/>
				)}

				{/* Loading States */}
				{fetching && !hostings.length && (
					user.hostListingsView === "list" ? (
						<View className="gap-4">
							{Array.from({ length: 10 }).map((_, index) => (
								<Skeleton
									style={{ height: 100, width: "100%", borderRadius: 10 }}
									key={index}
								/>
							))}
						</View>
					) : (
						<FlatGrid
							itemDimension={user.hostListingsView === "block" ? 350 : 170}
							spacing={1}
							data={Array.from({ length: 10 }).fill(0)}
							renderItem={() => (
								<Skeleton
									style={{
										width: user.hostListingsView === "block" ? "100%" : "96%",
										aspectRatio: "1/0.75",
										marginRight: 8,
										marginBottom: 8,
										borderRadius: 10,
									}}
								/>
							)}
						/>
					)
				)}
			</View>
		</View>
	);

	return (
		<DetailsLayout
			title="Listings"
			variant="host"
			withNotifications
			withProfile
			scrollable={false}
		>
			{user.hostListingsView === "list" ? (
				<FlatList
					data={hostings}
					keyExtractor={(item) => item.id}
					contentContainerStyle={{ padding: 20, paddingTop: 0 }}
					ListHeaderComponent={renderHeader}
					renderItem={({ item }) => (
						<View className="mb-4">
							<ListingListItem hosting={item} />
						</View>
					)}
					onEndReached={() => hasNextPage && loadMore()}
					onEndReachedThreshold={0.5}
					refreshControl={
						<RefreshControl refreshing={fetching} onRefresh={() => refresh()} />
					}
				/>
			) : (
				<FlatGrid
					itemDimension={user.hostListingsView === "block" ? 350 : 170}
					spacing={1}
					data={hostings}
					renderItem={({ item }) => (
						<View className="mr-2 mb-2">
							<ListingCard hosting={item} />
						</View>
					)}
					ListHeaderComponent={renderHeader}
					contentContainerStyle={{ padding: 20, paddingTop: 0 }}
					refreshControl={
						<RefreshControl refreshing={fetching} onRefresh={() => refresh()} />
					}
					onEndReached={() => hasNextPage && loadMore()}
					onEndReachedThreshold={0.5}
				/>
			)}
		</DetailsLayout>
	);
}

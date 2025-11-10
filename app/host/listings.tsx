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
import { useHostListingsQuery } from "@/lib/services/graphql/generated";
import { useUserStore } from "@/lib/stores/users";
import React from "react";
import { Pressable, View } from "react-native";
import { SimpleGrid } from "react-native-super-grid";

export default function HostListings() {
	const { user, updateUser } = useUserStore();
	const [title, setTitle] = React.useState("");
	const debouncedTitle = useDebounce(title, 500);
	const [{ fetching, data }] = useHostListingsQuery({
		variables: { filters: { creatorId: user.user?.id, title: debouncedTitle } },
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

	return (
		<DetailsLayout
			title="Listings"
			variant="host"
			withNotifications
			withProfile
		>
			<View className="gap-8">
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
					{!fetching && !data?.hostings.length && (
						<EmptyList message="No listings yet" />
					)}
					{fetching ? (
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
							<SimpleGrid
								itemDimension={user.hostListingsView === "block" ? 350 : 170}
								spacing={1}
								listKey={undefined}
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
					) : user.hostListingsView === "list" ? (
						<View className="gap-4">
							{data?.hostings.map((hosting, index) => (
								<ListingListItem hosting={hosting} key={index} />
							))}
						</View>
					) : (
						<SimpleGrid
							itemDimension={user.hostListingsView === "block" ? 350 : 170}
							spacing={1}
							listKey={undefined}
							data={data?.hostings ?? []}
							renderItem={({ item }) => (
								<View className="mr-2 mb-2">
									<ListingCard hosting={item} />
								</View>
							)}
						/>
					)}
				</View>
			</View>
		</DetailsLayout>
	);
}

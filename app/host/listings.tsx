import SearchInput from "@/components/atoms/a-search-input";
import ThemedText from "@/components/atoms/a-themed-text";
import { CircumGrid2H, CircumGrid41 } from "@/components/icons/i-grid";
import { MultiList } from "@/components/icons/i-list";
import DetailsLayout from "@/components/layouts/details";
import ListingCard from "@/components/organisms/o-listing-card";
import ListingListItem from "@/components/organisms/o-listing-list-item";
import { Fonts } from "@/lib/constants/theme";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hostingsAtom } from "@/lib/stores/hostings";
import { useAtomValue } from "jotai";
import React from "react";
import { Pressable, View } from "react-native";
import { SimpleGrid } from "react-native-super-grid";

export default function HostListings() {
	const hostings = useAtomValue(hostingsAtom);
	const colors = useThemeColors();
	const [view, setView] = React.useState<"list" | "grid" | "block">("list");

	const handleView = () => {
		if (view === "list") {
			setView("grid");
		} else if (view === "grid") {
			setView("block");
		} else {
			setView("list");
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
				<SearchInput placeholder="Search..." />
				<View className="gap-4">
					<View className="flex-row items-center justify-between px-1 pr-2">
						<ThemedText style={{ fontFamily: Fonts.medium }}>
							My Listings
						</ThemedText>
						<Pressable onPress={handleView}>
							{view === "list" ? (
								<MultiList color={colors.text} size={20} />
							) : view === "block" ? (
								<CircumGrid2H color={colors.text} size={20} />
							) : (
								<CircumGrid41 color={colors.text} size={20} />
							)}
						</Pressable>
					</View>
					{view === "list" ? (
						<View className="gap-4">
							{hostings.map((hosting, index) => (
								<ListingListItem hosting={hosting} key={index} />
							))}
						</View>
					) : (
						<SimpleGrid
							itemDimension={view === "block" ? 350 : 170}
							spacing={1}
							listKey={undefined}
							data={hostings}
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

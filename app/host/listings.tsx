import SearchInput from "@/components/atoms/a-search-input";
import ThemedText from "@/components/atoms/a-themed-text";
import { MultiList } from "@/components/icons/i-list";
import DetailsLayout from "@/components/layouts/details";
import ListingListItem from "@/components/organisms/o-listing-list-item";
import { Fonts } from "@/lib/constants/theme";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hostingsAtom } from "@/lib/stores/hostings";
import { useAtomValue } from "jotai";
import { Pressable, View } from "react-native";

export default function HostListings() {
	const hostings = useAtomValue(hostingsAtom);
	const colors = useThemeColors();

	return (
		<DetailsLayout
			title="Listings"
			variant="host"
			withNotifications
			withProfile
		>
			<View className="gap-4">
				<SearchInput placeholder="Search..." />
				<View className="gap-4">
					<View className="flex-row items-center justify-between px-1">
						<ThemedText style={{ fontFamily: Fonts.medium }}>
							My Listings
						</ThemedText>
						<Pressable>
							<MultiList color={colors.text} size={20} />
						</Pressable>
					</View>
					<View className="gap-4">
						{hostings.map((hosting, index) => (
							<ListingListItem hosting={hosting} key={index} />
						))}
					</View>
				</View>
			</View>
		</DetailsLayout>
	);
}

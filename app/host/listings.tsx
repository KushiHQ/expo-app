import DetailsLayout from "@/components/layouts/details";
import { View } from "react-native";

export default function HostListings() {
	return (
		<DetailsLayout
			title="Listings"
			variant="host"
			withNotifications
			withProfile
		>
			<View></View>
		</DetailsLayout>
	);
}

import DetailsLayout from "@/components/layouts/details";
import { View } from "react-native";

export default function HostAnalytics() {
	return (
		<DetailsLayout
			title="Analytics"
			variant="host"
			withNotifications
			withProfile
		>
			<View></View>
		</DetailsLayout>
	);
}

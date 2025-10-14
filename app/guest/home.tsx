import ProfileLayout from "@/components/layouts/profile";
import HostingCard, {
	HostingCardSkeleton,
} from "@/components/molecules/m-hosting-card";
import { HotingVariantFilter } from "@/components/molecules/m-hosting-variant-filter";
import HostingFilterManager from "@/components/organisms/o-hosting-filter-manager";
import { generateMockHostings } from "@/lib/constants/mocks/hostings";
import { hostingsAtom } from "@/lib/stores/hostings";
import { useAtom } from "jotai";
import React from "react";
import { View } from "react-native";

export default function GuestHome() {
	const [loading, setLoading] = React.useState(false);
	const [hostings, setMockHostings] = useAtom(hostingsAtom);

	React.useEffect(() => {
		(async () => {
			if (hostings.length === 0) {
				setLoading(true);
				const hostings = await generateMockHostings();
				setMockHostings(hostings);
				setLoading(false);
			}
		})();
	}, []);

	return (
		<ProfileLayout>
			<View>
				<View className="gap-4">
					<HostingFilterManager />
					<HotingVariantFilter />
				</View>
				<View className="gap-4 mt-8">
					{loading &&
						Array.from({ length: 5 }).map((_, index) => (
							<HostingCardSkeleton key={index} />
						))}
					{hostings.map((hosting, index) => (
						<HostingCard index={index} hosting={hosting} key={hosting.id} />
					))}
				</View>
			</View>
		</ProfileLayout>
	);
}

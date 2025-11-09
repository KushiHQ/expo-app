import ProfileLayout from "@/components/layouts/profile";
import EmptyList from "@/components/molecules/m-empty-list";
import HostingCard, {
	HostingCardSkeleton,
} from "@/components/molecules/m-hosting-card";
import { HotingVariantFilter } from "@/components/molecules/m-hosting-variant-filter";
import HostingFilterManager from "@/components/organisms/o-hosting-filter-manager";
import { useHostingsQuery } from "@/lib/services/graphql/generated";
import React from "react";
import { View } from "react-native";

export default function GuestHome() {
	const [{ fetching, data }] = useHostingsQuery();

	return (
		<ProfileLayout>
			<View>
				<View className="gap-4">
					<HostingFilterManager />
					<HotingVariantFilter />
				</View>
				<View className="gap-4 mt-8">
					{fetching &&
						Array.from({ length: 5 }).map((_, index) => (
							<HostingCardSkeleton key={index} />
						))}
					{!fetching && !data?.hostings.length && (
						<EmptyList message="No hostings yet" />
					)}
					{(data?.hostings ?? []).map((hosting, index) => (
						<HostingCard index={index} hosting={hosting} key={hosting.id} />
					))}
				</View>
			</View>
		</ProfileLayout>
	);
}

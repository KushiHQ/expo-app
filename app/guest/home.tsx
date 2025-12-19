import ThemedText from "@/components/atoms/a-themed-text";
import { useNotifications } from "@/components/contexts/notifications";
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
import React from "react";
import { View } from "react-native";
import { RefreshControl } from "react-native-gesture-handler";

export default function GuestHome() {
	const { filter, updateFilter } = useHostingFilterStore();
	const { token } = useNotifications();
	const [{ fetching, data }, refetch] = useHostingsQuery({
		variables: { filters: { ...filter, publishStatus: PublishStatus.Live } },
	});

	console.log(token);

	return (
		<ProfileLayout
			refreshControl={
				<RefreshControl
					refreshing={fetching}
					onRefresh={() => refetch({ requestPolicy: "network-only" })}
				/>
			}
		>
			<ThemedText>{token}</ThemedText>
			<View>
				<View className="gap-4">
					<HostingFilterManager />
					<HotingVariantFilter
						value={filter.category?.valueOf()}
						onSelect={(v) =>
							updateFilter({ category: v === "All" ? undefined : v })
						}
					/>
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

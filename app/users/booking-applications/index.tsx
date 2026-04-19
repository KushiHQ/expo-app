import Skeleton from "@/components/atoms/a-skeleton";
import DetailsLayout from "@/components/layouts/details";
import EmptyList from "@/components/molecules/m-empty-list";
import { BOOKING_APPLICATION_STATUS_COLORS } from "@/lib/constants/booking/application";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import {
	BookingApplicationStatus,
	useBookingApplicationsQuery,
} from "@/lib/services/graphql/generated";
import { useInfiniteQuery } from "@/lib/hooks/use-infinite-query";
import { hexToRgba } from "@/lib/utils/colors";
import { toTitleCase } from "@/lib/utils/text";
import { useRouter } from "expo-router";
import React from "react";
import { RefreshControl, TouchableOpacity, View, FlatList } from "react-native";
import ThemedText from "@/components/atoms/a-themed-text";

const TABS = [
	{ label: "All", value: null },
	{ label: "Pending", value: BookingApplicationStatus.InProgress },
	{ label: "Approved", value: BookingApplicationStatus.HostVerified },
	{ label: "Rejected", value: BookingApplicationStatus.Rejected },
];

export default function BookingApplications() {
	const router = useRouter();
	const colors = useThemeColors();
	const [activeTab, setActiveTab] =
		React.useState<BookingApplicationStatus | null>(null);

	const {
		items: applications,
		fetching,
		loadMore,
		hasNextPage,
		refresh,
	} = useInfiniteQuery(useBookingApplicationsQuery, {
		queryKey: "bookingApplications",
		initialVariables: {
			filter: activeTab ? { status: activeTab } : {},
		},
	});

	return (
		<DetailsLayout title="My Applications" scrollable={false}>
			<FlatList
				data={applications}
				keyExtractor={(item) => item.id}
				contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
				renderItem={({ item }) => (
					<TouchableOpacity
						onPress={() =>
							router.push(`/users/booking-applications/${item.id}`)
						}
						className="mb-4 p-4 rounded-2xl border"
						style={{
							borderColor: hexToRgba(colors.text, 0.1),
							backgroundColor: hexToRgba(colors.text, 0.02),
						}}
					>
						<View className="flex-row justify-between items-start mb-2">
							<View>
								<ThemedText type="semibold" style={{ fontSize: 16 }}>
									Application #{item.id.slice(-6).toUpperCase()}
								</ThemedText>
								<ThemedText
									style={{
										fontSize: 12,
										color: hexToRgba(colors.text, 0.6),
									}}
								>
									Submitted on {new Date(item.createdAt).toLocaleDateString()}
								</ThemedText>
							</View>
							<View
								className="px-3 py-1 rounded-full"
								style={{
									backgroundColor: hexToRgba(
										BOOKING_APPLICATION_STATUS_COLORS[item.status],
										0.1,
									),
								}}
							>
								<ThemedText
									style={{
										fontSize: 12,
										color: BOOKING_APPLICATION_STATUS_COLORS[item.status],
									}}
								>
									{toTitleCase(item.status.replace(/_/g, " "))}
								</ThemedText>
							</View>
						</View>
						<ThemedText style={{ fontSize: 14 }}>
							Guest: {item.fullName}
						</ThemedText>
					</TouchableOpacity>
				)}
				ListHeaderComponent={
					<View className="mt-4">
						<View className="flex-row gap-4 mb-6">
							{TABS.map((tab) => (
								<TouchableOpacity
									key={tab.label}
									onPress={() => setActiveTab(tab.value)}
									className="pb-2 border-b-2"
									style={{
										borderBottomColor:
											activeTab === tab.value ? colors.primary : "transparent",
									}}
								>
									<ThemedText
										style={{
											color:
												activeTab === tab.value
													? colors.primary
													: hexToRgba(colors.text, 0.5),
										}}
									>
										{tab.label}
									</ThemedText>
								</TouchableOpacity>
							))}
						</View>

						{fetching && !applications.length && (
							<View className="gap-4">
								{Array.from({ length: 5 }).map((_, i) => (
									<Skeleton key={i} style={{ height: 100, borderRadius: 16 }} />
								))}
							</View>
						)}
					</View>
				}
				ListEmptyComponent={
					!fetching && applications.length === 0 ? (
						<EmptyList
							message="No applications found"
							buttonTitle="Explore Hostings"
							onButtonPress={() => router.replace("/guest/home")}
						/>
					) : null
				}
				onEndReached={() => hasNextPage && loadMore()}
				onEndReachedThreshold={0.5}
				refreshControl={
					<RefreshControl refreshing={fetching} onRefresh={refresh} />
				}
			/>
		</DetailsLayout>
	);
}

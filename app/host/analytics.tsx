import AnalyticsCard from "@/components/atoms/a-analytics-card";
import Skeleton from "@/components/atoms/a-skeleton";
import ThemedText from "@/components/atoms/a-themed-text";
import DetailsLayout from "@/components/layouts/details";
import EmptyList from "@/components/molecules/m-empty-list";
import NotificationCard from "@/components/molecules/m-notification-card";
import TopListingCard from "@/components/molecules/m-top-listing-card";
import { Fonts } from "@/lib/constants/theme";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import {
	useHostAnalyticsQuery,
	useNotificationsQuery,
} from "@/lib/services/graphql/generated";
import { hexToRgba } from "@/lib/utils/colors";
import { Link, useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import React from "react";
import { Pressable, RefreshControl, View } from "react-native";
import { SimpleGrid } from "react-native-super-grid";

export default function HostAnalytics() {
	const router = useRouter();
	const colors = useThemeColors();
	const [
		{ fetching: analyticsFetching, data: analyticsData },
		refetchAnalytics,
	] = useHostAnalyticsQuery({ requestPolicy: "network-only" });
	const [
		{ fetching: notificationsFetching, data: notificationsData },
		refetchNotifications,
	] = useNotificationsQuery({ variables: { pagination: { limit: 5 } } });

	const data = React.useMemo(() => {
		return [
			{
				label: "Total Listings",
				value: analyticsData?.hostAnalytics.totalListings ?? 0,
				currency: false,
				percentage: false,
				description: "The total number of properties you have created.",
			},
			{
				label: "Occupancy Rate",
				value: analyticsData?.hostAnalytics.occupancyRate ?? 0,
				currency: false,
				percentage: true,
				description: "The percentage of your total listings that are currently booked.",
			},
			{
				label: "Total Revenue",
				value: analyticsData?.hostAnalytics.totalRevenue ?? 0,
				currency: true,
				percentage: false,
				description: "The total amount of money earned from all your bookings.",
			},
			{
				label: "Average Rating",
				value: analyticsData?.hostAnalytics.averateRating ?? 0,
				currency: false,
				percentage: false,
				description: "The overall average rating given by guests across all your listings.",
			},
		];
	}, [analyticsData]);

	return (
		<DetailsLayout
			title="Analytics"
			variant="host"
			withNotifications
			withProfile
			refreshControl={
				<RefreshControl
					refreshing={analyticsFetching || notificationsFetching}
					onRefresh={() => {
						refetchAnalytics();
						refetchNotifications();
					}}
				/>
			}
			footer={
				<Pressable
					onPress={() => router.push("/hostings/form")}
					className="absolute bottom-4 right-4 rounded-full items-center justify-center"
					style={{ backgroundColor: colors.text, width: 48, height: 48 }}
				>
					<Plus color={colors.background} size={34} />
				</Pressable>
			}
		>
			<View className="mt-8">
				<View className="gap-1 px-2">
					{analyticsFetching ? (
						<Skeleton style={{ width: "100%", height: 22, borderRadius: 8 }} />
					) : (
						<ThemedText style={{ fontFamily: Fonts.bold, fontSize: 22 }}>
							Welcome {analyticsData?.hostAnalytics.host.user.profile.fullName}
						</ThemedText>
					)}
					<ThemedText
						style={{ color: hexToRgba(colors.text, 0.6), fontSize: 14 }}
					>
						Here’s your hosting summary
					</ThemedText>
				</View>
				<View className="mt-8">
					{analyticsFetching ? (
						<SimpleGrid
							spacing={6}
							itemDimension={160}
							listKey={undefined}
							data={[1, 2, 3, 4]}
							renderItem={() => (
								<View className="mb-1">
									<Skeleton
										style={{
											width: "100%",
											height: 110,
											borderRadius: 8,
										}}
									/>
								</View>
							)}
						/>
					) : (
						<SimpleGrid
							spacing={6}
							listKey={undefined}
							itemDimension={160}
							data={data}
							renderItem={({ item }) => (
								<View className="mb-1">
									<AnalyticsCard {...item} />
								</View>
							)}
						/>
					)}
				</View>
				<View className="mt-6 gap-3 px-2">
					<ThemedText style={{ fontFamily: Fonts.bold }}>
						Top Performing Listing
					</ThemedText>
					{analyticsFetching ? (
						<Skeleton style={{ height: 100, width: "100%", borderRadius: 8 }} />
					) : !analyticsData?.hostAnalytics.topListing ? (
						<EmptyList message="You have no listings yet" />
					) : (
						<TopListingCard hosting={analyticsData?.hostAnalytics.topListing} />
					)}
				</View>
				<View className="mt-8 gap-3 px-2">
					<View className="flex-row justify-between items-center">
						<ThemedText style={{ fontFamily: Fonts.bold }}>
							Recent Activity
						</ThemedText>
						<Link href="/users/notifications">
							<ThemedText
								style={{ fontSize: 14, color: colors.primary }}
								className="underline"
							>
								View All
							</ThemedText>
						</Link>
					</View>
					<View className="gap-2">
						{notificationsFetching
							? Array.from({ length: 5 }).map((_, index) => (
									<Skeleton
										style={{ height: 85, width: "100%", borderRadius: 8 }}
										key={index}
									/>
								))
							: notificationsData?.notifications.map((notification) => (
									<NotificationCard
										notification={notification}
										key={notification.id}
									/>
								))}
						{!notificationsFetching &&
							!notificationsData?.notifications.length && (
								<EmptyList message="No activity yet" />
							)}
					</View>
				</View>
			</View>
		</DetailsLayout>
	);
}

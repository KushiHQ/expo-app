import AnalyticsCard from "@/components/atoms/a-analytics-card";
import AreaChart from "@/components/molecules/m-area-chart";
import Skeleton from "@/components/atoms/a-skeleton";
import ThemedText from "@/components/atoms/a-themed-text";
import DetailsLayout from "@/components/layouts/details";
import { Fonts } from "@/lib/constants/theme";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import {
	useHostAnalyticsQuery,
	useNotificationsQuery,
} from "@/lib/services/graphql/generated";
import { REVENUE_GROWTH } from "@/lib/services/graphql/requests/queries/users";
import { hexToRgba } from "@/lib/utils/colors";
import { Link, useRouter } from "expo-router";
import { useQuery } from "urql";
import { Plus, Wallet, Home, ClipboardList } from "lucide-react-native";
import React from "react";
import { Pressable, RefreshControl, View } from "react-native";
import { SimpleGrid } from "react-native-super-grid";
import { twMerge } from "tailwind-merge";
import EmptyList from "@/components/molecules/m-empty-list";
import NotificationCard from "@/components/molecules/m-notification-card";
import TopListingCard from "@/components/molecules/m-top-listing-card";

export default function HostAnalytics() {
	const router = useRouter();
	const colors = useThemeColors();

	const [
		{ fetching: analyticsFetching, data: analyticsData },
		refetchAnalytics,
	] = useHostAnalyticsQuery({ requestPolicy: "network-only" });

	const [{ fetching: growthFetching, data: growthData }, refetchGrowth] =
		useQuery({
			query: REVENUE_GROWTH,
			variables: { lastNMonths: 12 },
			requestPolicy: "network-only",
		});
	const [
		{ fetching: notificationsFetching, data: notificationsData },
		refetchNotifications,
	] = useNotificationsQuery({ variables: { pagination: { limit: 5 } } });

	const stats = React.useMemo(() => {
		if (!analyticsData?.hostAnalytics) return [];
		const host = analyticsData.hostAnalytics;
		return [
			{
				label: "Funds in Escrow",
				value: Number(host.fundsInEscrow) || 0,
				currency: true,
				icon: Wallet,
				description: "Booking payments pending guest approval.",
			},
			{
				label: "Total Revenue",
				value: Number(host.totalRevenue) || 0,
				currency: true,
				icon: Wallet,
				description: "Total earnings on the platform.",
			},
			{
				label: "Total Listings",
				value: host.totalListings || 0,
				icon: Home,
				description: "Total number of properties managed.",
			},
			{
				label: "Pending Applications",
				value: host.pendingApplications || 0,
				icon: ClipboardList,
				description: "Booking applications pending your review.",
			},
		];
	}, [analyticsData]);

	const chartData = React.useMemo(() => {
		return (
			growthData?.hostAnalytics.revenueGrowth.dataPoints.map(
				(dp: { amount: number; label: string }) => ({
					amount: dp.amount,
					label: dp.label,
				}),
			) ?? []
		);
	}, [growthData]);

	const onRefresh = React.useCallback(() => {
		refetchAnalytics();
		refetchGrowth();
		refetchNotifications();
	}, [refetchAnalytics, refetchGrowth]);

	return (
		<DetailsLayout
			title="Dashboard"
			variant="host"
			withNotifications
			withProfile
			refreshControl={
				<RefreshControl
					refreshing={analyticsFetching || growthFetching}
					onRefresh={onRefresh}
				/>
			}
			footer={
				<Pressable
					onPress={() => router.push("/hostings/form")}
					className="absolute bottom-4 right-4 rounded-full items-center justify-center shadow-lg"
					style={{
						backgroundColor: colors.primary,
						width: 56,
						height: 56,
						shadowColor: colors.primary,
						shadowOpacity: 0.3,
						shadowRadius: 8,
						elevation: 5,
					}}
				>
					<Plus color="white" size={32} />
				</Pressable>
			}
		>
			<View className="mt-6 px-1">
				<View className="gap-1 mb-8">
					{analyticsFetching ? (
						<Skeleton style={{ width: 200, height: 28, borderRadius: 8 }} />
					) : (
						<ThemedText
							style={{
								fontFamily: Fonts.black,
								fontSize: 26,
								letterSpacing: -0.5,
							}}
						>
							Welcome,{" "}
							{
								analyticsData?.hostAnalytics.host.user.profile.fullName.split(
									" ",
								)[0]
							}
						</ThemedText>
					)}
					<ThemedText
						style={{
							color: hexToRgba(colors.text, 0.5),
							fontSize: 15,
							fontFamily: Fonts.medium,
						}}
					>
						Here's your portfolio performance
					</ThemedText>
				</View>

				{/* Statistics Grid */}
				<View>
					{analyticsFetching ? (
						<SimpleGrid
							spacing={4}
							itemDimension={160}
							listKey="loading-grid"
							data={[1, 2, 3, 4]}
							renderItem={({ index }) => (
								<Skeleton
									className={twMerge("mb-2", (index + 1) % 2 !== 0 && "mr-2")}
									style={{
										width: "100%",
										height: 140,
										borderRadius: 24,
									}}
								/>
							)}
						/>
					) : (
						<SimpleGrid
							spacing={4}
							itemDimension={160}
							listKey="stats-grid"
							data={stats}
							renderItem={({ item, index }) => (
								<AnalyticsCard index={index} {...item} />
							)}
						/>
					)}
				</View>

				{/* Revenue Growth Chart */}
				<View className="mt-8 mb-4">
					{growthFetching ? (
						<Skeleton
							style={{
								width: "100%",
								height: 350,
								borderRadius: 24,
							}}
						/>
					) : (
						<AreaChart
							data={chartData}
							title="Revenue Growth"
							color={colors.primary}
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

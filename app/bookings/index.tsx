import Skeleton from "@/components/atoms/a-skeleton";
import DetailsLayout from "@/components/layouts/details";
import BookingCard from "@/components/molecules/m-booking-card";
import EmptyList from "@/components/molecules/m-empty-list";
import TextPill from "@/components/molecules/m-text-pill-pill";
import {
	BookingApplicationStatus,
	PaymentStatus,
	useBookingApplicationsQuery,
	useBookingsQuery,
} from "@/lib/services/graphql/generated";
import { cast } from "@/lib/types/utils";
import { useInfiniteQuery } from "@/lib/hooks/use-infinite-query";
import React from "react";
import {
	FlatList,
	RefreshControl,
	View,
	TouchableOpacity,
	LayoutChangeEvent,
	ScrollView,
} from "react-native";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import ThemedText from "@/components/atoms/a-themed-text";
import { hexToRgba } from "@/lib/utils/colors";
import Animated, {
	useAnimatedStyle,
	withSpring,
	useSharedValue,
} from "react-native-reanimated";
import BookingApplicationCard from "@/components/molecules/m-booking-application-card";
import { useLocalSearchParams, useRouter } from "expo-router";

const MAIN_TABS = ["Bookings", "Applications"] as const;

export default function UserBookings() {
	const router = useRouter();
	const colors = useThemeColors();
	const params = useLocalSearchParams();
	const [mainTab, setMainTab] = React.useState<(typeof MAIN_TABS)[number]>(
		params.tab === "applications" ? "Applications" : "Bookings",
	);
	const tabWidth = useSharedValue(0);
	const translateX = useSharedValue(params.tab === "applications" ? 1 : 0);

	const handleMainTabChange = (
		tab: (typeof MAIN_TABS)[number],
		index: number,
	) => {
		setMainTab(tab);
		translateX.value = withSpring(index, { damping: 20, stiffness: 150 });
	};

	const onTabLayout = (event: LayoutChangeEvent) => {
		tabWidth.value = event.nativeEvent.layout.width / MAIN_TABS.length;
	};

	const animatedIndicatorStyle = useAnimatedStyle(() => {
		return {
			transform: [{ translateX: translateX.value * tabWidth.value }],
			width: tabWidth.value,
		};
	});

	const bookingsQuery = useInfiniteQuery(useBookingsQuery, {
		queryKey: "bookings",
		initialVariables: {
			filter: {
				paymentStatus: PaymentStatus.Paid,
			},
		},
	});

	const appsQuery = useInfiniteQuery(useBookingApplicationsQuery, {
		queryKey: "bookingApplications",
		initialVariables: {
			filter: {},
		},
	});

	const activeQuery = mainTab === "Bookings" ? bookingsQuery : appsQuery;

	return (
		<DetailsLayout title="My Bookings" scrollable={false}>
			<View className="mt-4">
				<View
					onLayout={onTabLayout}
					className="flex-row items-center mb-6 relative border-b"
					style={{ borderBottomColor: hexToRgba(colors.text, 0.05) }}
				>
					{MAIN_TABS.map((tab, index) => (
						<TouchableOpacity
							key={tab}
							onPress={() => handleMainTabChange(tab, index)}
							className="flex-1 items-center justify-center py-4"
						>
							<ThemedText
								type={mainTab === tab ? "semibold" : "default"}
								style={{
									color:
										mainTab === tab
											? colors.primary
											: hexToRgba(colors.text, 0.4),
								}}
							>
								{tab}
							</ThemedText>
						</TouchableOpacity>
					))}
					<Animated.View
						className="absolute bottom-0 h-[2px]"
						style={[
							animatedIndicatorStyle,
							{
								backgroundColor: colors.primary,
							},
						]}
					/>
				</View>

				{/* Sub-filters (Pills) */}

				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					className="flex-row gap-2 mt-1"
				>
					<View className="flex-row items-center gap-2 mb-6 px-5">
						{mainTab === "Bookings"
							? [
									PaymentStatus.Paid,
									PaymentStatus.Pending,
									PaymentStatus.Failed,
								].map((v) => (
									<TextPill
										selected={
											bookingsQuery.variables.filter?.paymentStatus === v
										}
										key={v}
										onSelect={(val) =>
											bookingsQuery.setVariables((c) => ({
												...c,
												filter: { ...c.filter, paymentStatus: cast(val) },
											}))
										}
									>
										{v}
									</TextPill>
								))
							: ["ALL", ...Object.values(BookingApplicationStatus)].map((v) => (
									<TextPill
										selected={
											v === "ALL"
												? !appsQuery.variables.filter?.status
												: appsQuery.variables.filter?.status === v
										}
										key={v}
										onSelect={(val) => {
											appsQuery.setVariables((c) => ({
												...c,
												filter: {
													...c.filter,
													status: val === "ALL" ? undefined : cast(val),
												},
											}));
										}}
									>
										{v}
									</TextPill>
								))}
					</View>
				</ScrollView>
			</View>

			<FlatList
				data={cast<any>(activeQuery.items)}
				keyExtractor={(item) => item.id}
				contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
				renderItem={({ item }) => (
					<View className="mb-2">
						{mainTab === "Bookings" ? (
							<BookingCard booking={item} />
						) : (
							<BookingApplicationCard application={cast(item)} />
						)}
					</View>
				)}
				ListEmptyComponent={
					!activeQuery.fetching && activeQuery.items.length === 0 ? (
						<View className="mt-20">
							<EmptyList
								message={`No ${mainTab.toLowerCase()} found`}
								buttonTitle="Explore Hostings"
								onButtonPress={() => router.replace("/guest/home")}
							/>
						</View>
					) : null
				}
				ListHeaderComponent={
					activeQuery.fetching && activeQuery.items.length === 0 ? (
						<View className="gap-6 mt-4">
							{Array.from({ length: 4 }).map((_, index) => (
								<Skeleton
									key={index}
									style={{ height: 140, borderRadius: 16 }}
								/>
							))}
						</View>
					) : null
				}
				onEndReached={() => activeQuery.hasNextPage && activeQuery.loadMore()}
				onEndReachedThreshold={0.5}
				refreshControl={
					<RefreshControl
						refreshing={activeQuery.fetching}
						onRefresh={() => activeQuery.refresh()}
					/>
				}
			/>
		</DetailsLayout>
	);
}

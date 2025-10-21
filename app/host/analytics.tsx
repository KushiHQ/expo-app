import AnalyticsCard from "@/components/atoms/a-analytics-card";
import ThemedText from "@/components/atoms/a-themed-text";
import DetailsLayout from "@/components/layouts/details";
import NotificationCard from "@/components/molecules/m-notification-card";
import TopListingCard from "@/components/molecules/m-top-listing-card";
import {
	generateMockNotifications,
	Notification,
} from "@/lib/constants/mocks/notifications";
import { Fonts } from "@/lib/constants/theme";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hostingsAtom } from "@/lib/stores/hostings";
import { hexToRgba } from "@/lib/utils/colors";
import { useRouter } from "expo-router";
import { useAtomValue } from "jotai";
import { LucideHousePlus, Plus } from "lucide-react-native";
import React from "react";
import { Pressable, View } from "react-native";
import { SimpleGrid } from "react-native-super-grid";

export default function HostAnalytics() {
	const router = useRouter();
	const colors = useThemeColors();
	const hostings = useAtomValue(hostingsAtom);
	const [notifications, setNotifications] = React.useState<Notification[]>([]);
	const topPerforming = React.useMemo(() => {
		let hosting = hostings.at(0);
		hostings.forEach((h) => {
			if (h.averageRating > (hosting?.averageRating ?? 0)) {
				hosting = h;
			}
		});

		return hosting;
	}, [hostings]);
	const data = React.useMemo(() => {
		const totalListings = hostings.length;
		const ocupied = hostings.slice(0, Math.round(totalListings / 2));
		const occupancyRate = (ocupied.length / totalListings) * 100;
		const totalRevenue = ocupied
			.map((v) => v.price)
			.reduce((acc, curr) => acc + curr);
		const averageRating =
			hostings.map((v) => v.averageRating).reduce((acc, prev) => acc + prev) /
			totalListings;

		return [
			{
				label: "Total Listings",
				value: totalListings,
				currency: false,
				percentage: false,
			},
			{
				label: "Occupancy Rate",
				value: occupancyRate,
				currency: false,
				percentage: true,
			},
			{
				label: "Total Revenue",
				value: totalRevenue,
				currency: true,
				percentage: false,
			},
			{
				label: "Averate Rating",
				value: averageRating,
				currency: false,
				percentage: false,
			},
		];
	}, [hostings]);

	React.useEffect(() => {
		if (!notifications.length) {
			setNotifications(
				generateMockNotifications(6).filter(
					(v) => v.category === "Guest Alert",
				),
			);
		}
	}, []);

	return (
		<DetailsLayout
			title="Analytics"
			variant="host"
			withNotifications
			withProfile
			footer={
				<Pressable
					onPress={() => router.push("/hostings/new")}
					className="absolute bottom-4 right-4 rounded-full items-center justify-center"
					style={{ backgroundColor: colors.text, width: 48, height: 48 }}
				>
					<Plus color={colors.background} size={34} />
				</Pressable>
			}
		>
			<View className="mt-8">
				<View className="gap-1 px-2">
					<ThemedText style={{ fontFamily: Fonts.bold, fontSize: 22 }}>
						Welcome Naruto
					</ThemedText>
					<ThemedText
						style={{ color: hexToRgba(colors.text, 0.6), fontSize: 14 }}
					>
						Here’s your hosting summary
					</ThemedText>
				</View>
				{!hostings.length || !topPerforming ? (
					<View className="mt-20">
						<View
							className="items-center justify-center p-8 h-[210px] gap-4"
							style={{
								backgroundColor: hexToRgba(colors.text, 0.08),
								borderRadius: 12,
							}}
						>
							<LucideHousePlus color={colors.text} />
							<ThemedText
								className="text-center"
								style={{ color: hexToRgba(colors.text, 0.6) }}
							>
								You currently have no listings. Begin your hosting journey
								today!
							</ThemedText>
						</View>
					</View>
				) : (
					<>
						<View className="mt-8">
							<SimpleGrid
								spacing={6}
								listKey={undefined}
								data={data}
								renderItem={({ item }) => (
									<View className="mb-1">
										<AnalyticsCard {...item} />
									</View>
								)}
							/>
						</View>
						<View className="mt-6 gap-3 px-2">
							<ThemedText style={{ fontFamily: Fonts.bold }}>
								Top Performing Listing
							</ThemedText>
							<TopListingCard hosting={topPerforming} />
						</View>
						<View className="mt-8 gap-3 px-2">
							<ThemedText style={{ fontFamily: Fonts.bold }}>
								Recent Activity
							</ThemedText>
							<View className="gap-2">
								{notifications.map((notification, index) => (
									<NotificationCard notification={notification} key={index} />
								))}
							</View>
						</View>
					</>
				)}
			</View>
		</DetailsLayout>
	);
}

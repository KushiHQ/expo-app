import ThemedText from "@/components/atoms/a-themed-text";
import { VaadinPaintbrush } from "@/components/icons/i-brush";
import { CuidaBuildingOutline } from "@/components/icons/i-home";
import { LinkIcon } from "@/components/icons/i-link";
import { SolarLogout2Broken } from "@/components/icons/i-logout";
import { SolarMedalStarBold } from "@/components/icons/i-medal";
import { IonNotificationsOutline } from "@/components/icons/i-notifications";
import {
	SolarCardLinear,
	SolarWalletMoneyOutline,
} from "@/components/icons/i-payments";
import { SolarShieldCheckLinear } from "@/components/icons/i-shield";
import { HugeiconsShieldUser, UilUser } from "@/components/icons/i-user";
import DetailsLayout from "@/components/layouts/details";
import UserProfileSummary from "@/components/molecules/m-user-profile-summary";
import { Fonts } from "@/lib/constants/theme";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { CustomSvgProps } from "@/lib/types/svgType";
import { hexToRgba } from "@/lib/utils/colors";
import { Href, useRouter } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import React from "react";
import { Platform, Pressable, View } from "react-native";

export default function GuestProfile() {
	const router = useRouter();
	const colors = useThemeColors();

	const id = 1;

	const NAVIGATION: {
		icon: React.FC<CustomSvgProps>;
		href: Href;
		label: string;
	}[] = [
		{
			icon: UilUser,
			href: `/users/${id}/profile/edit`,
			label: "Profile",
		},
		{
			icon: SolarCardLinear,
			href: `/users/${id}/bookings`,
			label: "My Bookings",
		},
		{
			icon: SolarWalletMoneyOutline,
			href: "/hostings/",
			label: "Payments",
		},
		{
			icon: IonNotificationsOutline,
			href: `/users/${id}/notifications`,
			label: "Notifications",
		},
		{
			icon: HugeiconsShieldUser,
			href: "/hostings/",
			label: "KYC",
		},
		{
			icon: LinkIcon,
			href: "/hostings/",
			label: "Hostings",
		},
		{
			icon: SolarShieldCheckLinear,
			href: `/users/${id}/security`,
			label: "Security",
		},
	];

	return (
		<DetailsLayout title="Profile">
			<View className="mt-4">
				<View
					className="flex-row items-center gap-4 p-6 border rounded-xl"
					style={{
						borderColor: hexToRgba(colors.primary, 0.2),
						backgroundColor: colors.background,
						...Platform.select({
							ios: {
								shadowColor: colors.primary,
								shadowOffset: { width: 0, height: -2 },
								shadowOpacity: 0.1,
								shadowRadius: 8,
							},
							android: {
								elevation: 10,
								shadowColor: hexToRgba(colors.text, 0.5),
							},
						}),
					}}
				>
					<UserProfileSummary />
					<View
						style={{ backgroundColor: hexToRgba(colors.text, 0.1) }}
						className="p-4 gap-5 rounded-xl flex-[1.5]"
					>
						<View className="flex-row items-center gap-2">
							<CuidaBuildingOutline color={colors.accent} size={16} />
							<ThemedText style={{ fontSize: 12 }}>2 Years</ThemedText>
						</View>
						<Pressable
							onPress={() => router.push(`/users/${id}/profile/edit`)}
							className="flex-row items-center justify-center gap-2 p-1 rounded-lg"
							style={{ backgroundColor: colors.text }}
						>
							<VaadinPaintbrush color={colors.background} size={16} />
							<ThemedText style={{ color: colors.background }}>
								Edit Profile
							</ThemedText>
						</Pressable>
					</View>
				</View>
				<View className="mt-8 gap-2">
					{NAVIGATION.map((nav, index) => {
						const Icon = nav.icon;
						return (
							<Pressable
								onPress={() => router.push(nav.href)}
								key={index}
								className="flex-row p-2 py-4 items-center justify-between"
							>
								<View className="flex-row items-center gap-3">
									<Icon size={24} color={colors.primary} />
									<ThemedText style={{ fontFamily: Fonts.medium }}>
										{nav.label}
									</ThemedText>
								</View>
								<ChevronRight size={24} color={colors.text} />
							</Pressable>
						);
					})}
					<Pressable
						onPress={() => router.push("/hostings/")}
						className="flex-row p-2 py-4 items-center justify-between"
					>
						<View className="flex-row items-center gap-3">
							<SolarLogout2Broken size={24} color={colors.error} />
							<ThemedText style={{ fontFamily: Fonts.medium }}>
								Logout
							</ThemedText>
						</View>
						<ChevronRight size={24} color={colors.text} />
					</Pressable>
				</View>
			</View>
		</DetailsLayout>
	);
}

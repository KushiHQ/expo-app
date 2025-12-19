import moment from "moment";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useRef } from "react";
import {
	Pressable,
	RefreshControlProps,
	ScrollView,
	StyleProp,
	View,
	ViewStyle,
} from "react-native";
import { hexToRgba } from "@/lib/utils/colors";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import ThemedText from "../atoms/a-themed-text";
import { ChevronLeft, Share2Icon } from "lucide-react-native";
import { useLocalSearchParams, usePathname, useRouter } from "expo-router";
import { Image } from "expo-image";
import { EventEmitter } from "@/lib/utils/event-emitter";
import { HugeiconsVideo01, SolarPhoneOutline } from "../icons/i-phone";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { useGradualKeyboardAnimation } from "@/lib/hooks/keyboard";
import ThemedView from "../atoms/a-themed-view";
import { IonNotificationsOutline } from "../icons/i-notifications";
import { getImagePlaceholderUrl } from "@/lib/utils/urls";
import { useUser } from "@/lib/hooks/user";

type Props = {
	children?: React.ReactNode;
	title?: string;
	avatar?: {
		image?: string;
		online?: boolean;
		lastSeen?: string;
	};
	variant?: "guest" | "host";
	footer?: React.ReactNode;
	backButton?: "translucent" | "solid";
	background?: "transparent" | "solid";
	withShare?: boolean;
	withProfile?: boolean;
	refreshControl?: React.ReactElement<
		RefreshControlProps,
		string | React.JSXElementConstructor<any>
	>;
	withNotifications?: boolean;
	backgroundStyles?: StyleProp<ViewStyle>;
	contentStyles?: StyleProp<ViewStyle>;
	withPhone?: boolean;
	withVideo?: boolean;
};

const DetailsLayout = React.forwardRef<ScrollView, Props>(
	(
		{
			children,
			title,
			avatar,
			footer,
			variant = "guest",
			backButton = "translucent",
			background = "solid",
			withShare,
			withProfile,
			withNotifications,
			refreshControl,
			backgroundStyles,
			contentStyles,
			withPhone,
			withVideo,
		},
		ref,
	) => {
		const router = useRouter();
		const colors = useThemeColors();
		const scrollViewRef = useRef<ScrollView>(null);
		const path = usePathname();
		const { height: keyboardHeight } = useGradualKeyboardAnimation();
		const { id } = useLocalSearchParams();
		const { user } = useUser();

		React.useImperativeHandle(ref, () => scrollViewRef.current as ScrollView);

		React.useEffect(() => {
			const handleScrollToTop = () => {
				scrollViewRef.current?.scrollTo({ y: 0, animated: true });
			};

			const routeName = path.split("/").pop();

			EventEmitter.on(`scrollToTop:${routeName}`, handleScrollToTop);

			return () => {
				EventEmitter.off(`scrollToTop:${routeName}`, handleScrollToTop);
			};
		}, [path]);

		const animatedFooterStyle = useAnimatedStyle(() => {
			return {
				transform: [{ translateY: -keyboardHeight.value + 15 }],
			};
		});

		const Wrapper = background === "solid" ? ThemedView : View;

		return (
			<Wrapper className="flex-1" style={backgroundStyles}>
				<SafeAreaView className="flex-1">
					<View className="p-5 flex-row items-center justify-between">
						<View className="flex-row items-center gap-2">
							<Pressable
								onPress={() => router.back()}
								aria-label="Go Back"
								className="w-8 items-center justify-center rounded-full h-8"
								style={{
									backgroundColor:
										backButton === "translucent"
											? hexToRgba(colors["text"], 0.2)
											: colors.text,
								}}
							>
								<ChevronLeft
									color={
										backButton === "translucent"
											? colors["text"]
											: colors.background
									}
								/>
							</Pressable>
							<View className="flex-row items-center gap-2">
								{avatar && (
									<View className="w-8 h-8 rounded-full border border-[#000] overflow-hidden">
										<Image
											style={{
												height: "100%",
												width: "100%",
												objectFit: "cover",
											}}
											source={{
												uri: avatar.image,
											}}
										/>
									</View>
								)}
								<View>
									<ThemedText>{title}</ThemedText>
									{avatar?.online !== undefined && (
										<ThemedText style={{ fontSize: 12 }}>
											{avatar?.online
												? "Online"
												: `Last seen ${moment(avatar?.lastSeen).fromNow()}`}
										</ThemedText>
									)}
								</View>
							</View>
						</View>
						<View className="flex-row items-center gap-3">
							{withShare && (
								<Pressable
									className="h-8 w-8 rounded-full justify-center items-center"
									style={{ backgroundColor: hexToRgba(colors.text, 0.1) }}
								>
									<Share2Icon size={20} color={colors.text} />
								</Pressable>
							)}
							{withPhone && (
								<Pressable
									onPress={() =>
										router.push(`/chats/${id}/call/voice?initiate=true`)
									}
									className="h-8 w-8 rounded-full justify-center items-center"
									style={{ backgroundColor: hexToRgba(colors.text, 0.1) }}
								>
									<SolarPhoneOutline size={20} color={colors.text} />
								</Pressable>
							)}
							{withVideo && (
								<Pressable
									onPress={() => router.push(`/chats/${id}/call/video`)}
									className="h-8 w-8 rounded-full justify-center items-center"
									style={{ backgroundColor: hexToRgba(colors.text, 0.1) }}
								>
									<HugeiconsVideo01 size={20} color={colors.text} />
								</Pressable>
							)}
							{withNotifications && (
								<Pressable onPress={() => router.push("/users/notifications")}>
									<IonNotificationsOutline
										color={hexToRgba(colors["text"], 0.7)}
									/>
								</Pressable>
							)}
							{withProfile && (
								<Pressable
									onPress={() =>
										router.push(
											variant === "guest" ? "/guest/profile" : "/host/profile",
										)
									}
									className="w-8 h-8 rounded-full border overflow-hidden"
									style={{
										borderColor: hexToRgba(colors["text"], 0.6),
										borderWidth: 2,
									}}
								>
									<Image
										style={{
											height: "100%",
											width: "100%",
											objectFit: "cover",
										}}
										source={{
											uri: getImagePlaceholderUrl(user.user?.profile.gender),
										}}
									/>
								</Pressable>
							)}
						</View>
					</View>
					<KeyboardAwareScrollView
						ref={scrollViewRef}
						className="flex-1"
						showsVerticalScrollIndicator={false}
						contentContainerStyle={{ flexGrow: 1 }}
						refreshControl={refreshControl}
					>
						<View className="p-5 pt-0 flex-1" style={contentStyles}>
							<View className="flex-1">{children}</View>
						</View>
					</KeyboardAwareScrollView>
					{footer && (
						<Animated.View style={animatedFooterStyle}>{footer}</Animated.View>
					)}
				</SafeAreaView>
			</Wrapper>
		);
	},
);

export default DetailsLayout;

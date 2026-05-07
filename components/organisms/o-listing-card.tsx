import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";
import ListingOptions from "../molecules/m-listing-options";
import React from "react";
import { useRouter } from "expo-router";
import { useFallbackImages } from "@/lib/hooks/images";
import { FALLBACK_IMAGE, PROPERTY_BLURHASH } from "@/lib/constants/images";
import ThemedText from "../atoms/a-themed-text";
import { EllipsisVertical } from "lucide-react-native";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { Fonts } from "@/lib/constants/theme";
import { hexToRgba } from "@/lib/utils/colors";
import { IconParkOutlineDot } from "../icons/i-circle";
import {
	HostListingsQuery,
	PublishStatus,
} from "@/lib/services/graphql/generated";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

type Props = {
	hosting: HostListingsQuery["hostings"][number];
};

const ListingCard: React.FC<Props> = ({ hosting }) => {
	const router = useRouter();
	const colors = useThemeColors();
	const [optionsOpen, setOptionsOpen] = React.useState(false);
	const { failedImages, handleImageError } = useFallbackImages();

	const scale = useSharedValue(1);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	const handlePressIn = () => {
		scale.value = withSpring(0.98, { damping: 10, stiffness: 100 });
	};

	const handlePressOut = () => {
		scale.value = withSpring(1);
	};

	const handlePress = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		router.push(`/hostings/form/onboarding?id=${hosting.id}`);
	};

	const statusColor =
		hosting.publishStatus === PublishStatus.Live
			? colors.success
			: hosting.publishStatus === PublishStatus.Draft
				? colors.primary
				: hosting.publishStatus === PublishStatus.Inreview
					? colors.secondary
					: colors.error;

	return (
		<Animated.View style={[animatedStyle, { gap: 8 }]}>
			<Pressable
				onPress={handlePress}
				onPressIn={handlePressIn}
				onPressOut={handlePressOut}
			>
				<View
					className="gap-4 p-4 rounded-2xl"
					style={{ backgroundColor: colors["surface-01"] }}
				>
					<View>
						<View className="flex-row items-start justify-between">
							<ThemedText
								className="flex-1"
								numberOfLines={2}
								ellipsizeMode="tail"
								style={{ fontSize: 15, fontFamily: Fonts.semibold }}
							>
								{hosting.title}
							</ThemedText>
							<Pressable
								onPress={() => {
									Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
									setOptionsOpen(true);
								}}
								className="p-1.5 rounded-xl"
								style={{ backgroundColor: hexToRgba(colors.text, 0.05) }}
							>
								<EllipsisVertical color={colors.text} size={18} />
							</Pressable>
						</View>
						<ThemedText
							numberOfLines={1}
							ellipsizeMode="tail"
							style={{
								fontSize: 13,
								color: hexToRgba(colors.text, 0.6),
								fontFamily: Fonts.medium,
							}}
						>
							{hosting.city}, {hosting.state}
						</ThemedText>
					</View>
					<View className="w-full aspect-[140/80] overflow-hidden rounded-xl">
						<Image
							source={{
								uri: failedImages.has(0)
									? FALLBACK_IMAGE
									: hosting.coverImage?.asset.publicUrl,
							}}
							style={{
								height: "100%",
								width: "100%",
							}}
							contentFit="cover"
							transition={400}
							placeholder={{ blurhash: PROPERTY_BLURHASH }}
							placeholderContentFit="cover"
							cachePolicy="memory-disk"
							priority="high"
							onError={() => handleImageError(0)}
						/>
					</View>
				</View>
				<View className="flex-row items-center justify-between px-2 mt-1">
					<View className="flex-row items-center gap-1.5">
						<IconParkOutlineDot color={statusColor} size={10} />
						<Text
							style={{
								fontSize: 11,
								color: statusColor,
								fontFamily: Fonts.semibold,
								textTransform: "capitalize",
							}}
						>
							{hosting.publishStatus}
						</Text>
					</View>
					<ThemedText
						style={{
							fontSize: 11,
							color: colors.primary,
							fontFamily: Fonts.semibold,
						}}
					>
						Manage
					</ThemedText>
				</View>
			</Pressable>
			<ListingOptions
				open={optionsOpen}
				onClose={() => setOptionsOpen(false)}
				hosting={hosting}
			/>
		</Animated.View>
	);
};

export default ListingCard;

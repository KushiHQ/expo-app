import { FALLBACK_IMAGE, PROPERTY_BLURHASH } from "@/lib/constants/images";
import { useFallbackImages } from "@/lib/hooks/images";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { Image } from "expo-image";
import React from "react";
import { Pressable, View } from "react-native";
import ThemedText from "../atoms/a-themed-text";
import { Fonts } from "@/lib/constants/theme";
import { hexToRgba } from "@/lib/utils/colors";
import { MynauiStarSolid } from "../icons/i-star";
import {
	HostAnalyticsQuery,
	HostingQuery,
} from "@/lib/services/graphql/generated";
import { capitalize } from "@/lib/utils/text";

type Props = {
	hosting:
	| HostAnalyticsQuery["hostAnalytics"]["topListing"]
	| HostingQuery["hosting"];
};

const TopListingCard: React.FC<Props> = ({ hosting }) => {
	const colors = useThemeColors();
	const { failedImages, handleImageError } = useFallbackImages();

	return (
		<Pressable
			className="flex-row gap-4 items-center border p-2 rounded-xl"
			style={{ borderColor: hexToRgba(colors.text, 0.1) }}
		>
			<View
				className="w-[107px] h-[90px] rounded-xl border overflow-hidden"
				style={{ borderColor: colors.text }}
			>
				<Image
					source={{
						uri: failedImages.has(0)
							? FALLBACK_IMAGE
							: hosting?.coverImage?.asset.publicUrl,
					}}
					style={{ height: "100%", width: "100%" }}
					contentFit="cover"
					transition={300}
					placeholder={{ blurhash: PROPERTY_BLURHASH }}
					placeholderContentFit="cover"
					cachePolicy="memory-disk"
					priority="high"
					onError={() => handleImageError(0)}
				/>
			</View>
			<View className="flex-1 justify-between gap-2">
				<ThemedText
					style={{ fontSize: 18, fontFamily: Fonts.bold }}
					ellipsizeMode="tail"
					numberOfLines={2}
				>
					{hosting?.title}
				</ThemedText>
				<ThemedText
					style={{ fontSize: 14, color: hexToRgba(colors.text, 0.6) }}
				>
					{hosting?.city}, {hosting?.state}
				</ThemedText>
				<View className="flex-row items-center justify-between">
					<ThemedText style={{ fontFamily: Fonts.medium, fontSize: 14 }}>
						₦{Number(hosting?.price ?? "0").toLocaleString()}{" "}
						{capitalize(hosting?.paymentInterval ?? "")}
					</ThemedText>
					{hosting?.totalRatings && (
						<View className="flex-row items-center gap-1">
							<MynauiStarSolid color={colors.accent} size={16} />
							<View className="flex-row gap-1 items-center">
								<ThemedText
									style={{
										fontFamily: Fonts.medium,
										fontSize: 14,
										color: hexToRgba(colors.text, 0.9),
									}}
								>
									{hosting?.averageRating?.toFixed(2)}
								</ThemedText>
								<ThemedText
									style={{
										fontFamily: Fonts.light,
										fontSize: 14,
										color: hexToRgba(colors.text, 0.8),
									}}
								>
									({hosting?.totalRatings})
								</ThemedText>
							</View>
						</View>
					)}
				</View>
			</View>
		</Pressable>
	);
};

export default TopListingCard;

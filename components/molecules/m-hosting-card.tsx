import { Hosting } from "@/lib/constants/mocks/hostings";
import React from "react";
import { View, Pressable } from "react-native"; // Pressable is now for an inner element
import ThemedText from "../atoms/a-themed-text";
import { Fonts } from "@/lib/constants/theme";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hexToRgba } from "@/lib/utils/colors";
import { formatDate } from "@/lib/utils/time";
import { MynauiStarSolid } from "../icons/i-star";
import Carousel from "../atoms/a-carousel";
import { Image } from "expo-image";
import Skeleton from "../atoms/a-skeleton";
import { useRouter } from "expo-router";
import { PhHeart } from "../icons/i-heart";
import { FALLBACK_IMAGE, PROPERTY_BLURHASH } from "@/lib/constants/images";

type Props = {
	hosting: Hosting;
	index?: number;
};

const HostingCard: React.FC<Props> = ({ hosting, index }) => {
	const colors = useThemeColors();
	const router = useRouter();
	const [failedImages, setFailedImages] = React.useState<Set<number>>(
		new Set(),
	);

	const borderColor = hexToRgba(colors.text, 0.5);

	const handleImageError = (index: number) => {
		setFailedImages((prev) => new Set(prev).add(index));
	};

	return (
		<View className="gap-2">
			<View
				style={{ height: 290, borderColor }}
				className="relative border overflow-hidden rounded-xl"
			>
				<Carousel
					autoplay
					style={{ height: "100%", width: "100%" }}
					interval={3000 + 1000 * (index ?? 1)}
				>
					{hosting.images.map((img, index) => (
						<Image
							source={{ uri: failedImages.has(index) ? FALLBACK_IMAGE : img }}
							style={{ height: "100%", width: "100%" }}
							contentFit="cover"
							transition={300}
							placeholder={{ blurhash: PROPERTY_BLURHASH }}
							placeholderContentFit="cover"
							cachePolicy="memory-disk"
							priority="high"
							onError={() => handleImageError(index)}
							key={index}
						/>
					))}
				</Carousel>
				<Pressable className="absolute top-4 right-4">
					<PhHeart />
				</Pressable>
			</View>
			<Pressable onPress={() => router.push(`/hostings/${hosting.id}`)}>
				<View style={{ borderColor }} className="p-3 rounded-xl border gap-0.5">
					<View className="flex-row justify-between">
						<ThemedText
							numberOfLines={1}
							ellipsizeMode="tail"
							style={{ fontFamily: Fonts.bold, fontSize: 14 }}
							className="max-w-[50%]"
						>
							{hosting.state}, {hosting.country}
						</ThemedText>
						<ThemedText style={{ fontFamily: Fonts.bold, fontSize: 14 }}>
							₦{hosting.price.toLocaleString()} {hosting.pricing}
						</ThemedText>
					</View>
					<ThemedText
						style={{ fontSize: 14, color: hexToRgba(colors.text, 0.8) }}
					>
						{hosting.address}
					</ThemedText>
					<View className="flex-row items-center justify-between">
						<ThemedText
							style={{ fontSize: 14, color: hexToRgba(colors.text, 0.8) }}
						>
							{formatDate(hosting.dateAdded)}
						</ThemedText>
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
									{hosting.averageRating.toFixed(2)}
								</ThemedText>
								<ThemedText
									style={{
										fontFamily: Fonts.light,
										fontSize: 14,
										color: hexToRgba(colors.text, 0.8),
									}}
								>
									({hosting.ratingCount})
								</ThemedText>
							</View>
						</View>
					</View>
				</View>
			</Pressable>
		</View>
	);
};

export default HostingCard;

export const HostingCardSkeleton = () => {
	return (
		<View className="gap-2">
			<Skeleton style={{ height: 290, borderRadius: 12 }} />
			<Skeleton style={{ height: 85, borderRadius: 12 }} />
		</View>
	);
};

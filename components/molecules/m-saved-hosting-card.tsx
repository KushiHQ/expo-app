import { FALLBACK_IMAGE, PROPERTY_BLURHASH } from "@/lib/constants/images";
import { Hosting } from "@/lib/constants/mocks/hostings";
import { Image } from "expo-image";
import React from "react";
import { Pressable, View } from "react-native";
import ThemedText from "../atoms/a-themed-text";
import { MynauiStarSolid } from "../icons/i-star";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { Fonts } from "@/lib/constants/theme";
import Skeleton from "../atoms/a-skeleton";
import { useRouter } from "expo-router";
import { PhHeart, PhHeartFill } from "../icons/i-heart";
import { hexToRgba } from "@/lib/utils/colors";
import Checkbox from "../atoms/a-checkbox";
import { useFallbackImages } from "@/lib/hooks/images";

type Props = {
	hosting: Hosting;
	selectMode?: boolean;
	selected?: boolean;
	onSelect?: (id: string) => void;
	onDeSelect?: (id: string) => void;
	onSelectMode?: () => void;
};

const SavedHostingCard: React.FC<Props> = ({
	hosting,
	selected,
	selectMode,
	onSelect,
	onDeSelect,
	onSelectMode,
}) => {
	const [liked, setLiked] = React.useState(false);
	const colors = useThemeColors();
	const router = useRouter();
	const { handleImageError, failedImages } = useFallbackImages();

	const img = hosting.images.at(0);

	return (
		<Pressable
			className="mb-2 gap-1"
			onPress={() => router.push(`/hostings/${hosting.id}`)}
			onLongPress={onSelectMode}
		>
			<View className="h-[130px] relative">
				<Image
					source={{ uri: failedImages.has(0) ? FALLBACK_IMAGE : img }}
					style={{ height: "100%", width: "100%", borderRadius: 12 }}
					contentFit="cover"
					transition={300}
					placeholder={{ blurhash: PROPERTY_BLURHASH }}
					placeholderContentFit="cover"
					cachePolicy="memory-disk"
					priority="high"
					onError={() => handleImageError(0)}
				/>
				<View className="absolute top-1 right-1">
					{selectMode ? (
						<Checkbox
							checked={selected}
							onValueChange={(checked) => {
								if (checked) {
									onSelect?.(hosting.id);
								} else {
									onDeSelect?.(hosting.id);
								}
							}}
							size={24}
							color={colors.primary}
							iconStyles={{
								position: "absolute",
								left: -2.5,
							}}
							style={{
								backgroundColor: "white",
								borderRadius: 4,
								width: 18,
								height: 18,
								alignContent: "center",
								justifyContent: "center",
							}}
						/>
					) : (
						<Pressable
							onPress={() => setLiked((c) => !c)}
							className="w-7 h-7 items-center justify-center rounded-full"
							style={{ backgroundColor: hexToRgba(colors.text, 0.4) }}
						>
							{liked ? (
								<PhHeartFill size={24} color={colors.error} />
							) : (
								<PhHeart size={24} color={colors.background} />
							)}
						</Pressable>
					)}
				</View>
			</View>
			<View>
				<ThemedText
					numberOfLines={1}
					ellipsizeMode="tail"
					style={{ fontFamily: Fonts.medium }}
				>
					{hosting.title}
				</ThemedText>
				<View className="flex-row items-center gap-1">
					<MynauiStarSolid color={colors.accent} size={16} />
					<ThemedText>{hosting.ratingCount.toFixed(2)}</ThemedText>
				</View>
			</View>
		</Pressable>
	);
};

export default SavedHostingCard;

export const SavedHostingCardSkeleton = () => {
	return (
		<View className="mb-2 gap-2">
			<View className="h-[130px]">
				<Skeleton style={{ height: "100%", width: "100%", borderRadius: 12 }} />
			</View>
			<View className="gap-1">
				<Skeleton style={{ height: 17, width: "100%", borderRadius: 12 }} />
				<Skeleton
					style={{ height: 16, width: "100%", maxWidth: 50, borderRadius: 12 }}
				/>
			</View>
		</View>
	);
};

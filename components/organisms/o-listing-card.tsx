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

type Props = {
	hosting: HostListingsQuery["hostings"][number];
};

const ListingCard: React.FC<Props> = ({ hosting }) => {
	const router = useRouter();
	const colors = useThemeColors();
	const [optionsOpen, setOptionsOpen] = React.useState(false);
	const { failedImages, handleImageError } = useFallbackImages();

	const statusColor =
		hosting.publishStatus === PublishStatus.Live
			? colors.success
			: hosting.publishStatus === PublishStatus.Draft
				? colors.accent
				: hosting.publishStatus === PublishStatus.Inreview
					? colors.primary
					: colors.error;
	return (
		<>
			<Pressable onPress={() => router.push(`/hostings/${hosting.id}`)}>
				<View
					className="gap-4 border p-4 rounded-xl"
					style={{ borderColor: hexToRgba(colors.text, 0.2) }}
				>
					<View>
						<View className="flex-row items-start justify-between">
							<ThemedText
								className="flex-1"
								numberOfLines={2}
								ellipsizeMode="tail"
								style={{ fontSize: 14, fontFamily: Fonts.medium }}
							>
								{hosting.title}
							</ThemedText>
							<Pressable
								onPress={() => setOptionsOpen(true)}
								className="p-1.5 rounded-md"
								style={{ backgroundColor: hexToRgba(colors.text, 0.2) }}
							>
								<EllipsisVertical color={colors.text} size={18} />
							</Pressable>
						</View>
						<ThemedText
							numberOfLines={1}
							ellipsizeMode="tail"
							style={{ fontSize: 14, color: hexToRgba(colors.text, 0.7) }}
						>
							{hosting.city}, {hosting.state}
						</ThemedText>
					</View>
					<View className="w-full aspect-[140/80]">
						<Image
							source={{
								uri: failedImages.has(0)
									? FALLBACK_IMAGE
									: hosting.coverImage?.asset.publicUrl,
							}}
							style={{
								height: "100%",
								width: "100%",
								borderRadius: 12,
							}}
							contentFit="cover"
							transition={300}
							placeholder={{ blurhash: PROPERTY_BLURHASH }}
							placeholderContentFit="cover"
							cachePolicy="memory-disk"
							priority="high"
							onError={() => handleImageError(0)}
						/>
					</View>
				</View>
				<View className="flex-row items-center justify-between px-2">
					<ThemedText
						style={{ fontSize: 10, color: hexToRgba(colors.text, 0.6) }}
					>
						{new Date(hosting.dateAdded).toLocaleDateString()}
					</ThemedText>
					<View className="flex-row items-center">
						<IconParkOutlineDot color={statusColor} size={10} />
						<Text
							style={{
								fontSize: 10,
								color: statusColor,
								textTransform: "capitalize",
							}}
						>
							{hosting.publishStatus}
						</Text>
					</View>
				</View>
			</Pressable>
			<ListingOptions
				open={optionsOpen}
				onClose={() => setOptionsOpen(false)}
				hosting={hosting}
			/>
		</>
	);
};

export default ListingCard;

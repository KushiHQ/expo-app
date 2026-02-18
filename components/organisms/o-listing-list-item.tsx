import { FALLBACK_IMAGE, PROPERTY_BLURHASH } from "@/lib/constants/images";
import { useFallbackImages } from "@/lib/hooks/images";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { Image } from "expo-image";
import React from "react";
import { Pressable, Text, View } from "react-native";
import ThemedText from "../atoms/a-themed-text";
import { Fonts } from "@/lib/constants/theme";
import { EllipsisVertical } from "lucide-react-native";
import { hexToRgba } from "@/lib/utils/colors";
import { IconParkOutlineDot } from "../icons/i-circle";
import ListingOptions from "../molecules/m-listing-options";
import { useRouter } from "expo-router";
import {
	HostListingsQuery,
	PublishStatus,
} from "@/lib/services/graphql/generated";

type Props = {
	hosting: HostListingsQuery["hostings"][number];
};

const ListingListItem: React.FC<Props> = ({ hosting }) => {
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
			<Pressable
				className="flex-row items-center gap-4"
				onPress={() => router.push(`/hostings/form/step-1?id=${hosting.id}`)}
			>
				<View className="h-[80px] w-[100px]">
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
				<View className="flex-1 gap-2">
					<View className="flex-row items-start justify-between">
						<ThemedText
							className="flex-1"
							numberOfLines={2}
							ellipsizeMode="tail"
							style={{ fontSize: 14, fontFamily: Fonts.medium }}
						>
							{hosting.title}
						</ThemedText>
						<Pressable onPress={() => setOptionsOpen(true)}>
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
					<View className="flex-row items-center gap-8">
						<ThemedText
							style={{ fontSize: 10, color: hexToRgba(colors.text, 0.6) }}
						>
							{new Date(hosting.createdAt).toLocaleDateString()}
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

export default ListingListItem;

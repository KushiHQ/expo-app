import { View } from "react-native";
import BottomSheet from "../atoms/a-bottom-sheet";
import React from "react";
import { Hosting } from "@/lib/constants/mocks/hostings";
import { Image } from "expo-image";
import { useFallbackImages } from "@/lib/hooks/images";
import { FALLBACK_IMAGE, PROPERTY_BLURHASH } from "@/lib/constants/images";
import ThemedText from "../atoms/a-themed-text";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hexToRgba } from "@/lib/utils/colors";
import { Fonts } from "@/lib/constants/theme";
import Button from "../atoms/a-button";
import { useRouter } from "expo-router";
import ThemedModal from "./m-modal";

type Props = {
	open: boolean;
	onClose: () => void;
	hosting: Hosting;
};

const ListingOptions: React.FC<Props> = ({ open, onClose, hosting }) => {
	const router = useRouter();
	const colors = useThemeColors();
	const [deleteOpen, setDeleteOpen] = React.useState(false);
	const { failedImages, handleImageError } = useFallbackImages();
	const img = hosting.images.at(0);

	return (
		<>
			<BottomSheet isVisible={open} onClose={onClose}>
				<View className="items-center py-8 gap-8">
					<View className="h-[100px] w-[120px]">
						<Image
							source={{
								uri: failedImages.has(0) ? FALLBACK_IMAGE : img,
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
					<View className="items-center gap-2">
						<ThemedText
							className="text-center max-w-[300px]"
							style={{
								color: hexToRgba(colors.text, 0.8),
								fontFamily: Fonts.medium,
							}}
						>
							{hosting.title}
						</ThemedText>
						<ThemedText
							style={{ fontSize: 14, color: hexToRgba(colors.text, 0.6) }}
						>
							{hosting.city}
						</ThemedText>
					</View>
					<View className="w-full gap-4">
						<Button
							type="primary"
							onPress={() =>
								router.push(`/hostings/form/step-2?hosting=${hosting.id}`)
							}
						>
							<ThemedText content="primary">Edit Listing</ThemedText>
						</Button>
						<Button
							style={{ backgroundColor: hexToRgba(colors.error, 0.15) }}
							onPress={() => setDeleteOpen(true)}
						>
							<ThemedText style={{ color: colors.error }}>
								Delete Listing
							</ThemedText>
						</Button>
					</View>
				</View>
			</BottomSheet>
			<ThemedModal visible={deleteOpen} onClose={() => setDeleteOpen(false)}>
				<View className="items-center gap-2 mt-8">
					<ThemedText style={{ fontFamily: Fonts.medium }}>
						Are you certain you want to delete this listing?
					</ThemedText>
					<ThemedText
						style={{ color: hexToRgba(colors.text, 0.6), fontSize: 14 }}
					>
						Once deleted, this action cannot be reversed.
					</ThemedText>
					<View className="flex-row gap-4 w-full mt-8">
						<Button
							type="tinted"
							className="flex-1"
							onPress={() => setDeleteOpen(false)}
						>
							<ThemedText content="tinted">Cancel</ThemedText>
						</Button>
						<Button
							type="error"
							className="flex-1"
							onPress={() => {
								setDeleteOpen(false);
								onClose();
							}}
						>
							<ThemedText content="error">Delete</ThemedText>
						</Button>
					</View>
				</View>
			</ThemedModal>
		</>
	);
};

export default ListingOptions;

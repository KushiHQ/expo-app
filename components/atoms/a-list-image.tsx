import { FALLBACK_IMAGE, PROPERTY_BLURHASH } from "@/lib/constants/images";
import { useFallbackImages } from "@/lib/hooks/images";
import { Image } from "expo-image";
import { X } from "lucide-react-native";
import React from "react";
import { Pressable, View } from "react-native";

type Props = {
	src: string;
	imageIndex: number;
	onDeleteImage?: (imageIndex: number) => void;
};

const ListImage: React.FC<Props> = ({
	src,
	imageIndex,
	onDeleteImage: onDeleteImage,
}) => {
	const { failedImages, handleImageError } = useFallbackImages();

	return (
		<View className="w-20 h-16 relative">
			<Image
				source={{
					uri: failedImages.has(0) ? FALLBACK_IMAGE : src,
				}}
				style={{
					height: "100%",
					width: "100%",
					borderRadius: 8,
				}}
				contentFit="cover"
				transition={300}
				placeholder={{ blurhash: PROPERTY_BLURHASH }}
				placeholderContentFit="cover"
				cachePolicy="memory-disk"
				priority="high"
				onError={() => handleImageError(0)}
			/>
			<Pressable
				onPress={() => onDeleteImage?.(imageIndex)}
				className="w-6 h-6 items-center justify-center bg-white rounded absolute top-0 right-0"
			>
				<X color="#000000" size={12} />
			</Pressable>
		</View>
	);
};

export default ListImage;

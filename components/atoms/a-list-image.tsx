import { PROPERTY_BLURHASH } from "@/lib/constants/images";
import { usePhotoGalleryScreen } from "@/lib/hooks/camera";
import { cast } from "@/lib/types/utils";
import { Image, ImageStyle } from "expo-image";
import { usePathname } from "expo-router";
import { X } from "lucide-react-native";
import React from "react";
import { DimensionValue, Pressable, StyleProp } from "react-native";

type Props = {
	src: string;
	index: number;
	images?: string[];
	deletable?: boolean;
	openable?: boolean;
	width?: DimensionValue;
	height?: DimensionValue;
	style?: StyleProp<ImageStyle>;
	onDelete?: (index: number) => void;
};

const ListImage: React.FC<Props> = ({
	src,
	index,
	deletable,
	openable,
	images,
	style,
	width,
	height,
	onDelete,
}) => {
	const { redirect } = usePhotoGalleryScreen();
	const pathname = usePathname();

	const handleOpenGallery = () => {
		if (!openable) return;
		if (!images?.length) return;

		redirect({
			redirect: cast(pathname),
			images,
			activeIndex: index,
			viewOnly: true,
			push: true,
		});
	};

	return (
		<Pressable
			onPress={handleOpenGallery}
			className="relative"
			style={{ width: width ?? 80, height: height ?? 64 }}
		>
			<Image
				source={{
					uri: src,
				}}
				style={[
					{
						height: "100%",
						width: "100%",
						borderRadius: 8,
					},
					style,
				]}
				contentFit="cover"
				transition={300}
				placeholder={{ blurhash: PROPERTY_BLURHASH }}
				placeholderContentFit="cover"
				cachePolicy="memory-disk"
				priority="high"
			/>
			{deletable && (
				<Pressable
					onPress={() => onDelete?.(index)}
					className="w-6 h-6 items-center justify-center bg-white rounded absolute top-0 right-0"
				>
					<X color="#000000" size={12} />
				</Pressable>
			)}
		</Pressable>
	);
};

export default ListImage;

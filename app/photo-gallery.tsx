import React, { useState, useRef } from "react";
import {
	View,
	StyleSheet,
	FlatList,
	Image,
	useWindowDimensions,
	useColorScheme,
} from "react-native";
import Button from "@/components/atoms/a-button";
import ThemedText from "@/components/atoms/a-themed-text";
import { StatusBar } from "expo-status-bar";
import { useAtom } from "jotai";
import { galleryAtom } from "@/lib/stores/gallery";
import { useLocalSearchParams, useRouter } from "expo-router";
import ImagePicker from "react-native-image-crop-picker";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { FluentImageEdit24Regular } from "@/components/icons/i-edit";
import { Check } from "lucide-react-native";
import { cast } from "@/lib/types/utils";

export default function PhotoGalleryScreen() {
	const router = useRouter();
	const { width, height } = useWindowDimensions();
	const { redirect } = useLocalSearchParams();
	const [photos, setPhotos] = useAtom(galleryAtom);
	const [currentIndex, setCurrentIndex] = useState(0);
	const colors = useThemeColors();
	const colorScheme = useColorScheme() ?? "light";

	const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

	const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
		if (viewableItems.length > 0) {
			setCurrentIndex(viewableItems[0].index);
		}
	}).current;

	const onUsePhotos = () => {
		if (redirect) {
			router.replace(cast(`${redirect}`), {});
		} else {
			router.back();
		}
	};

	const handleEditPhoto = async () => {
		if (photos.length === 0) return;
		const currentPhotoUri = photos[currentIndex];

		try {
			const croppedImage = await ImagePicker.openCropper({
				path: currentPhotoUri,
				cropping: true,
				mediaType: "photo",
				cropperActiveWidgetColor: colors.primary,
				cropperStatusBarLight: colorScheme === "light",
				cropperToolbarColor: colors.background,
				cropperToolbarWidgetColor: colors.text,
				freeStyleCropEnabled: true,
				enableRotationGesture: true,
			});

			const newPhotos = photos.map((uri, index) =>
				index === currentIndex ? croppedImage.path : uri,
			);
			setPhotos(newPhotos);
		} catch (error: any) {
			if (error.code !== "E_PICKER_CANCELLED") {
				console.error("Error cropping photo: ", error);
				alert("Could not crop photo.");
			}
		}
	};

	return (
		<View style={styles.container}>
			<StatusBar style="light" />

			<FlatList
				data={photos}
				keyExtractor={(item) => item}
				horizontal
				pagingEnabled
				showsHorizontalScrollIndicator={false}
				renderItem={({ item }) => (
					<Image
						source={{ uri: item }}
						style={{ width: width, height: height }}
						resizeMode="contain"
					/>
				)}
				onViewableItemsChanged={onViewableItemsChanged}
				viewabilityConfig={viewabilityConfig}
			/>

			<View style={styles.actions}>
				<Button onPress={handleEditPhoto} className="flex-1">
					<View className="flex-row gap-2">
						<FluentImageEdit24Regular color="#fff" size={20} />
						<ThemedText style={{ fontSize: 14, color: "#fff" }}>
							Edit
						</ThemedText>
					</View>
				</Button>
				<Button onPress={onUsePhotos} className="flex-1">
					<View className="flex-row gap-2">
						<Check color={colors.success} size={20} />
						<ThemedText style={{ fontSize: 14, color: colors.success }}>
							Use {photos.length} Photos
						</ThemedText>
					</View>
				</Button>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "black",
	},
	actions: {
		position: "absolute",
		bottom: 40,
		left: 20,
		right: 20,
		flexDirection: "row",
		gap: 16,
	},
});

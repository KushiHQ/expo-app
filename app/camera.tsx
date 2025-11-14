import DetailsLayout from "@/components/layouts/details";
import { View, StyleSheet, Pressable, Image, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import React, { useState, useRef } from "react";
import ThemedText from "@/components/atoms/a-themed-text";
import Button from "@/components/atoms/a-button";
import { GravityUiArrowsRotateRight } from "@/components/icons/i-rotate";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useGalleryStore } from "@/lib/stores/gallery";
import { getLocationAsync } from "@/lib/utils/locations";
import { LocationObject } from "expo-location";

export default function CameraPage() {
	const { images } = useLocalSearchParams();
	const cameraRef = useRef<CameraView>(null);
	const [facing, setFacing] = useState<CameraType>("back");
	const { redirect } = useLocalSearchParams();
	const [permission, requestPermission] = useCameraPermissions();
	const { gallery, append, setGallery, setActiveIndex } = useGalleryStore();
	const [location, setLocation] = React.useState<LocationObject>();
	const navigation = useRouter();

	useFocusEffect(
		React.useCallback(() => {
			if (Array.isArray(images)) {
				setGallery(images.map((i) => i.replaceAll(",", "")));
				setActiveIndex(0);
			} else if (images) {
				append(images.replaceAll(",", ""));
			}
			setActiveIndex(0);
		}, []),
	);

	React.useEffect(() => {
		(async () => {
			const locationCoords = await getLocationAsync();
			if (locationCoords) {
				setLocation(locationCoords);
			}
		})();
	}, []);

	if (!permission) {
		return <View style={styles.container} />;
	}

	if (!permission.granted) {
		return (
			<DetailsLayout
				backgroundStyles={{
					backgroundColor: "#000000",
				}}
				background="transparent"
				backButton="solid"
			>
				<View style={styles.permissionContainer}>
					<ThemedText
						style={{ textAlign: "center", marginBottom: 20, color: "white" }}
					>
						We need camera permission to take photos
					</ThemedText>
					<Button onPress={requestPermission} type="primary">
						<ThemedText content="primary">Grant Permission</ThemedText>
					</Button>
				</View>
			</DetailsLayout>
		);
	}

	const toggleCameraFacing = () => {
		setFacing((current) => (current === "back" ? "front" : "back"));
	};

	const takePicture = async () => {
		if (cameraRef.current) {
			try {
				const photo = await cameraRef.current?.takePictureAsync({
					quality: 1,
					exif: true,
					additionalExif: location
						? {
								GPSLatitude: Math.abs(location.coords.latitude),
								GPSLongitude: Math.abs(location.coords.longitude),
								GPSLatitudeRef: location.coords.latitude >= 0 ? "N" : "S",
								GPSLongitudeRef: location.coords.longitude >= 0 ? "E" : "W",
								GPSAltitude: location.coords.altitude || 0,
								GPSSpeed: location.coords.speed || 0,
								GPSTimeStamp: new Date().toISOString(),
							}
						: {},
				});

				if (photo) {
					append(photo.uri);
				}
			} catch (error) {
				console.error("Error taking picture:", error);
				Alert.alert("Error", "Failed to take picture");
			}
		}
	};

	const openGallery = () => {
		if (gallery.length === 0) return;

		navigation.replace(`/photo-gallery?redirect=${redirect}`);
	};

	return (
		<>
			<StatusBar style="light" />
			<DetailsLayout
				contentStyles={{ paddingInline: 0 }}
				backgroundStyles={{
					backgroundColor: "#000000",
				}}
				background="transparent"
				backButton="solid"
			>
				<View style={styles.cameraWrapper}>
					<CameraView ref={cameraRef} style={styles.camera} facing={facing} />

					<View style={styles.controlsOverlay} pointerEvents="box-none">
						<View style={styles.controls}>
							<Pressable style={styles.galleryPreview} onPress={openGallery}>
								<Image
									source={
										gallery.length > 0
											? { uri: gallery[gallery.length - 1] }
											: require("@/assets/images/image-placeholder.jpg")
									}
									style={styles.galleryImage}
								/>
							</Pressable>

							<Pressable
								onPress={takePicture}
								style={styles.captureButtonOuter}
							>
								<View style={styles.captureButtonInner} />
							</Pressable>

							<Pressable onPress={toggleCameraFacing} style={styles.flipButton}>
								<GravityUiArrowsRotateRight color="white" size={32} />
							</Pressable>
						</View>
					</View>
				</View>
			</DetailsLayout>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#000",
	},
	permissionContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
	},
	cameraWrapper: {
		flex: 1,
		position: "relative",
	},
	camera: {
		flex: 1,
		width: "100%",
	},
	controlsOverlay: {
		...StyleSheet.absoluteFillObject,
		justifyContent: "flex-end",
	},
	controls: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 30,
		paddingBlock: 40,
		backgroundColor: "#000",
	},
	galleryPreview: {
		width: 60,
		height: 60,
		borderRadius: 999,
		overflow: "hidden",
		borderWidth: 2,
		borderColor: "white",
	},
	galleryImage: {
		width: "100%",
		height: "100%",
	},
	captureButtonOuter: {
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: "rgba(255, 255, 255, 0.3)",
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 4,
		borderColor: "white",
	},
	captureButtonInner: {
		width: 68,
		height: 68,
		borderRadius: 34,
		backgroundColor: "white",
	},
	flipButton: {
		width: 60,
		height: 60,
		borderRadius: 30,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		justifyContent: "center",
		alignItems: "center",
	},
	previewContainer: {
		flex: 1,
		position: "relative",
	},
	preview: {
		flex: 1,
		width: "100%",
	},
	previewActions: {
		position: "absolute",
		bottom: 40,
		left: 20,
		right: 20,
		flexDirection: "row",
		gap: 16,
	},
});

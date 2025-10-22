import DetailsLayout from "@/components/layouts/details";
import { View, StyleSheet, Pressable, Image } from "react-native";
import { StatusBar } from "expo-status-bar";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { useState, useRef } from "react";
import ThemedText from "@/components/atoms/a-themed-text";
import Button from "@/components/atoms/a-button";
import { GravityUiArrowsRotateRight } from "@/components/icons/i-rotate";

export default function CameraPage() {
	const cameraRef = useRef<CameraView>(null);
	const [facing, setFacing] = useState<CameraType>("back");
	const [permission, requestPermission] = useCameraPermissions();
	const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

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
			const photo = await cameraRef.current.takePictureAsync({
				quality: 1,
			});
			if (photo) {
				setCapturedPhoto(photo.uri);
			}
		}
	};

	const retakePhoto = () => {
		setCapturedPhoto(null);
	};

	if (capturedPhoto) {
		return (
			<>
				<StatusBar style="light" />
				<DetailsLayout
					backgroundStyles={{
						backgroundColor: "#000000",
					}}
					background="transparent"
					backButton="solid"
				>
					<View style={styles.previewContainer}>
						<Image source={{ uri: capturedPhoto }} style={styles.preview} />
						<View style={styles.previewActions}>
							<Button onPress={retakePhoto} type="primary" className="flex-1">
								<ThemedText content="primary">Retake</ThemedText>
							</Button>
							<Button onPress={() => {}} type="primary" className="flex-1">
								<ThemedText content="primary">Use Photo</ThemedText>
							</Button>
						</View>
					</View>
				</DetailsLayout>
			</>
		);
	}

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
							<Pressable style={styles.galleryPreview}>
								<Image
									source={require("@/assets/images/house-bg.png")}
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

import {
	useCameraDevice,
	useCameraPermission,
	usePhotoOutput,
	Camera,
} from "react-native-vision-camera";
import type { Face } from "react-native-vision-camera-face-detector";
import { useFaceDetectorOutput } from "react-native-vision-camera-face-detector";
import Stepper from "@/components/atoms/a-steppter";
import DetailsLayout from "@/components/layouts/details";
import { KYC_ONBOARDING_STEPS } from "@/lib/constants/kyc/onboarding";
import { cast } from "@/lib/types/utils";
import { Dimensions, View, StyleSheet, ColorValue } from "react-native";
import React, { useCallback, useEffect } from "react";
import ThemedText from "@/components/atoms/a-themed-text";
import { hexToRgba } from "@/lib/utils/colors";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import Button from "@/components/atoms/a-button";
import { Image } from "expo-image";
import { formMutation } from "@/lib/services/graphql/utils/fetch";
import {
	Kyc,
	UploadKycImageMutation,
	UploadKycImageMutationVariables,
	User,
} from "@/lib/services/graphql/generated";
import { UPLOAD_KYC_IMAGE } from "@/lib/services/graphql/requests/mutations/users";
import { generateRNFile } from "@/lib/utils/file";
import { handleError } from "@/lib/utils/error";
import Toast from "react-native-toast-message";
import * as Haptics from "expo-haptics";
import { useUser } from "@/lib/hooks/user";
import LoadingModal from "@/components/atoms/a-loading-modal";
import { useRouter } from "expo-router";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const FRAME_WIDTH = SCREEN_WIDTH * 0.65;
const FRAME_HEIGHT = 340;
const CORNER_LENGTH = 40;
const CORNER_THICKNESS = 5;
const CORNER_RADIUS = 24;

const CameraFrame = ({ borderColor }: { borderColor: ColorValue }) => {
	return (
		<View style={styles.frameContainer} pointerEvents="none">
			<View style={styles.frameArea}>
				{/* Top Left Corner */}
				<View
					style={[
						styles.corner,
						styles.topLeft,
						{
							borderColor,
							borderTopWidth: CORNER_THICKNESS,
							borderLeftWidth: CORNER_THICKNESS,
							borderTopLeftRadius: CORNER_RADIUS,
						},
					]}
				/>
				{/* Top Right Corner */}
				<View
					style={[
						styles.corner,
						styles.topRight,
						{
							borderColor,
							borderTopWidth: CORNER_THICKNESS,
							borderRightWidth: CORNER_THICKNESS,
							borderTopRightRadius: CORNER_RADIUS,
						},
					]}
				/>
				{/* Bottom Left Corner */}
				<View
					style={[
						styles.corner,
						styles.bottomLeft,
						{
							borderColor,
							borderBottomWidth: CORNER_THICKNESS,
							borderLeftWidth: CORNER_THICKNESS,
							borderBottomLeftRadius: CORNER_RADIUS,
						},
					]}
				/>
				{/* Bottom Right Corner */}
				<View
					style={[
						styles.corner,
						styles.bottomRight,
						{
							borderColor,
							borderBottomWidth: CORNER_THICKNESS,
							borderRightWidth: CORNER_THICKNESS,
							borderBottomRightRadius: CORNER_RADIUS,
						},
					]}
				/>
			</View>
		</View>
	);
};

export default function KycImage() {
	const router = useRouter();
	const { updateUser, user } = useUser();
	const device = useCameraDevice("front");
	const colors = useThemeColors();
	const [faceDetected, setFaceDetected] = React.useState(false);
	const { hasPermission, requestPermission } = useCameraPermission();
	const [kycImage, setKycImage] = React.useState(
		user.user?.kyc?.image?.publicUrl,
	);
	const [uploading, setUploading] = React.useState(false);

	const photoOutput = usePhotoOutput({ quality: 0.9 });

	const onFacesDetected = useCallback(
		(faces: Face[]) => {
			if (faces.length === 0) {
				setFaceDetected(false);
				return;
			}

			const face = faces[0];
			const bounds = face.bounds;

			const screenCenterX = SCREEN_WIDTH / 2;
			const screenCenterY = SCREEN_HEIGHT / 2;

			const faceCenterX = bounds.x + bounds.width / 2;
			const faceCenterY = bounds.y + bounds.height / 2;

			const xThreshold = SCREEN_WIDTH * 0.2;
			const yThreshold = SCREEN_HEIGHT * 0.2;

			const isCenteredX = Math.abs(screenCenterX - faceCenterX) < xThreshold;
			const isCenteredY = Math.abs(screenCenterY - faceCenterY) < yThreshold;
			const isGoodSize = bounds.width > SCREEN_WIDTH * 0.25;

			setFaceDetected(isCenteredX && isCenteredY && isGoodSize);
		},
		[],
	);

	const faceOutput = useFaceDetectorOutput({
		performanceMode: "fast",
		autoMode: true,
		windowWidth: SCREEN_WIDTH,
		windowHeight: SCREEN_HEIGHT,
		onFacesDetected,
		onError: (error: Error) => {
			console.error("Face detection error:", error);
		},
	});

	useEffect(() => {
		if (!hasPermission) {
			requestPermission();
		}
	}, [hasPermission, requestPermission]);

	const handleCapture = async () => {
		try {
			const photo = await photoOutput.capturePhoto({ flashMode: "off" }, {});
			const tempPath = await photo.saveToTemporaryFileAsync();
			photo.dispose();
			setKycImage(`file://${tempPath}`);
		} catch (error) {
			console.error("Failed to capture photo:", error);
		}
	};

	const handleUploadImage = () => {
		if (!kycImage) return;

		setUploading(true);
		formMutation<UploadKycImageMutation, UploadKycImageMutationVariables>(
			UPLOAD_KYC_IMAGE,
			{
				file: generateRNFile(kycImage),
			},
		)
			.then((res) => {
				if (res.error) {
					handleError(res.error);
				}
				if (res.data) {
					Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
					Toast.show({
						type: "success",
						text1: "Success",
						text2: "KYC Image uploaded",
					});
					updateUser({
						user: {
							...(user.user ?? ({} as User)),
							kyc: {
								...(user.user?.kyc ?? ({} as Kyc)),
								image: res.data.uploadKycImage.image,
							},
						},
					});
				}
			})
			.finally(() => {
				setUploading(false);
			});
	};

	return (
		<>
			<DetailsLayout
				title="Facial Recognition"
				footer={
					<View
						className="p-4 border-t"
						style={{
							backgroundColor: colors.background,
							borderColor: hexToRgba(colors.text, 0.2),
						}}
					>
						<Button
							disabled={!user.user?.kyc?.image?.publicUrl}
							onPress={() => router.push("/kyc/nin")}
							type="primary"
							className="py-[18px]"
						>
							<ThemedText content="primary">Continue</ThemedText>
						</Button>
					</View>
				}
			>
				<View className="mt-4">
					<Stepper
						steps={KYC_ONBOARDING_STEPS.length}
						currentStep={2}
						titles={cast(KYC_ONBOARDING_STEPS)}
					/>
					<View className="mt-8">
						<View className="max-w-[400px] self-center">
							{kycImage ? (
								<View style={styles.cameraContainer}>
									<Image
										source={{ uri: kycImage }}
										style={{ width: "100%", height: "100%" }}
									/>
								</View>
							) : (
								device && (
									<View style={styles.cameraContainer}>
										<Camera
											style={StyleSheet.absoluteFill}
											device={device}
											isActive={true}
											outputs={[photoOutput, faceOutput]}
										/>
										<CameraFrame
											borderColor={faceDetected ? colors.success : "white"}
										/>
									</View>
								)
							)}
						</View>
						{kycImage ? (
							<View className="items-center mt-8">
								<ThemedText
									type="subtitle"
									className="text-center max-w-[400px]"
									style={{ color: hexToRgba(colors.text, 0.6) }}
								>
									Please ensure your face is fully visible and well-lit. This
									image will be used to verify your identity against your NIN
									and BVN records.
								</ThemedText>
								<View className="flex-row  max-w-[400px] gap-4">
									<Button
										onPress={() => setKycImage(undefined)}
										style={{
											borderColor: hexToRgba(colors.accent, 0.5),
											borderWidth: 1,
										}}
										className="mt-8 flex-1"
									>
										<ThemedText style={{ color: colors.accent }}>
											Retake
										</ThemedText>
									</Button>
									<Button
										onPress={handleUploadImage}
										disabled={!kycImage.startsWith("file")}
										style={{
											borderColor: hexToRgba(colors.primary, 0.7),
											borderWidth: 1,
										}}
										className="mt-8 flex-1"
									>
										<ThemedText content="tinted">Confirm</ThemedText>
									</Button>
								</View>
							</View>
						) : (
							<View className="items-center mt-8">
								<ThemedText
									type="subtitle"
									className="text-center max-w-[400px]"
									style={{ color: hexToRgba(colors.text, 0.6) }}
								>
									Please keep your face in center of the screen and facing
									forward
								</ThemedText>
								<Button
									onPress={handleCapture}
									disabled={!faceDetected}
									type="primary"
									className="mt-8 w-full max-w-[300px]"
								>
									<ThemedText content="primary">Capture</ThemedText>
								</Button>
							</View>
						)}
					</View>
				</View>
			</DetailsLayout>
			<LoadingModal visible={uploading} />
		</>
	);
}

const styles = StyleSheet.create({
	cameraContainer: {
		height: 450,
		width: SCREEN_WIDTH * 0.8,
		maxWidth: 400,
		borderRadius: 12,
		overflow: "hidden",
		position: "relative",
	},
	frameContainer: {
		...StyleSheet.absoluteFillObject,
		justifyContent: "center",
		alignItems: "center",
	},
	frameArea: {
		width: FRAME_WIDTH,
		height: FRAME_HEIGHT,
		position: "relative",
	},
	corner: {
		position: "absolute",
		width: CORNER_LENGTH,
		height: CORNER_LENGTH,
	},
	topLeft: { top: 0, left: 0 },
	topRight: { top: 0, right: 0 },
	bottomLeft: { bottom: 0, left: 0 },
	bottomRight: { bottom: 0, right: 0 },
});

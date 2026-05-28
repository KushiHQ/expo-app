import {
  useCameraDevice,
  useCameraPermission,
  usePhotoOutput,
  Camera,
} from 'react-native-vision-camera';
import { createFaceDetectorOutput } from 'react-native-vision-camera-face-detector';
import Stepper from '@/components/atoms/a-steppter';
import DetailsLayout from '@/components/layouts/details';
import { KYC_ONBOARDING_STEPS } from '@/lib/constants/kyc/onboarding';
import { cast } from '@/lib/types/utils';
import { Dimensions, View, StyleSheet, ColorValue } from 'react-native';
import React, { useEffect, useMemo, useRef } from 'react';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import ThemedText from '@/components/atoms/a-themed-text';
import { hexToRgba } from '@/lib/utils/colors';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import Button from '@/components/atoms/a-button';
import { Image } from 'expo-image';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { formMutation } from '@/lib/services/graphql/utils/fetch';
import {
  Kyc,
  UploadKycImageMutation,
  UploadKycImageMutationVariables,
  User,
} from '@/lib/services/graphql/generated';
import { UPLOAD_KYC_IMAGE } from '@/lib/services/graphql/requests/mutations/users';
import { generateRNFile } from '@/lib/utils/file';
import { handleError } from '@/lib/utils/error';
import { toast } from '@/lib/hooks/use-toast';
import * as Haptics from 'expo-haptics';
import { useUser } from '@/lib/hooks/user';
import LoadingModal from '@/components/atoms/a-loading-modal';
import { useRouter } from '@/lib/hooks/use-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const FRAME_WIDTH = SCREEN_WIDTH * 0.65;
const FRAME_HEIGHT = 340;
const CORNER_LENGTH = 40;
const CORNER_THICKNESS = 5;
const CORNER_RADIUS = 24;

const FACE_DETECTED_COLOR = '#22C55E';
const FRAME_IDLE_COLOR = 'rgba(255,255,255,0.55)';

const CameraFrame = ({ borderColor }: { borderColor: ColorValue }) => {
  return (
    <View style={styles.frameContainer} pointerEvents="none">
      <View style={styles.frameArea}>
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
  const device = useCameraDevice('front');
  const colors = useThemeColors();
  const { hasPermission, requestPermission } = useCameraPermission();
  const [kycImage, setKycImage] = React.useState(user.user?.kyc?.image?.publicUrl);
  const [uploading, setUploading] = React.useState(false);
  const [isCameraReady, setIsCameraReady] = React.useState(false);
  const [faceDetected, setFaceDetected] = React.useState(false);
  // Debounce face-lost to avoid the badge and button flickering when briefly moving out of frame
  const [faceLocked, setFaceLocked] = React.useState(false);
  const faceTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const photoOutput = usePhotoOutput({ quality: 0.9 });

  // useFaceDetectorOutput has a bug where `...options` rest spread creates a new {} each render,
  // causing the output reference to change every render and the camera session to reconfigure constantly.
  // createFaceDetectorOutput + useMemo([]) creates the output once with stable callbacks.
  const faceDetectorOutput = useMemo(
    () =>
      createFaceDetectorOutput({
        onFacesDetected(faces: any[]) {
          setFaceDetected(faces.length > 0);
        },
        onError(error: unknown) {
          console.warn('Face detector error:', error);
        },
      }),
    [],
  );

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  useEffect(() => {
    if (faceDetected) {
      clearTimeout(faceTimerRef.current);
      setFaceLocked(true);
    } else {
      faceTimerRef.current = setTimeout(() => setFaceLocked(false), 700);
    }
    return () => clearTimeout(faceTimerRef.current);
  }, [faceDetected]);

  // Reset face detection when photo is taken or retaken
  useEffect(() => {
    setFaceDetected(false);
    setFaceLocked(false);
    if (!kycImage) {
      setIsCameraReady(false);
    }
  }, [kycImage]);

  const handleCapture = async () => {
    try {
      const photo = await photoOutput.capturePhoto({ flashMode: 'off' }, {});
      const tempPath = await photo.saveToTemporaryFileAsync();

      let finalUri = `file://${tempPath}`;

      if (photo.orientation !== 'up') {
        const rotationMap: Record<string, number> = { left: 90, down: 180, right: 270 };
        const rotation = rotationMap[photo.orientation];
        if (rotation) {
          const manipulated = await manipulateAsync(finalUri, [{ rotate: rotation }], {
            compress: 1,
            format: SaveFormat.JPEG,
          });
          finalUri = manipulated.uri;
        }
      }

      photo.dispose();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setKycImage(finalUri);
    } catch (error) {
      console.error('Failed to capture photo:', error);
      toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to capture photo. Please try again.',
      });
    }
  };

  const handleUploadImage = () => {
    if (!kycImage) return;

    setUploading(true);
    formMutation<UploadKycImageMutation, UploadKycImageMutationVariables>(UPLOAD_KYC_IMAGE, {
      file: generateRNFile(kycImage),
    })
      .then((res) => {
        if (res.error) {
          handleError(res.error);
        }
        if (res.data) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          toast.show({ type: 'success', text1: 'Success', text2: 'KYC Image uploaded' });
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
      .finally(() => setUploading(false));
  };

  const frameColor = faceDetected ? FACE_DETECTED_COLOR : FRAME_IDLE_COLOR;
  const canCapture = isCameraReady && faceDetected;

  return (
    <>
      <DetailsLayout
        title="Facial Recognition"
        footer={
          <View
            className="border-t p-4"
            style={{ backgroundColor: colors.background, borderColor: hexToRgba(colors.text, 0.2) }}
          >
            <Button
              disabled={!user.user?.kyc?.image?.publicUrl}
              onPress={() => router.push('/kyc/nin')}
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
            currentStep={3}
            titles={cast(KYC_ONBOARDING_STEPS)}
          />
          <View className="mt-8">
            <View className="max-w-[400px] self-center">
              {/* Camera stays mounted to avoid AVCaptureSession crash on retake.
                  Captured image overlays via absoluteFill — never use display:none on a native camera view. */}
              {device && (
                <View style={styles.cameraContainer}>
                  <Camera
                    style={StyleSheet.absoluteFill}
                    device={device}
                    isActive={!kycImage}
                    outputs={[photoOutput, faceDetectorOutput]}
                    onStarted={() => setIsCameraReady(true)}
                    onStopped={() => setIsCameraReady(false)}
                  />
                  {!kycImage && <CameraFrame borderColor={frameColor} />}
                  {kycImage && (
                    <Image
                      source={{ uri: kycImage }}
                      style={StyleSheet.absoluteFill}
                      contentFit="cover"
                    />
                  )}
                </View>
              )}
            </View>

            {kycImage ? (
              <View className="mt-8 items-center">
                <ThemedText
                  type="subtitle"
                  className="max-w-[400px] text-center"
                  style={{ color: hexToRgba(colors.text, 0.6) }}
                >
                  Please ensure your face is fully visible and well-lit. This image will be used to
                  verify your identity against your NIN and BVN records.
                </ThemedText>
                <View className="max-w-[400px] flex-row gap-4">
                  <Button
                    onPress={() => setKycImage(undefined)}
                    variant="outline"
                    className="mt-8 flex-1 py-[14px]"
                  >
                    <ThemedText>Retake</ThemedText>
                  </Button>
                  <Button
                    onPress={handleUploadImage}
                    disabled={!kycImage.startsWith('file')}
                    type="primary"
                    className="mt-8 flex-1 py-[14px]"
                  >
                    <ThemedText content="primary">Confirm</ThemedText>
                  </Button>
                </View>
              </View>
            ) : (
              <Animated.View
                layout={LinearTransition.duration(250)}
                className="mt-8 items-center gap-3"
              >
                <ThemedText
                  type="subtitle"
                  className="max-w-[400px] text-center"
                  style={{ color: hexToRgba(colors.text, faceLocked ? 1 : 0.6) }}
                >
                  {faceLocked
                    ? 'Face detected — ready to capture'
                    : 'Center your face inside the frame'}
                </ThemedText>
                {faceLocked && (
                  <Animated.View
                    entering={FadeIn.duration(250)}
                    exiting={FadeOut.duration(200)}
                    style={styles.detectedBadge}
                  >
                    <View style={styles.detectedDot} />
                    <ThemedText style={styles.detectedLabel}>Face locked</ThemedText>
                  </Animated.View>
                )}
                <Button
                  onPress={handleCapture}
                  disabled={!canCapture}
                  type="primary"
                  className="mt-4 w-full max-w-[300px] py-[16px]"
                >
                  <ThemedText content="primary">Capture</ThemedText>
                </Button>
              </Animated.View>
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
    overflow: 'hidden',
    position: 'relative',
  },
  frameContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frameArea: {
    width: FRAME_WIDTH,
    height: FRAME_HEIGHT,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: CORNER_LENGTH,
    height: CORNER_LENGTH,
  },
  topLeft: { top: 0, left: 0 },
  topRight: { top: 0, right: 0 },
  bottomLeft: { bottom: 0, left: 0 },
  bottomRight: { bottom: 0, right: 0 },
  detectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(34,197,94,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.3)',
  },
  detectedDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: FACE_DETECTED_COLOR,
  },
  detectedLabel: {
    fontSize: 13,
    color: FACE_DETECTED_COLOR,
    fontWeight: '500',
  },
});

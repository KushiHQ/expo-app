import DetailsLayout from '@/components/layouts/details';
import { View, StyleSheet, Pressable, Image, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { CameraView, CameraType, FlashMode, useCameraPermissions } from 'expo-camera';
import { Zap, ZapOff } from 'lucide-react-native';
import React, { useState, useRef } from 'react';
import ThemedText from '@/components/atoms/a-themed-text';
import Button from '@/components/atoms/a-button';
import { GravityUiArrowsRotateRight } from '@/components/icons/i-rotate';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useGalleryStore } from '@/lib/stores/gallery';
import { getLocationAsync } from '@/lib/utils/locations';
import { LocationObject } from 'expo-location';
import { usePhotoGalleryScreen } from '@/lib/hooks/camera';
import { cast } from '@/lib/types/utils';
import * as Haptics from 'expo-haptics';

export default function CameraPage() {
  const { images, multiple, redirect } = useLocalSearchParams();
  const cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const { redirect: galleryRedirect } = usePhotoGalleryScreen();
  const [permission, requestPermission] = useCameraPermissions();
  const { gallery, append, setGallery, setActiveIndex } = useGalleryStore();
  const [location, setLocation] = React.useState<LocationObject>();

  const imagesParamString = JSON.stringify(images);

  useFocusEffect(
    React.useCallback(() => {
      const parsedImages = imagesParamString ? JSON.parse(imagesParamString) : null;

      if (Array.isArray(parsedImages)) {
        setGallery(parsedImages.map((i) => (typeof i === 'string' ? i.replaceAll(',', '') : i)));
        setActiveIndex(0);
      } else if (parsedImages) {
        append(String(parsedImages).replaceAll(',', ''));
        setActiveIndex(0);
      }
    }, [imagesParamString, setActiveIndex, append, setGallery]),
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
          backgroundColor: '#000000',
        }}
        background="transparent"
        backButton="solid"
      >
        <View style={styles.permissionContainer}>
          <ThemedText style={{ textAlign: 'center', marginBottom: 20, color: 'white' }}>
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
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    setFlash((current) => (current === 'off' ? 'on' : current === 'on' ? 'auto' : 'off'));
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        const photo = await cameraRef.current?.takePictureAsync({
          // JPEG encoding quality only — resolution and the EXIF/GPS block below
          // are untouched. 1.0 produced 3-8MB captures that time out on 3G; 0.7
          // is visually near-identical at 1-2MB.
          quality: 0.7,
          exif: true,
          additionalExif: location
            ? {
                GPSLatitude: Math.abs(location.coords.latitude),
                GPSLongitude: Math.abs(location.coords.longitude),
                GPSLatitudeRef: location.coords.latitude >= 0 ? 'N' : 'S',
                GPSLongitudeRef: location.coords.longitude >= 0 ? 'E' : 'W',
                GPSAltitude: location.coords.altitude || 0,
                GPSSpeed: location.coords.speed || 0,
                GPSTimeStamp: new Date().toISOString(),
              }
            : {},
        });

        if (photo) {
          append(photo.uri);
          if (multiple === 'false') {
            galleryRedirect({ redirect: cast(redirect), fromCamera: true });
          }
        }
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture');
      }
    }
  };

  const openGallery = () => {
    if (gallery.length === 0) return;

    galleryRedirect({ redirect: cast(redirect), fromCamera: true });
  };

  return (
    <>
      <StatusBar style="light" />
      <DetailsLayout
        contentStyles={{ paddingInline: 0 }}
        backgroundStyles={{
          backgroundColor: '#000000',
        }}
        background="transparent"
        backButton="solid"
      >
        <View style={styles.cameraWrapper}>
          <CameraView ref={cameraRef} style={styles.camera} facing={facing} flash={flash} />

          <View style={styles.controlsOverlay} pointerEvents="box-none">
            {facing === 'back' ? (
              <Pressable
                onPress={toggleFlash}
                style={[styles.flipButton, { position: 'absolute', top: 60, right: 20 }]}
                aria-label={`Flash ${flash}`}
              >
                {flash === 'off' ? (
                  <ZapOff color="white" size={26} />
                ) : (
                  // Brand amber = active state; 'auto' shows an A badge.
                  <>
                    <Zap color="#FFA500" size={26} fill={flash === 'on' ? '#FFA500' : 'none'} />
                    {flash === 'auto' ? (
                      <ThemedText
                        style={{
                          position: 'absolute',
                          top: 8,
                          right: 10,
                          fontSize: 11,
                          color: '#FFA500',
                        }}
                      >
                        A
                      </ThemedText>
                    ) : null}
                  </>
                )}
              </Pressable>
            ) : null}
            <View style={styles.controls}>
              <Pressable style={styles.galleryPreview} onPress={openGallery}>
                <Image
                  source={
                    gallery.length > 0
                      ? { uri: gallery[gallery.length - 1] }
                      : require('@/assets/images/image-placeholder.jpg')
                  }
                  style={styles.galleryImage}
                />
              </Pressable>

              <Pressable onPress={takePicture} style={styles.captureButtonOuter}>
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
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cameraWrapper: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingBlock: 40,
    backgroundColor: '#000',
  },
  galleryPreview: {
    width: 60,
    height: 60,
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'white',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  captureButtonOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  captureButtonInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'white',
  },
  flipButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContainer: {
    flex: 1,
    position: 'relative',
  },
  preview: {
    flex: 1,
    width: '100%',
  },
  previewActions: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    gap: 16,
  },
});

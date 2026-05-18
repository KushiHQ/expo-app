import React, { useRef } from 'react';
import { View, StyleSheet, FlatList, useWindowDimensions, useColorScheme } from 'react-native';
import Button from '@/components/atoms/a-button';
import ThemedText from '@/components/atoms/a-themed-text';
import { StatusBar } from 'expo-status-bar';
import { useGalleryStore } from '@/lib/stores/gallery';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ImagePicker from 'react-native-image-crop-picker';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { FluentImageEdit24Regular } from '@/components/icons/i-edit';
import { Check } from 'lucide-react-native';
import { cast } from '@/lib/types/utils';
import { useFallbackImages } from '@/lib/hooks/images';
import { FALLBACK_IMAGE, PROPERTY_BLURHASH } from '@/lib/constants/images';
import { Image } from 'expo-image';

export default function PhotoGalleryScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const { redirect, fromCamera, viewOnly } = useLocalSearchParams();
  const { gallery, activeIndex, setActiveIndex, updateActiveImage } = useGalleryStore();
  const colors = useThemeColors();
  const colorScheme = useColorScheme() ?? 'light';
  const { failedImages, handleImageError } = useFallbackImages();

  const flatListRef = useRef<FlatList>(null);
  const hasScrolledToIndex = useRef(false);
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  React.useEffect(() => {
    if (
      gallery.length > 0 &&
      activeIndex >= 0 &&
      activeIndex < gallery.length &&
      !hasScrolledToIndex.current
    ) {
      const timer = setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: activeIndex,
          animated: false,
        });
        hasScrolledToIndex.current = true;
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [gallery.length, activeIndex]);

  React.useEffect(() => {
    return () => {
      hasScrolledToIndex.current = false;
    };
  }, []);

  const onUsePhotos = () => {
    if (redirect) {
      router.replace(cast(`${redirect}?fromCamera=${fromCamera}`), {});
    } else {
      router.back();
    }
  };

  const handleEditPhoto = async () => {
    if (gallery.length === 0) return;
    const currentPhotoUri = gallery[activeIndex];

    try {
      const croppedImage = await ImagePicker.openCropper({
        path: currentPhotoUri,
        cropping: true,
        mediaType: 'photo',
        cropperActiveWidgetColor: colors.primary,
        cropperStatusBarLight: colorScheme === 'light',
        cropperToolbarColor: colors.background,
        cropperToolbarWidgetColor: colors.text,
        freeStyleCropEnabled: true,
        enableRotationGesture: true,
      });

      updateActiveImage(croppedImage.path);
    } catch (error: any) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        console.error('Error cropping photo: ', error);
        alert('Could not crop photo.');
      }
    }
  };

  const handleScrollToIndexFailed = (info: {
    index: number;
    highestMeasuredFrameIndex: number;
    averageItemLength: number;
  }) => {
    const wait = new Promise((resolve) => setTimeout(resolve, 500));
    wait.then(() => {
      flatListRef.current?.scrollToIndex({
        index: info.index,
        animated: false,
      });
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <FlatList
        ref={flatListRef}
        data={gallery}
        keyExtractor={(item) => item}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <Image
            source={{
              uri: failedImages.has(index) ? FALLBACK_IMAGE : item,
            }}
            transition={300}
            style={{ width: width, height: height }}
            placeholder={{ blurhash: PROPERTY_BLURHASH }}
            placeholderContentFit="contain"
            contentFit="contain"
            cachePolicy="memory-disk"
            priority="high"
            onError={() => handleImageError(index)}
          />
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(data, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        onScrollToIndexFailed={handleScrollToIndexFailed}
        initialScrollIndex={activeIndex >= 0 && activeIndex < gallery.length ? activeIndex : 0}
      />

      {viewOnly !== 'true' && (
        <View style={styles.actions}>
          <Button onPress={handleEditPhoto} className="flex-1">
            <View className="flex-row gap-2">
              <FluentImageEdit24Regular color="#fff" size={20} />
              <ThemedText style={{ fontSize: 14, color: '#fff' }}>Edit</ThemedText>
            </View>
          </Button>
          <Button onPress={onUsePhotos} className="flex-1">
            <View className="flex-row gap-2">
              <Check color={colors.success} size={20} />
              <ThemedText style={{ fontSize: 14, color: colors.success }}>
                Use {gallery.length} Photos
              </ThemedText>
            </View>
          </Button>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  actions: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    gap: 16,
  },
});

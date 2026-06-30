import React, { useRef } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  useWindowDimensions,
  useColorScheme,
  Pressable,
} from "react-native";
import Button from "@/components/atoms/a-button";
import ThemedText from "@/components/atoms/a-themed-text";
import { StatusBar } from "expo-status-bar";
import { useGalleryStore } from "@/lib/stores/gallery";
import { useLocalSearchParams, useRouter } from "expo-router";
import ImagePicker from "react-native-image-crop-picker";
import * as FileSystem from "expo-file-system/legacy";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { FluentImageEdit24Regular } from "@/components/icons/i-edit";
import { Check, ChevronLeft } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { cast } from "@/lib/types/utils";
import { PROPERTY_BLURHASH } from "@/lib/constants/images";
import { Fonts } from "@/lib/constants/theme";
import { Image } from "expo-image";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import TruncatedText from "@/components/atoms/a-truncated-text";

export default function PhotoGalleryScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const { redirect, fromCamera, viewOnly } = useLocalSearchParams();
  const { gallery, captions, activeIndex, setActiveIndex, updateActiveImage, setReplacement } =
    useGalleryStore();
  const colors = useThemeColors();
  const caption = captions[activeIndex];

  const [controlsVisible, setControlsVisible] = React.useState(true);
  const controlsOpacity = useSharedValue(1);
  const toggleControls = () => {
    setControlsVisible((visible) => {
      const next = !visible;
      controlsOpacity.value = withTiming(next ? 1 : 0, { duration: 180 });
      return next;
    });
  };
  const chromeStyle = useAnimatedStyle(() => ({
    opacity: controlsOpacity.value,
  }));
  const colorScheme = useColorScheme() ?? "light";
  const insets = useSafeAreaInsets();

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
      // dismissTo pops this screen and finds the existing redirect screen already
      // in the stack (placed there before the camera was opened). This avoids
      // replace() which would push a duplicate of that screen onto the stack.
      router.dismissTo(cast(`${redirect}?fromCamera=${fromCamera}`));
    } else {
      router.back();
    }
  };

  const handleEditPhoto = async () => {
    if (gallery.length === 0) return;
    const currentPhotoUri = gallery[activeIndex];
    const isRemote = /^https?:\/\//.test(currentPhotoUri);

    try {
      // The cropper can only open a LOCAL file. For an already-uploaded photo
      // (https:// URL), download it to a cache file first, then crop that.
      let cropPath = currentPhotoUri;
      if (isRemote) {
        const dest = `${FileSystem.cacheDirectory}edit-${Date.now()}.jpg`;
        const { uri } = await FileSystem.downloadAsync(currentPhotoUri, dest);
        cropPath = uri;
      }

      const croppedImage = await ImagePicker.openCropper({
        path: cropPath,
        cropping: true,
        mediaType: "photo",
        // width/height default to 200, which makes the cropper open with a
        // pre-applied 1:1 crop box the user has to undo. Setting them to 0 skips
        // the forced aspect ratio so editing opens on the full, uncropped image.
        width: 0,
        height: 0,
        // iOS defaults compressImageQuality to 0.8, re-encoding the crop as a
        // lossy JPEG and visibly softening it (Android doesn't). Force full
        // quality so an edited photo stays as sharp as the original.
        compressImageQuality: 1,
        cropperActiveWidgetColor: colors.primary,
        cropperStatusBarLight: colorScheme === "light",
        cropperToolbarColor: colors.background,
        cropperToolbarWidgetColor: colors.text,
        freeStyleCropEnabled: true,
        enableRotationGesture: true,
      });

      // react-native-image-crop-picker returns a RAW filesystem path on iOS (no
      // "file://" scheme). The upload pipeline keys local images by a "file"
      // prefix, so without normalizing, an edited photo is silently never
      // uploaded and reverts on the next refetch. Add the scheme if missing.
      const editedUri = /^\w+:\/\//.test(croppedImage.path)
        ? croppedImage.path
        : `file://${croppedImage.path}`;

      // Remember which already-uploaded image this edit replaces, so the upload
      // step updates that server image in place instead of adding a duplicate.
      // Carry the original URL forward when re-editing an earlier edit.
      const originalUrl = useGalleryStore.getState().replacements[currentPhotoUri]
        ?? (isRemote ? currentPhotoUri : undefined);
      if (originalUrl) setReplacement(editedUri, originalUrl);

      updateActiveImage(editedUri);
    } catch (error: any) {
      if (error.code !== "E_PICKER_CANCELLED") {
        console.error("Error cropping photo: ", error);
        alert("Could not edit photo. Please try again.");
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

      <Animated.View
        pointerEvents={controlsVisible ? "auto" : "none"}
        style={[
          {
            position: "absolute",
            top: insets.top + 12,
            left: 20,
            zIndex: 10,
          },
          chromeStyle,
        ]}
      >
        <Pressable
          onPress={router.back}
          style={{
            backgroundColor: "rgba(0,0,0,0.45)",
            borderRadius: 12,
            width: 40,
            height: 40,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ChevronLeft color="#fff" size={22} />
        </Pressable>
      </Animated.View>

      <FlatList
        ref={flatListRef}
        data={gallery}
        keyExtractor={(item) => item}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <Pressable onPress={toggleControls}>
            <Image
              source={{
                uri: item,
              }}
              transition={300}
              style={{ width: width, height: height }}
              placeholder={{ blurhash: PROPERTY_BLURHASH }}
              placeholderContentFit="contain"
              contentFit="contain"
              cachePolicy="memory-disk"
              priority="high"
            />
          </Pressable>
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        onScrollToIndexFailed={handleScrollToIndexFailed}
        initialScrollIndex={
          activeIndex >= 0 && activeIndex < gallery.length ? activeIndex : 0
        }
      />

      {/* Room context overlay (room name + description) for the active image. */}
      {caption && (caption.title || caption.subtitle) ? (
        <Animated.View
          pointerEvents={controlsVisible ? "box-none" : "none"}
          style={[
            {
              position: "absolute",
              left: 0,
              right: 0,
              top: height * 0.75,
              bottom: 0,
              zIndex: 5,
              backgroundColor: "rgba(0,0,0,0.6)",
              paddingHorizontal: 20,
              paddingTop: 20,
              paddingBottom: insets.bottom + 20,
            },
            chromeStyle,
          ]}
        >
          {caption.title ? (
            <ThemedText
              style={{
                color: "#fff",
                fontFamily: Fonts.semibold,
                fontSize: 16,
              }}
            >
              {caption.title}
            </ThemedText>
          ) : null}
          {caption.subtitle ? (
            <TruncatedText
              text={caption.subtitle}
              style={{
                fontSize: 16,
                fontFamily: Fonts.light,
              }}
            />
          ) : null}
        </Animated.View>
      ) : null}

      {viewOnly !== "true" && (
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

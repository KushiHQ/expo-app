import { Pressable, View } from "react-native";
import React from "react";
import { Image } from "expo-image";
import { PROPERTY_BLURHASH } from "@/lib/constants/images";
import ThemedText from "../atoms/a-themed-text";
import { hexToRgba } from "@/lib/utils/colors";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { Camera } from "lucide-react-native";
import { useCameraScreen } from "@/lib/hooks/camera";

interface Props {
  signature?: string;
}

const SignatureImage: React.FC<Props> = ({ signature }) => {
  const colors = useThemeColors();
  const { redirect: cameraRedirect } = useCameraScreen();

  const handleTakeSignaturePic = () => {
    cameraRedirect({ clear: true, multiple: false });
  };

  return (
    <View className="gap-2 mt-4">
      <ThemedText>Signature</ThemedText>
      {signature ? (
        <View className="h-[120px] bg-white rounded-xl">
          <Image
            source={{
              uri: signature,
            }}
            style={{
              height: "100%",
              width: "100%",
              borderRadius: 20,
            }}
            contentFit="contain"
            transition={300}
            placeholder={{ blurhash: PROPERTY_BLURHASH }}
            placeholderContentFit="cover"
            cachePolicy="memory-disk"
            priority="high"
          />
        </View>
      ) : (
        <Pressable
          onPress={handleTakeSignaturePic}
          className="p-4 py-6 items-center justify-center rounded-xl"
          style={{
            borderWidth: 1.5,
            borderColor: hexToRgba(colors.primary, 0.5),
            borderStyle: "dashed",
          }}
        >
          <Camera color={hexToRgba(colors.primary, 0.7)} />
          <ThemedText
            style={{
              fontSize: 14,
              maxWidth: 200,
              textAlign: "center",
              color: hexToRgba(colors.text, 0.6),
            }}
          >
            Take a picture of your signature on a piece of paper
          </ThemedText>
        </Pressable>
      )}
    </View>
  );
};

export default SignatureImage;

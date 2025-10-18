import ThemedText from "@/components/atoms/a-themed-text";
import { HeroiconsPhoneXMark } from "@/components/icons/i-phone";
import { QlementineIconsSpeaker16 } from "@/components/icons/i-speaker";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { chatsAtom } from "@/lib/stores/chats";
import { hexToRgba } from "@/lib/utils/colors";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAtomValue } from "jotai";
import {
  View,
  StyleSheet,
  Pressable,
  Dimensions,
  Platform,
} from "react-native";
import { Camera, Mic, MicOff } from "lucide-react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { useState } from "react";
import Button from "@/components/atoms/a-button";
import DetailsLayout from "@/components/layouts/details";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function ChatVideoCall() {
  const colors = useThemeColors();
  const chats = useAtomValue(chatsAtom);
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const chat = chats.find((c) => c.id === id);
  const [facing, setFacing] = useState<CameraType>("front");
  const [permission, requestPermission] = useCameraPermissions();
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);

  if (!chat) {
    return null;
  }

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <ThemedText style={{ textAlign: "center", marginBottom: 20 }}>
          We need camera permission to make video calls
        </ThemedText>
        <Button onPress={requestPermission} type="primary">
          <ThemedText content="primary">Grant Permission</ThemedText>
        </Button>
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.cameraBackground} facing={facing} />
      <View className="absolute inset-0">
        <DetailsLayout
          title="Calling..."
          backButton="solid"
          background="transparent"
        >
          <View className="flex-1">
            <View
              style={[
                styles.pipContainer,
                {
                  borderColor: hexToRgba(colors.text, 0.6),
                  ...Platform.select({
                    ios: {
                      shadowColor: colors.primary,
                      shadowOffset: { width: 0, height: -2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 8,
                    },
                    android: {
                      elevation: 8,
                    },
                  }),
                },
              ]}
            >
              {/* <CameraView */}
              {/*   style={{ height: "100%", width: "100%" }} */}
              {/*   facing="front" */}
              {/* /> */}
            </View>

            {/* Bottom Controls */}
            <View style={styles.controlsContainer} className="gap-4">
              <ThemedText className="text-center">10:59</ThemedText>
              <View>
                <View
                  className="p-8 rounded-xl"
                  style={[
                    styles.controls,
                    { backgroundColor: hexToRgba("#000000", 0.9) },
                  ]}
                >
                  <Pressable
                    onPress={() => setIsSpeakerOn(!isSpeakerOn)}
                    style={[
                      styles.controlButton,
                      {
                        backgroundColor: isSpeakerOn
                          ? hexToRgba(colors.shade, 0.9)
                          : colors.primary,
                      },
                    ]}
                  >
                    <QlementineIconsSpeaker16 size={28} color="white" />
                  </Pressable>

                  <Pressable
                    onPress={() => setIsMuted(!isMuted)}
                    style={[
                      styles.controlButton,
                      {
                        backgroundColor: isMuted ? colors.error : colors.shade,
                      },
                    ]}
                  >
                    {isMuted ? (
                      <MicOff size={28} color="white" />
                    ) : (
                      <Mic size={28} color="white" />
                    )}
                  </Pressable>

                  <Pressable
                    onPress={toggleCameraFacing}
                    style={[
                      styles.controlButton,
                      { backgroundColor: colors.shade },
                    ]}
                  >
                    <Camera size={28} color="white" />
                  </Pressable>

                  <Pressable
                    onPress={() => router.back()}
                    style={[
                      styles.controlButton,
                      { backgroundColor: colors.error },
                    ]}
                  >
                    <HeroiconsPhoneXMark size={28} color="white" />
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        </DetailsLayout>
      </View>
    </View>
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
  cameraBackground: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerInfo: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  cameraToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  pipContainer: {
    position: "absolute",
    bottom: 200,
    right: 20,
    width: 120,
    height: 160,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
  },
  controlsContainer: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
});

import ThemedText from "@/components/atoms/a-themed-text";
import { HeroiconsPhoneXMark } from "@/components/icons/i-phone";
import { QlementineIconsSpeaker16 } from "@/components/icons/i-speaker";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { chatsAtom } from "@/lib/stores/chats";
import { hexToRgba } from "@/lib/utils/colors";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAtomValue } from "jotai";
import { View, StyleSheet, Pressable, Dimensions } from "react-native";
import { Camera, Mic } from "lucide-react-native";
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

  // Handle camera permissions
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
      {/* Camera View as Background */}
      <CameraView style={styles.cameraBackground} facing={facing}>
        {/* Overlay gradient for better text visibility */}
        <View style={styles.gradientOverlay} />

        <DetailsLayout>
          {/* Picture in Picture - Remote User Video */}
          <View style={styles.pipContainer}>
            <View style={styles.pipPlaceholder}>
              <ThemedText style={{ color: "white", fontSize: 12 }}>
                Remote User
              </ThemedText>
            </View>
          </View>

          {/* Bottom Controls */}
          <View style={styles.controlsContainer}>
            <View style={styles.controls}>
              <Pressable
                onPress={() => setIsSpeakerOn(!isSpeakerOn)}
                style={[
                  styles.controlButton,
                  {
                    backgroundColor: isSpeakerOn
                      ? hexToRgba("#000", 0.5)
                      : hexToRgba(colors.primary, 0.8),
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
                    backgroundColor: isMuted
                      ? hexToRgba(colors.error, 0.8)
                      : hexToRgba("#000", 0.5),
                  },
                ]}
              >
                <Mic size={28} color="white" />
              </Pressable>

              <Pressable
                onPress={toggleCameraFacing}
                style={[
                  styles.controlButton,
                  { backgroundColor: hexToRgba("#000", 0.5) },
                ]}
              >
                <Camera size={28} color="white" />
              </Pressable>

              <Pressable
                onPress={() => router.back()}
                style={[
                  styles.endCallButton,
                  { backgroundColor: colors.error },
                ]}
              >
                <HeroiconsPhoneXMark size={32} color="white" />
              </Pressable>
            </View>
          </View>
        </DetailsLayout>
      </CameraView>
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
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: hexToRgba("#000", 0.15),
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
    top: 100,
    right: 20,
    width: 120,
    height: 160,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "white",
  },
  pipPlaceholder: {
    flex: 1,
    backgroundColor: hexToRgba("#000", 0.6),
    justifyContent: "center",
    alignItems: "center",
  },
  controlsContainer: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
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
  endCallButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
});

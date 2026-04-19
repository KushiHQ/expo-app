import moment from "moment";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import React, { useRef } from "react";
import {
  Pressable,
  RefreshControlProps,
  ScrollView,
  StyleProp,
  View,
  ViewStyle,
} from "react-native";
import { hexToRgba } from "@/lib/utils/colors";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import ThemedText from "../atoms/a-themed-text";
import { ChevronLeft, Share2Icon } from "lucide-react-native";
import { useLocalSearchParams, usePathname, useRouter } from "expo-router";
import { Image } from "expo-image";
import { EventEmitter } from "@/lib/utils/event-emitter";
import { HugeiconsVideo01, SolarPhoneOutline } from "../icons/i-phone";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { useGradualKeyboardAnimation } from "@/lib/hooks/keyboard";
import ThemedView from "../atoms/a-themed-view";
import { IonNotificationsOutline } from "../icons/i-notifications";
import { getDefaultProfileImageUrl } from "@/lib/utils/urls";
import { useUser } from "@/lib/hooks/user";
import { buildCallURL } from "@/lib/utils/call";

type Props = {
  children?: React.ReactNode;
  title?: string;
  avatar?: {
    image?: string;
    online?: boolean;
    lastSeen?: string;
  };
  variant?: "guest" | "host";
  footer?: React.ReactNode;
  backButton?: "translucent" | "solid" | "light";
  background?: "transparent" | "solid" | "light";
  withShare?: boolean;
  withProfile?: boolean;
  refreshControl?: React.ReactElement<
    RefreshControlProps,
    string | React.JSXElementConstructor<any>
  >;
  withNotifications?: boolean;
  backgroundStyles?: StyleProp<ViewStyle>;
  contentStyles?: StyleProp<ViewStyle>;
  withPhone?: boolean;
  withVideo?: boolean;
  scrollable?: boolean;
};

import * as Haptics from "expo-haptics";

const DetailsLayout = React.forwardRef<ScrollView, Props>(
  (
    {
      children,
      title,
      avatar,
      footer,
      variant = "guest",
      backButton = "translucent",
      background = "solid",
      withShare,
      withProfile,
      withNotifications,
      refreshControl,
      backgroundStyles,
      contentStyles,
      withPhone,
      withVideo,
      scrollable = true,
    },
    ref,
  ) => {
    const router = useRouter();
    const colors = useThemeColors();
    const insets = useSafeAreaInsets();
    const scrollViewRef = useRef<ScrollView>(null);
    const path = usePathname();
    const { height: keyboardHeight } = useGradualKeyboardAnimation();
    const { id } = useLocalSearchParams();
    const { user } = useUser();

    React.useImperativeHandle(ref, () => scrollViewRef.current as ScrollView);

    React.useEffect(() => {
      const handleScrollToTop = () => {
        if (scrollable) {
          scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        }
      };

      const routeName = path.split("/").pop();

      EventEmitter.on(`scrollToTop:${routeName}`, handleScrollToTop);

      return () => {
        EventEmitter.off(`scrollToTop:${routeName}`, handleScrollToTop);
      };
    }, [path, scrollable]);

    const animatedFooterStyle = useAnimatedStyle(() => {
      return {
        transform: [
          {
            translateY: -Math.max(0, keyboardHeight.value - insets.bottom),
          },
        ],
      };
    });

    const Wrapper = background === "solid" ? ThemedView : View;

    const Content = (
      <View
        className={scrollable ? "p-5 pt-0 flex-1" : "flex-1"}
        style={contentStyles}
      >
        <View className="flex-1">{children}</View>
      </View>
    );

    return (
      <Wrapper className="flex-1" style={backgroundStyles}>
        <SafeAreaView className="flex-1">
          <View className="p-5 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.back();
                }}
                aria-label="Go Back"
                className="w-10 items-center justify-center rounded-xl h-10"
                style={{
                  backgroundColor:
                    backButton === "translucent"
                      ? hexToRgba(colors["text"], 0.15)
                      : backButton === "light"
                        ? hexToRgba("#fff", 0.2)
                        : colors.text,
                }}
              >
                <ChevronLeft
                  color={
                    backButton === "translucent"
                      ? colors["text"]
                      : backButton === "light"
                        ? "#fff"
                        : colors.background
                  }
                />
              </Pressable>
              <View className="flex-row items-center gap-2">
                {avatar && (
                  <View
                    className="w-10 h-10 rounded-xl border overflow-hidden"
                    style={{ borderColor: hexToRgba(colors.text, 0.2) }}
                  >
                    <Image
                      style={{
                        height: "100%",
                        width: "100%",
                        objectFit: "cover",
                      }}
                      source={{
                        uri: avatar.image,
                      }}
                    />
                  </View>
                )}
                <View>
                  <ThemedText
                    className="py-0"
                    style={{
                      fontSize: avatar ? 10 : 16,
                      height: 20,
                      color: backButton === "light" ? "#fff" : colors.text,
                    }}
                  >
                    {title}
                  </ThemedText>
                  {avatar?.online !== undefined && (
                    <ThemedText
                      className="py-0"
                      style={{
                        fontSize: 10,
                        height: 20,
                        paddingBlock: 0,
                        paddingInline: 0,
                      }}
                    >
                      {avatar?.online
                        ? "Online"
                        : `Last seen ${moment(avatar?.lastSeen).fromNow()}`}
                    </ThemedText>
                  )}
                </View>
              </View>
            </View>
            <View className="flex-row items-center gap-3">
              {withShare && (
                <Pressable
                  className="h-10 w-10 rounded-xl justify-center items-center"
                  style={{ backgroundColor: hexToRgba(colors.text, 0.1) }}
                >
                  <Share2Icon size={20} color={colors.text} />
                </Pressable>
              )}
              {withPhone && (
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push(buildCallURL(String(id), "voice", true));
                  }}
                  className="h-10 w-10 rounded-xl justify-center items-center"
                  style={{ backgroundColor: hexToRgba(colors.text, 0.1) }}
                >
                  <SolarPhoneOutline size={20} color={colors.text} />
                </Pressable>
              )}
              {withVideo && (
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push(buildCallURL(String(id), "video", true));
                  }}
                  className="h-10 w-10 rounded-xl justify-center items-center"
                  style={{ backgroundColor: hexToRgba(colors.text, 0.1) }}
                >
                  <HugeiconsVideo01 size={20} color={colors.text} />
                </Pressable>
              )}
              {withNotifications && (
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push("/users/notifications");
                  }}
                >
                  <IonNotificationsOutline
                    color={hexToRgba(colors["text"], 0.7)}
                  />
                </Pressable>
              )}
              {withProfile && (
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push(
                      variant === "guest" ? "/guest/profile" : "/host/profile",
                    );
                  }}
                  className="w-10 h-10 rounded-xl border overflow-hidden"
                  style={{
                    borderColor: hexToRgba(colors["text"], 0.6),
                    borderWidth: 2,
                  }}
                >
                  <Image
                    style={{
                      height: "100%",
                      width: "100%",
                      objectFit: "cover",
                    }}
                    source={{
                      uri: getDefaultProfileImageUrl(
                        user.user?.profile.fullName ?? "",
                      ),
                    }}
                  />
                </Pressable>
              )}
            </View>
          </View>

          {scrollable ? (
            <KeyboardAwareScrollView
              ref={scrollViewRef}
              className="flex-1"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1 }}
              refreshControl={refreshControl}
              bottomOffset={80}
            >
              {Content}
            </KeyboardAwareScrollView>
          ) : (
            <View className="flex-1">{Content}</View>
          )}

          {footer && (
            <Animated.View
              style={[
                animatedFooterStyle,
                {
                  backgroundColor: colors.background,
                  marginBottom: -insets.bottom,
                  paddingBottom: insets.bottom,
                },
              ]}
            >
              {footer}
            </Animated.View>
          )}
        </SafeAreaView>
      </Wrapper>
    );
  },
);

DetailsLayout.displayName = "DetailsLayout";

export default DetailsLayout;

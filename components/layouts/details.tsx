import moment from 'moment';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useRef } from 'react';
import {
  Pressable,
  RefreshControlProps,
  ScrollView,
  StyleProp,
  View,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import { useBreakpoint } from '@/lib/hooks/use-breakpoint';
import { hexToRgba } from '@/lib/utils/colors';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import ThemedText from '../atoms/a-themed-text';
import { ChevronLeft, Share2Icon } from 'lucide-react-native';
import { Href, useLocalSearchParams, usePathname } from 'expo-router';
import { useRouter } from '@/lib/hooks/use-router';
import { Image } from 'expo-image';
import { EventEmitter } from '@/lib/utils/event-emitter';
import { HugeiconsVideo01, SolarPhoneOutline } from '../icons/i-phone';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useGradualKeyboardAnimation } from '@/lib/hooks/keyboard';
import ThemedView from '../atoms/a-themed-view';
import { IonNotificationsOutline } from '../icons/i-notifications';
import { getDefaultProfileImageUrl } from '@/lib/utils/urls';
import { useUser } from '@/lib/hooks/user';
import { buildCallURL } from '@/lib/utils/call';
import { Fonts } from '@/lib/constants/theme';

import * as Haptics from 'expo-haptics';
import { Support } from '../icons/i-support';
import { useInitiateSupportChatMutation, SupportItemType } from '@/lib/services/graphql/generated';

type Props = {
  children?: React.ReactNode;
  title?: string;
  avatar?: {
    image?: string;
    online?: boolean;
    lastSeen?: string;
  };
  variant?: 'guest' | 'host';
  footer?: React.ReactNode;
  backButton?: 'translucent' | 'solid' | 'light';
  background?: 'transparent' | 'solid' | 'light';
  withShare?: boolean;
  withSupport?: boolean;
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
  onShare?: () => void;
};

const DetailsLayout = React.forwardRef<ScrollView, Props>(
  (
    {
      children,
      title,
      avatar,
      footer,
      variant = 'guest',
      backButton = 'translucent',
      background = 'solid',
      withShare,
      withSupport,
      withProfile,
      withNotifications,
      refreshControl,
      backgroundStyles,
      contentStyles,
      withPhone,
      withVideo,
      scrollable = true,
      onShare,
    },
    ref,
  ) => {
    const router = useRouter();
    const colors = useThemeColors();
    const insets = useSafeAreaInsets();
    const scrollViewRef = useRef<ScrollView>(null);
    const { isTablet } = useBreakpoint();
    const path = usePathname();
    const { height: keyboardHeight } = useGradualKeyboardAnimation();
    const { id, transactionId } = useLocalSearchParams();
    const { user } = useUser();
    const [initiateSupportChatResult, initiateSupportChat] = useInitiateSupportChatMutation();

    // Track when safe area insets have been measured to avoid layout jumps.
    // On first render insets.bottom is 0, then transitions to the real value (e.g. 34px).
    // We animate to the measured value so the footer settles smoothly.
    const bottomInsetReady = React.useRef(false);
    const animatedBottomInset = useSharedValue(0);

    React.useEffect(() => {
      if (insets.bottom > 0 && !bottomInsetReady.current) {
        bottomInsetReady.current = true;
        // Animate from 0 to the real value so the footer shifts smoothly
        // rather than snapping.
        animatedBottomInset.value = withTiming(insets.bottom, { duration: 150 });
      }
    }, [insets.bottom, animatedBottomInset]);

    React.useImperativeHandle(ref, () => scrollViewRef.current as ScrollView);

    React.useEffect(() => {
      const handleScrollToTop = () => {
        if (scrollable) {
          scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        }
      };

      const routeName = path.split('/').pop();

      EventEmitter.on(`scrollToTop:${routeName}`, handleScrollToTop);

      return () => {
        EventEmitter.off(`scrollToTop:${routeName}`, handleScrollToTop);
      };
    }, [path, scrollable]);

    const animatedFooterStyle = useAnimatedStyle(() => {
      return {
        transform: [
          {
            translateY: -Math.max(0, keyboardHeight.value - animatedBottomInset.value),
          },
        ],
        paddingBottom: animatedBottomInset.value,
        marginBottom: -animatedBottomInset.value,
      };
    });

    const Wrapper = background === 'solid' ? ThemedView : View;

    // On a hosting-form step, offer a "Done" action that returns to the form's
    // onboarding hub and drops the step history — so a host who jumped in to edit
    // a single step can exit cleanly instead of backing through every step.
    const isFormStep = path.includes('/hostings/form/step');
    const handleDone = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const target = `/hostings/form/onboarding${id ? `?id=${id}` : ''}` as Href;
      router.dismissTo(target);
    };

    const handleSupportPress = async () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      let itemType: SupportItemType = SupportItemType.Hosting;
      let itemId = String(id);

      if (path.includes('/hostings/')) {
        itemType = SupportItemType.Hosting;
      } else if (path.includes('/bookings/')) {
        itemType = SupportItemType.Booking;
      } else if (path.includes('/transactions/')) {
        itemType = SupportItemType.Transaction;
        if (transactionId) {
          itemId = String(transactionId);
        }
      }

      const result = await initiateSupportChat({ itemType, itemId });

      if (result.data?.initiateSupportChat?.id) {
        router.push(`/support/${result.data.initiateSupportChat.id}`);
      }
    };

    const Content = (
      <View className={scrollable ? 'flex-1 p-5 pt-0' : 'flex-1'} style={contentStyles}>
        <View className="flex-1">{children}</View>
      </View>
    );

    return (
      <Wrapper className="flex-1" style={backgroundStyles}>
        <SafeAreaView edges={isTablet ? ['top', 'bottom', 'right'] : undefined} className="flex-1">
          <View
            style={{
              flex: 1,
              width: '100%',
              maxWidth: isTablet ? 840 : undefined,
              alignSelf: isTablet ? 'flex-start' : 'center',
            }}
          >
            <View className="flex-row items-center justify-between p-5">
              <View className="flex-row items-center gap-2">
                {router.canGoBack() && (
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      router.back();
                    }}
                    aria-label="Go Back"
                    className="h-11 w-11 items-center justify-center rounded-2xl"
                    style={{
                      backgroundColor:
                        backButton === 'translucent'
                          ? colors['surface-01']
                          : backButton === 'light'
                            ? hexToRgba('#fff', 0.15)
                            : colors.secondary,
                    }}
                  >
                    <ChevronLeft
                      size={22}
                      color={
                        backButton === 'translucent'
                          ? colors.text
                          : backButton === 'light'
                            ? '#fff'
                            : colors.background
                      }
                    />
                  </Pressable>
                )}
                <View className="flex-row items-center gap-2">
                  {avatar && (
                    <View
                      className="h-10 w-10 overflow-hidden rounded-xl border"
                      style={{ borderColor: hexToRgba(colors.text, 0.2) }}
                    >
                      <Image
                        style={{
                          height: '100%',
                          width: '100%',
                          objectFit: 'cover',
                        }}
                        source={{
                          uri: avatar.image,
                        }}
                      />
                    </View>
                  )}
                  <View className="gap-0.5">
                    <ThemedText
                      className="py-0"
                      style={{
                        fontSize: avatar ? 12 : 16,
                        fontFamily: avatar ? Fonts.medium : Fonts.semibold,
                        color: backButton === 'light' ? '#fff' : colors.text,
                      }}
                    >
                      {title}
                    </ThemedText>
                    {avatar?.online !== undefined && (
                      <ThemedText
                        className="py-0"
                        style={{
                          fontSize: 10,
                          fontFamily: Fonts.regular,
                          color: hexToRgba(backButton === 'light' ? '#fff' : colors.text, 0.5),
                        }}
                      >
                        {avatar?.online
                          ? 'Online'
                          : `Last seen ${moment(avatar?.lastSeen).fromNow()}`}
                      </ThemedText>
                    )}
                  </View>
                </View>
              </View>
              <View className="flex-row items-center gap-3">
                {isFormStep && (
                  <Pressable
                    onPress={handleDone}
                    aria-label="Done editing"
                    hitSlop={12}
                    className="h-11 items-center justify-center px-1"
                  >
                    <ThemedText
                      style={{
                        fontSize: 15,
                        fontFamily: Fonts.semibold,
                        color: colors.primary,
                      }}
                    >
                      Done
                    </ThemedText>
                  </Pressable>
                )}
                {withSupport && (
                  <Pressable
                    onPress={handleSupportPress}
                    disabled={initiateSupportChatResult.fetching}
                    className="h-11 w-11 items-center justify-center rounded-2xl border"
                    style={{
                      backgroundColor: colors['surface-01'],
                      borderColor: hexToRgba(colors.text, 0.08),
                      opacity: initiateSupportChatResult.fetching ? 0.7 : 1,
                    }}
                  >
                    {initiateSupportChatResult.fetching ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <Support size={20} color={colors.primary} />
                    )}
                  </Pressable>
                )}
                {withShare && (
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      onShare?.();
                    }}
                    className="h-11 w-11 items-center justify-center rounded-2xl border"
                    style={{
                      backgroundColor: colors['surface-01'],
                      borderColor: hexToRgba(colors.text, 0.08),
                    }}
                  >
                    <Share2Icon size={20} color={colors.primary} />
                  </Pressable>
                )}
                {withPhone && (
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      router.push(buildCallURL(String(id), 'voice', true));
                    }}
                    className="h-11 w-11 items-center justify-center rounded-2xl border"
                    style={{
                      backgroundColor: colors['surface-01'],
                      borderColor: hexToRgba(colors.text, 0.08),
                    }}
                  >
                    <SolarPhoneOutline size={20} color={colors.primary} />
                  </Pressable>
                )}
                {withVideo && (
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      router.push(buildCallURL(String(id), 'video', true));
                    }}
                    className="h-11 w-11 items-center justify-center rounded-2xl border"
                    style={{
                      backgroundColor: colors['surface-01'],
                      borderColor: hexToRgba(colors.text, 0.08),
                    }}
                  >
                    <HugeiconsVideo01 size={20} color={colors.primary} />
                  </Pressable>
                )}
                {withNotifications && (
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      router.push('/users/notifications');
                    }}
                  >
                    <IonNotificationsOutline color={hexToRgba(colors['text'], 0.7)} />
                  </Pressable>
                )}
                {withProfile && (
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      router.push(variant === 'guest' ? '/guest/profile' : '/host/profile');
                    }}
                    className="h-10 w-10 overflow-hidden rounded-xl border"
                    style={{
                      borderColor: hexToRgba(colors['text'], 0.6),
                      borderWidth: 2,
                    }}
                  >
                    <Image
                      style={{
                        height: '100%',
                        width: '100%',
                        objectFit: 'cover',
                      }}
                      source={{
                        uri:
                          user.user?.profile?.image?.publicUrl ??
                          getDefaultProfileImageUrl(user.user?.profile.fullName ?? ''),
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
                  },
                ]}
              >
                {footer}
              </Animated.View>
            )}
          </View>
        </SafeAreaView>
      </Wrapper>
    );
  },
);

DetailsLayout.displayName = 'DetailsLayout';

export default DetailsLayout;

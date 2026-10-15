import moment from 'moment';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
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
import { maxWidth as kMax, useLayout } from '@/lib/k/layout';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { ArrowLeft, Bell, Headset, Phone, Share2Icon, Video } from 'lucide-react-native';
import { Avatar, IconButton, KText } from '../k';
import { color as k } from '@/lib/k/theme';
import { Href, useLocalSearchParams, usePathname } from 'expo-router';
import { useRouter } from '@/lib/hooks/use-router';
import { EventEmitter } from '@/lib/utils/event-emitter';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useGradualKeyboardAnimation } from '@/lib/hooks/keyboard';
import ThemedView from '../atoms/a-themed-view';
import AmbientGlow from '../atoms/a-ambient-glow';
import { useUser } from '@/lib/hooks/user';
import { buildCallURL } from '@/lib/utils/call';

import * as Haptics from 'expo-haptics';
import {
  useInitiateSupportChatMutation,
  SupportItemType,
  useCreateOrUpdateHostingMutation,
} from '@/lib/services/graphql/generated';
import { useActiveFormHosingStore } from '@/lib/stores/hostings';
import { removeTypenames } from '@/lib/utils/graphql/cleanup';
import { handleError } from '@/lib/utils/error';

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
  /** Faint warm/cool ambient light behind the content (soft/cloudy depth).
   *  On by default for solid (dark) screens; pass `false` to suppress it on
   *  screens with their own full-bleed imagery or a light background. */
  ambientGlow?: boolean;
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
      ambientGlow = false,
    },
    ref,
  ) => {
    const router = useRouter();
    const colors = useThemeColors();
    const insets = useSafeAreaInsets();
    const scrollViewRef = useRef<ScrollView>(null);
    const { isTablet } = useBreakpoint();
    const layout = useLayout();
    // Under a tab bar, the bar already reserves the bottom inset — don't add it
    // again here (it would stop content an inset above the nav).
    const inTabs = React.useContext(BottomTabBarHeightContext) != null;
    const path = usePathname();
    const { height: keyboardHeight } = useGradualKeyboardAnimation();
    const { id, transactionId } = useLocalSearchParams();
    const { user } = useUser();
    const [initiateSupportChatResult, initiateSupportChat] = useInitiateSupportChatMutation();
    const [, saveHosting] = useCreateOrUpdateHostingMutation();
    const [doneSaving, setDoneSaving] = React.useState(false);

    // Track when safe area insets have been measured to avoid layout jumps.
    // On first render insets.bottom is 0, then transitions to the real value (e.g. 34px).
    // We animate to the measured value so the footer settles smoothly.
    const bottomInsetReady = React.useRef(false);
    const animatedBottomInset = useSharedValue(0);

    React.useEffect(() => {
      // Inside a tab navigator the tab bar already reserves the bottom inset —
      // extending the footer into it (padding + negative margin below) would
      // drag the footer (and any FAB anchored in it) underneath the tab bar.
      if (inTabs) return;
      if (insets.bottom > 0 && !bottomInsetReady.current) {
        bottomInsetReady.current = true;
        // Animate from 0 to the real value so the footer shifts smoothly
        // rather than snapping.
        animatedBottomInset.value = withTiming(insets.bottom, { duration: 150 });
      }
    }, [insets.bottom, animatedBottomInset, inTabs]);

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
    const handleDone = async () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const target = `/hostings/form/onboarding${id ? `?id=${id}` : ''}` as Href;
      // Persist the in-progress edits before leaving — users click Done
      // expecting a save. Read the live form input straight from the store
      // (no subscription) so this stays cheap on non-form screens.
      const input = useActiveFormHosingStore.getState().input;
      if (input && Object.keys(input).length > 0) {
        setDoneSaving(true);
        const res = await saveHosting({ input: removeTypenames(input) as typeof input });
        setDoneSaving(false);
        if (res.error) {
          // Don't leave silently on a failed save — surface it and stay put.
          handleError(res.error);
          return;
        }
      }
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
        {/* Ambient soft/cloudy glow — atmospheric depth behind the content.
            On by default for solid (dark) screens; screens with their own
            full-bleed imagery or a light background pass `ambientGlow={false}`. */}
        {ambientGlow && background === 'solid' ? <AmbientGlow /> : null}
        <SafeAreaView
          edges={isTablet ? ['top', 'bottom', 'right'] : inTabs ? ['top'] : undefined}
          className="flex-1"
        >
          <View
            style={{
              flex: 1,
              width: '100%',
              // Tablet windows: a centered column (forms narrower). Phones keep their layout.
              maxWidth: !layout.compact ? (isFormStep || path.startsWith('/kyc') ? kMax.form : kMax.reading) : isTablet ? 840 : undefined,
              alignSelf: !layout.compact ? 'center' : isTablet ? 'flex-start' : 'center',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 }}>
              {!inTabs && (
                <IconButton
                  label="Back"
                  tone={backButton === 'light' ? 'glass' : 'ghost'}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                    if (router.canGoBack()) router.back();
                    else router.replace('/');
                  }}
                >
                  <ArrowLeft size={19} color={k.fg} />
                </IconButton>
              )}
              {avatar && <Avatar uri={avatar.image} name={title} size={40} />}
              <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                <KText v={avatar ? 'bodyStrong' : 'heading'} numberOfLines={1} style={backButton === 'light' ? { color: '#fff' } : undefined}>
                  {title}
                </KText>
                {avatar?.online !== undefined && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: avatar.online ? k.success : k.dim }} />
                    <KText v="xs">{avatar.online ? 'Online' : avatar.lastSeen ? `Last seen ${moment(avatar.lastSeen).fromNow()}` : 'Offline'}</KText>
                  </View>
                )}
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {isFormStep && (
                  <Pressable onPress={handleDone} disabled={doneSaving} aria-label="Done editing" hitSlop={12} style={{ height: 42, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 4 }}>
                    {doneSaving && <ActivityIndicator size="small" color={k.amber} />}
                    <KText v="smallStrong" style={{ color: k.amber }}>
                      {doneSaving ? 'Saving…' : 'Done'}
                    </KText>
                  </Pressable>
                )}
                {withSupport && (
                  <IconButton label="Get help" onPress={handleSupportPress} disabled={initiateSupportChatResult.fetching}>
                    {initiateSupportChatResult.fetching ? <ActivityIndicator size="small" color={k.amber} /> : <Headset size={18} color={k.fg} />}
                  </IconButton>
                )}
                {withShare && (
                  <IconButton
                    label="Share"
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                      onShare?.();
                    }}
                  >
                    <Share2Icon size={18} color={k.fg} />
                  </IconButton>
                )}
                {withPhone && (
                  <IconButton label="Voice call" onPress={() => router.push(buildCallURL(String(id), 'voice', true))}>
                    <Phone size={18} color={k.fg} />
                  </IconButton>
                )}
                {withVideo && (
                  <IconButton label="Video call" onPress={() => router.push(buildCallURL(String(id), 'video', true))}>
                    <Video size={18} color={k.fg} />
                  </IconButton>
                )}
                {withNotifications && (
                  <IconButton label="Notifications" onPress={() => router.push('/notifications')}>
                    <Bell size={18} color={k.fg} />
                  </IconButton>
                )}
                {withProfile && (
                  <Pressable onPress={() => router.push(variant === 'guest' ? '/you' : '/host/you')} accessibilityLabel="You">
                    <Avatar uri={user.user?.profile?.image?.publicUrl} name={user.user?.profile?.fullName} size={40} />
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

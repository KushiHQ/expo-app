import { SafeAreaView } from 'react-native-safe-area-context';
import ThemedView from '../atoms/a-themed-view';
import React, { useRef, useEffect } from 'react';
import { Pressable, RefreshControlProps, ScrollView, View } from 'react-native';
import { useBreakpoint } from '@/lib/hooks/use-breakpoint';
import { hexToRgba } from '@/lib/utils/colors';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import ThemedText from '../atoms/a-themed-text';
import { ChevronLeft } from 'lucide-react-native';
import { IonNotificationsOutline } from '../icons/i-notifications';
import { Image } from 'expo-image';
import { usePathname, useRouter } from 'expo-router';
import { EventEmitter } from '@/lib/utils/event-emitter';
import { useUser } from '@/lib/hooks/user';
import { getDefaultProfileImageUrl } from '@/lib/utils/urls';
import { useNotificationsQuery } from '@/lib/services/graphql/generated';
import * as Haptics from 'expo-haptics';

import { Fonts } from '@/lib/constants/theme';

type Props = {
  children?: React.ReactNode;
  refreshControl?: React.ReactElement<
    RefreshControlProps,
    string | React.JSXElementConstructor<any>
  >;
  scrollable?: boolean;
};

const ProfileLayout: React.FC<Props> = ({ children, refreshControl, scrollable = true }) => {
  const colors = useThemeColors();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const path = usePathname();
  const { user } = useUser();
  const { isTablet } = useBreakpoint();

  const [{ data: notifData }] = useNotificationsQuery({
    variables: { pagination: { limit: 20 } },
  });
  const unreadCount = (notifData?.notifications ?? []).filter((n) => !n.isRead).length;

  useEffect(() => {
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

  const Content = (
    <View className={scrollable ? 'flex-1 p-5 pt-0' : 'flex-1'}>
      <View className="flex-1">{children}</View>
    </View>
  );

  return (
    <ThemedView className="flex-1">
      <SafeAreaView className="flex-1">
        <View
          style={{
            flex: 1,
            width: '100%',
            maxWidth: isTablet ? 900 : undefined,
            alignSelf: 'center',
          }}
        >
          <View className="flex-row items-center justify-between p-5">
            <View className="flex-row items-center gap-3">
              {router.canGoBack() && (
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.back();
                  }}
                  aria-label="Go Back"
                  className="h-11 w-11 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: colors['surface-01'] }}
                >
                  <ChevronLeft size={22} color={colors['text']} />
                </Pressable>
              )}
              <View className="gap-0.5">
                <ThemedText style={{ fontSize: 16, fontFamily: Fonts.semibold }}>
                  {user.user?.profile.fullName}
                </ThemedText>
                <ThemedText
                  style={{
                    fontSize: 11,
                    fontFamily: Fonts.medium,
                    color: hexToRgba(colors['text'], 0.5),
                  }}
                >
                  Find your perfect home
                </ThemedText>
              </View>
            </View>
            <View className="flex-row items-center gap-4">
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/users/notifications');
                }}
                className="h-11 w-11 items-center justify-center rounded-2xl"
                style={{ backgroundColor: colors['surface-01'] }}
              >
                <IonNotificationsOutline size={20} color={hexToRgba(colors['text'], 0.8)} />
                {unreadCount > 0 && (
                  <View
                    className="absolute right-2.5 top-2.5 items-center justify-center rounded-full border-2"
                    style={{
                      width: 10,
                      height: 10,
                      backgroundColor: colors.primary,
                      borderColor: colors['surface-01'],
                    }}
                  />
                )}
              </Pressable>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/guest/profile');
                }}
                className="h-11 w-11 overflow-hidden rounded-2xl border-2"
                style={{
                  borderColor: hexToRgba(colors['text'], 0.1),
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
            </View>
          </View>
          {scrollable ? (
            <ScrollView
              ref={scrollViewRef}
              className="flex-1"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1 }}
              refreshControl={refreshControl}
            >
              {Content}
            </ScrollView>
          ) : (
            <View className="flex-1">{Content}</View>
          )}
        </View>
      </SafeAreaView>
    </ThemedView>
  );
};

export default ProfileLayout;

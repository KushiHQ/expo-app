import React, { useEffect } from 'react';
import { useActiveCall } from '@/lib/hooks/call';
import { Pressable, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { Mic, MicOff, ChevronLeft } from 'lucide-react-native';
import { F7PhoneDownFill, Fa7SolidPhone } from '../icons/i-phone';
import { QlementineIconsSpeaker16 } from '../icons/i-speaker';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import ThemedText from '../atoms/a-themed-text';
import CallBackground from '../atoms/a-call-background';
import { Fonts } from '@/lib/constants/theme';
import { getDefaultProfileImageUrl } from '@/lib/utils/urls';
import { PROPERTY_BLURHASH } from '@/lib/constants/images';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

type Props = {
  callData?: ReturnType<typeof useActiveCall>;
};

const AVATAR_SIZE = 148;
const WRAPPER_SIZE = 300;
const RING_SIZE = AVATAR_SIZE;
const RING_OFFSET = (WRAPPER_SIZE - RING_SIZE) / 2;

interface RippleRingProps {
  delay: number;
  maxOpacity: number;
}

const RippleRing: React.FC<RippleRingProps> = ({ delay, maxOpacity }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const PERIOD = 2200;
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 0 }),
          withTiming(1.9, {
            duration: PERIOD,
            easing: Easing.out(Easing.cubic),
          }),
        ),
        -1,
      ),
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(maxOpacity, { duration: 0 }),
          withTiming(0, { duration: PERIOD, easing: Easing.out(Easing.cubic) }),
        ),
        -1,
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: RING_OFFSET,
          left: RING_OFFSET,
          width: RING_SIZE,
          height: RING_SIZE,
          borderRadius: RING_SIZE / 2,
          borderWidth: 1.5,
          borderColor: '#F59E0B',
        },
        animStyle,
      ]}
    />
  );
};

const CallScreen: React.FC<Props> = ({ callData }) => {
  const router = useRouter();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  const isIncoming = !callData?.isCaller && callData?.isRinging;

  const recipientName = callData?.recipient?.profile.fullName ?? '';
  const recipientImage =
    callData?.recipient?.profile?.image?.publicUrl ?? getDefaultProfileImageUrl(recipientName);

  const answerPulse = useSharedValue(1);
  useEffect(() => {
    if (isIncoming) {
      answerPulse.value = withRepeat(
        withSequence(
          withTiming(1.08, {
            duration: 650,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1.0, { duration: 650, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
      );
    } else {
      answerPulse.value = withTiming(1, { duration: 200 });
    }
  }, [isIncoming, answerPulse]);

  const answerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: answerPulse.value }],
  }));

  const statusText = !callData
    ? ''
    : callData.isRinging
      ? callData.isCaller
        ? 'Calling...'
        : 'Incoming Call'
      : callData.callDuration;

  return (
    <CallBackground>
      <View
        style={[
          styles.root,
          {
            paddingTop: insets.top,
            paddingBottom: Math.max(insets.bottom, 24),
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>Voice Call</ThemedText>
          <View style={styles.headerSpacer} />
        </View>

        {/* Avatar + ripple rings */}
        <View style={styles.centerSection}>
          <View style={styles.avatarWrapper}>
            <RippleRing delay={0} maxOpacity={0.45} />
            <RippleRing delay={733} maxOpacity={0.35} />
            <RippleRing delay={1466} maxOpacity={0.25} />
            <View style={styles.avatarShell}>
              <Image
                source={{ uri: recipientImage }}
                style={styles.avatarImage}
                contentFit="cover"
                transition={300}
                placeholder={{ blurhash: PROPERTY_BLURHASH }}
                cachePolicy="memory-disk"
                priority="high"
              />
            </View>
          </View>

          <View style={styles.nameBlock}>
            <ThemedText style={styles.nameText}>{recipientName}</ThemedText>
            <ThemedText style={styles.statusText}>{statusText}</ThemedText>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controlsArea}>
          {isIncoming ? (
            <View style={styles.incomingRow}>
              <View style={styles.btnGroup}>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                    callData.leaveCall();
                  }}
                  style={[styles.actionCircle, { backgroundColor: colors.error }]}
                >
                  <F7PhoneDownFill size={32} color="#fff" />
                </Pressable>
                <ThemedText style={styles.btnLabel}>Decline</ThemedText>
              </View>

              <View style={styles.btnGroup}>
                <Animated.View style={answerStyle}>
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      callData.joinCall();
                    }}
                    style={[styles.actionCircle, { backgroundColor: colors.success }]}
                  >
                    <Fa7SolidPhone size={32} color="#fff" />
                  </Pressable>
                </Animated.View>
                <ThemedText style={styles.btnLabel}>Answer</ThemedText>
              </View>
            </View>
          ) : (
            <View
              style={[
                styles.controlPill,
                {
                  backgroundColor: hexToRgba('#0c1526', 0.88),
                },
              ]}
            >
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  callData?.toggleSpeakerOn();
                }}
                style={[
                  styles.pillBtn,
                  {
                    backgroundColor: callData?.isSpeakerOn ? '#fff' : hexToRgba('#ffffff', 0.13),
                  },
                ]}
              >
                <QlementineIconsSpeaker16
                  size={26}
                  color={callData?.isSpeakerOn ? '#000' : '#fff'}
                />
              </Pressable>

              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                  callData ? callData.leaveCall() : router.back();
                }}
                style={[styles.endCallBtn, { backgroundColor: colors.error }]}
              >
                <F7PhoneDownFill size={30} color="#fff" />
              </Pressable>

              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  callData?.toggleMic();
                }}
                style={[
                  styles.pillBtn,
                  {
                    backgroundColor: !callData?.micEnabled ? '#fff' : hexToRgba('#ffffff', 0.13),
                  },
                ]}
              >
                {!callData?.micEnabled ? (
                  <MicOff size={26} color="#000" />
                ) : (
                  <Mic size={26} color="#fff" />
                )}
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </CallBackground>
  );
};

export default CallScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerBack: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.13)',
  },
  headerTitle: {
    fontSize: 15,
    fontFamily: Fonts.semibold,
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 0.4,
  },
  headerSpacer: {
    width: 42,
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  avatarWrapper: {
    width: WRAPPER_SIZE,
    height: WRAPPER_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarShell: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'rgba(245,158,11,0.55)',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  nameBlock: {
    alignItems: 'center',
    gap: 6,
  },
  nameText: {
    fontSize: 22,
    fontFamily: Fonts.semibold,
    color: '#fff',
    letterSpacing: 0.2,
  },
  statusText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 0.3,
  },
  controlsArea: {
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  incomingRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  btnGroup: {
    alignItems: 'center',
    gap: 10,
  },
  actionCircle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnLabel: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: 'rgba(255,255,255,0.8)',
  },
  controlPill: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 30,
  },
  pillBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  endCallBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

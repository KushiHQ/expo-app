import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { DailyMediaView } from '@daily-co/react-native-daily-js';
import { useActiveCall } from '@/lib/hooks/call';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import ThemedText from '@/components/atoms/a-themed-text';
import { ChevronLeft, Mic, MicOff, Video, VideoOff } from 'lucide-react-native';
import { F7PhoneDownFill, Fa7SolidPhone } from '@/components/icons/i-phone';
import { QlementineIconsSpeaker16 } from '@/components/icons/i-speaker';
import { GravityUiArrowsRotateRight } from '../icons/i-rotate';
import { Fonts } from '@/lib/constants/theme';
import { getDefaultProfileImageUrl } from '@/lib/utils/urls';
import { PROPERTY_BLURHASH } from '@/lib/constants/images';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

type Props = {
  callData?: ReturnType<typeof useActiveCall>;
};

const PIP_WIDTH = 112;
const PIP_HEIGHT = 152;

const CtrlBtn: React.FC<{
  onPress: () => void;
  active: boolean;
  label: string;
  icon: React.ReactNode;
}> = ({ onPress, active, label, icon }) => (
  <View style={styles.ctrlGroup}>
    <Pressable
      onPress={onPress}
      style={[
        styles.ctrlBtnInner,
        { backgroundColor: active ? '#fff' : hexToRgba('#ffffff', 0.15) },
      ]}
    >
      {icon}
    </Pressable>
    <ThemedText style={styles.ctrlLabel}>{label}</ThemedText>
  </View>
);

const ChatVideoCallScreen: React.FC<Props> = ({ callData }) => {
  const router = useRouter();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const [controlsHeight, setControlsHeight] = useState(110);

  const isIncoming = !callData?.isCaller && callData?.isRinging;
  const isActive = !!(callData && !callData.isRinging);
  const hasRemoteVideo = !!(isActive && callData.remoteParticipant?.tracks.video.track);
  const isRemoteMuted =
    isActive && callData.remoteParticipant && !callData.remoteParticipant.tracks.audio.track;

  const recipientName = callData?.recipient?.profile.fullName ?? '';
  const recipientImage =
    callData?.recipient?.profile?.image?.publicUrl ?? getDefaultProfileImageUrl(recipientName);

  const answerPulse = useSharedValue(1);
  useEffect(() => {
    if (isIncoming) {
      answerPulse.value = withRepeat(
        withSequence(
          withTiming(1.08, {
            duration: 700,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1.0, { duration: 700, easing: Easing.inOut(Easing.ease) }),
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

  const statusLabel = !callData
    ? ''
    : callData.isRinging
      ? callData.isCaller
        ? 'Calling...'
        : 'Incoming call'
      : callData.callDuration;

  const pipBottom = insets.bottom + controlsHeight + 12;

  return (
    <View style={styles.container}>
      {/* ── Background video layer ── */}
      {isActive && hasRemoteVideo ? (
        <DailyMediaView
          videoTrack={callData.remoteParticipant!.tracks.video.track!}
          audioTrack={callData.remoteParticipant!.tracks.audio.track ?? null}
          objectFit="cover"
          style={StyleSheet.absoluteFillObject}
        />
      ) : callData?.localParticipant && callData.cameraEnabled ? (
        <DailyMediaView
          videoTrack={callData.localParticipant.tracks.video.track ?? null}
          audioTrack={null}
          mirror={true}
          objectFit="cover"
          style={StyleSheet.absoluteFillObject}
        />
      ) : (
        <View style={[StyleSheet.absoluteFillObject, styles.darkBg]} />
      )}

      {/* ── Remote camera-off fallback ── */}
      {isActive && !hasRemoteVideo && (
        <View style={[StyleSheet.absoluteFillObject, styles.cameraOffCenter]}>
          <View style={[styles.cameraOffRing, { borderColor: hexToRgba('#F59E0B', 0.4) }]}>
            <Image
              source={{ uri: recipientImage }}
              style={styles.cameraOffAvatar}
              contentFit="cover"
              transition={300}
              placeholder={{ blurhash: PROPERTY_BLURHASH }}
              cachePolicy="memory-disk"
            />
          </View>
          <ThemedText style={styles.cameraOffName}>{recipientName}</ThemedText>
          <View
            style={[
              styles.cameraOffBadge,
              {
                backgroundColor: hexToRgba('#020617', 0.7),
                borderColor: hexToRgba('#ffffff', 0.12),
              },
            ]}
          >
            <VideoOff size={12} color="rgba(255,255,255,0.6)" />
            <ThemedText style={styles.cameraOffBadgeText}>Camera off</ThemedText>
          </View>
        </View>
      )}

      {/* ── Top scrim + header ── */}
      <View
        style={[
          styles.topGradient,
          { paddingTop: insets.top, backgroundColor: 'rgba(2,6,23,0.75)' },
        ]}
        pointerEvents="box-none"
      >
        <View style={styles.header} pointerEvents="box-none">
          <View style={styles.headerInfo}>
            <ThemedText style={styles.headerName}>{recipientName}</ThemedText>
            <ThemedText style={styles.headerStatus}>{statusLabel}</ThemedText>
          </View>
          <View style={styles.headerBtn} />
        </View>
      </View>

      {/* ── Incoming call — centered participant card ── */}
      {!isActive && (
        <View style={styles.incomingOverlay} pointerEvents="none">
          <View
            style={[
              styles.incomingCard,
              {
                backgroundColor: hexToRgba('#020617', 0.72),
                borderColor: hexToRgba('#ffffff', 0.1),
              },
            ]}
          >
            <View style={[styles.incomingRing, { borderColor: hexToRgba('#F59E0B', 0.55) }]}>
              <Image
                source={{ uri: recipientImage }}
                style={styles.incomingAvatar}
                contentFit="cover"
                transition={300}
                placeholder={{ blurhash: PROPERTY_BLURHASH }}
                cachePolicy="memory-disk"
                priority="high"
              />
            </View>
            <ThemedText style={styles.incomingName}>{recipientName}</ThemedText>
            <ThemedText style={[styles.incomingStatus, { color: hexToRgba('#ffffff', 0.5) }]}>
              {statusLabel}
            </ThemedText>
          </View>
        </View>
      )}

      {/* ── Mic-muted badge ── */}
      {isRemoteMuted && (
        <View
          style={[
            styles.mutedBadge,
            {
              top: insets.top + 60,
              backgroundColor: hexToRgba('#020617', 0.75),
              borderColor: hexToRgba('#ffffff', 0.13),
            },
          ]}
        >
          <MicOff size={11} color="rgba(255,255,255,0.75)" />
          <ThemedText style={styles.mutedText}>Muted</ThemedText>
        </View>
      )}

      {/* ── PIP — local participant, above controls ── */}
      {isActive && callData.localParticipant && (
        <View
          style={[
            styles.pip,
            {
              bottom: pipBottom,
              borderColor: hexToRgba('#F59E0B', 0.45),
              ...Platform.select({
                ios: {
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.45,
                  shadowRadius: 10,
                },
                android: { elevation: 10 },
              }),
            },
          ]}
        >
          {callData.cameraEnabled ? (
            <DailyMediaView
              videoTrack={callData.localParticipant.tracks.video.track ?? null}
              audioTrack={null}
              mirror={true}
              objectFit="cover"
              style={StyleSheet.absoluteFillObject}
              zOrder={1}
            />
          ) : (
            <View style={styles.pipCameraOff}>
              <VideoOff size={20} color="rgba(255,255,255,0.5)" />
            </View>
          )}
        </View>
      )}

      {/* ── Bottom scrim + controls ── */}
      <View
        style={[
          styles.bottomGradient,
          {
            paddingBottom: insets.bottom + 20,
            backgroundColor: 'rgba(2,6,23,0.85)',
          },
        ]}
        onLayout={(e) => setControlsHeight(e.nativeEvent.layout.height)}
      >
        {isIncoming ? (
          <View style={styles.incomingActions}>
            <View style={styles.actionGroup}>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                  callData?.leaveCall();
                }}
                style={[styles.actionCircle, { backgroundColor: colors.error }]}
              >
                <F7PhoneDownFill size={30} color="#fff" />
              </Pressable>
              <ThemedText style={styles.actionLabel}>Decline</ThemedText>
            </View>

            <View style={styles.actionGroup}>
              <Animated.View style={answerStyle}>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    callData?.joinCall();
                  }}
                  style={[styles.actionCircle, { backgroundColor: colors.success }]}
                >
                  <Fa7SolidPhone size={30} color="#fff" />
                </Pressable>
              </Animated.View>
              <ThemedText style={styles.actionLabel}>Answer</ThemedText>
            </View>
          </View>
        ) : (
          <View style={styles.activeControls}>
            <CtrlBtn
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                callData?.toggleSpeakerOn();
              }}
              active={callData?.isSpeakerOn ?? false}
              label="Speaker"
              icon={
                <QlementineIconsSpeaker16
                  size={24}
                  color={callData?.isSpeakerOn ? '#000' : '#fff'}
                />
              }
            />

            <CtrlBtn
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                callData?.toggleMic();
              }}
              active={!(callData?.micEnabled ?? true)}
              label="Mute"
              icon={
                !(callData?.micEnabled ?? true) ? (
                  <MicOff size={24} color="#000" />
                ) : (
                  <Mic size={24} color="#fff" />
                )
              }
            />

            <CtrlBtn
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                callData?.toggleCamera();
              }}
              active={!(callData?.cameraEnabled ?? true)}
              label="Camera"
              icon={
                !(callData?.cameraEnabled ?? true) ? (
                  <VideoOff size={24} color="#000" />
                ) : (
                  <Video size={24} color="#fff" />
                )
              }
            />

            <CtrlBtn
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                callData?.toggleFacingCamera();
              }}
              active={false}
              label="Flip"
              icon={<GravityUiArrowsRotateRight size={24} color="#fff" />}
            />

            <View style={styles.ctrlGroup}>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                  callData ? callData.leaveCall() : router.back();
                }}
                style={[styles.endBtn, { backgroundColor: colors.error }]}
              >
                <F7PhoneDownFill size={26} color="#fff" />
              </Pressable>
              <ThemedText style={styles.ctrlLabel}>End</ThemedText>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default ChatVideoCallScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  darkBg: {
    backgroundColor: '#020617',
  },
  // Top scrim
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingBottom: 40,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    alignItems: 'center',
    gap: 2,
  },
  headerName: {
    fontSize: 16,
    fontFamily: Fonts.semibold,
    color: '#fff',
    letterSpacing: 0.2,
  },
  headerStatus: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 0.3,
  },
  // Remote camera-off
  cameraOffCenter: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  cameraOffRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    overflow: 'hidden',
  },
  cameraOffAvatar: {
    width: '100%',
    height: '100%',
  },
  cameraOffName: {
    fontSize: 18,
    fontFamily: Fonts.semibold,
    color: '#fff',
  },
  cameraOffBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  cameraOffBadgeText: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: 'rgba(255,255,255,0.6)',
  },
  // Incoming overlay
  incomingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
    marginTop: 80,
    marginBottom: 160,
  },
  incomingCard: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 28,
    paddingHorizontal: 36,
    borderRadius: 24,
    borderWidth: 1,
  },
  incomingRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    overflow: 'hidden',
  },
  incomingAvatar: {
    width: '100%',
    height: '100%',
  },
  incomingName: {
    fontSize: 20,
    fontFamily: Fonts.semibold,
    color: '#fff',
    marginTop: 4,
  },
  incomingStatus: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    letterSpacing: 0.3,
  },
  // Muted badge
  mutedBadge: {
    position: 'absolute',
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    zIndex: 10,
  },
  mutedText: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: 'rgba(255,255,255,0.75)',
  },
  // PIP
  pip: {
    position: 'absolute',
    right: 16,
    width: PIP_WIDTH,
    height: PIP_HEIGHT,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 2,
    backgroundColor: '#0c1526',
    zIndex: 10,
  },
  pipCameraOff: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0c1526',
  },
  // Bottom scrim
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 60,
    zIndex: 10,
  },
  incomingActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 8,
  },
  actionGroup: {
    alignItems: 'center',
    gap: 10,
  },
  actionCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: 'rgba(255,255,255,0.8)',
  },
  // Active controls
  activeControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 4,
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  ctrlGroup: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  ctrlBtnInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctrlLabel: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
  },
  endBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

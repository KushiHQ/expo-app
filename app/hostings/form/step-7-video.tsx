import React, { useRef, useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Pressable, Text, Alert, Modal, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import { Fonts } from '@/lib/constants/theme';
import { useHostingForm } from '@/lib/hooks/hosting-form';
import {
  HostingVerificationTier,
  useRequestHostingVerificationTierMutation,
} from '@/lib/services/graphql/generated';
import { handleError } from '@/lib/utils/error';
import { toast } from '@/lib/hooks/use-toast';
import { useRouter } from '@/lib/hooks/use-router';
import GeofenceOverlay from '@/components/atoms/a-geofence-overlay';
import Checkbox from '@/components/atoms/a-checkbox';
import Button from '@/components/atoms/a-button';
import LoadingModal from '@/components/atoms/a-loading-modal';
import { Video, VideoOff, X, Check, RotateCcw, MapPin } from 'lucide-react-native';

type Phase = 'gps-check' | 'ready' | 'recording' | 'preview' | 'uploading';

const MAX_DURATION = 120;
const GPS_SAMPLE_COUNT = 3;
const GPS_SAMPLE_INTERVAL = 1500;
const GPS_MID_SAMPLE_INTERVAL = 5000;

export default function VideoWalkthroughScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const colors = useThemeColors();
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const { hosting } = useHostingForm(id);
  const [, requestHostingVerificationTier] = useRequestHostingVerificationTierMutation();

  const [phase, setPhase] = useState<Phase>('gps-check');
  const [gpsSamples, setGpsSamples] = useState<Location.LocationObject[]>([]);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [consentRecording, setConsentRecording] = useState(false);
  const [consentThirdParty, setConsentThirdParty] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const midGpsRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingLocationsRef = useRef<Location.LocationObject[]>([]);

  const hostingLat = hosting?.latitude ?? '';
  const hostingLng = hosting?.longitude ?? '';

  useEffect(() => {
    if (phase !== 'gps-check') return;

    let mounted = true;
    let sampleCount = 0;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        if (mounted) {
          setGpsError('Location permission is required to record a walkthrough.');
          setPhase('ready');
        }
        return;
      }

      const samples: Location.LocationObject[] = [];

      const takeSample = async () => {
        try {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.BestForNavigation,
          });
          samples.push(loc);
          sampleCount++;
          if (mounted) setGpsSamples([...samples]);

          if (sampleCount < GPS_SAMPLE_COUNT) {
            setTimeout(takeSample, GPS_SAMPLE_INTERVAL);
          } else if (mounted) {
            setPhase('ready');
          }
        } catch {
          if (mounted) {
            setGpsError(
              'Could not acquire GPS signal. You can still record, but GPS metadata will be limited.',
            );
            setPhase('ready');
          }
        }
      };

      takeSample();
    })();

    return () => {
      mounted = false;
    };
  }, [phase]);

  const startMidRecordingGps = useCallback(() => {
    recordingLocationsRef.current = [];
    midGpsRef.current = setInterval(async () => {
      try {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.BestForNavigation,
        });
        recordingLocationsRef.current.push(loc);
      } catch {
        // silent — mid-recording GPS is best-effort
      }
    }, GPS_MID_SAMPLE_INTERVAL);
  }, []);

  const stopMidRecordingGps = useCallback(() => {
    if (midGpsRef.current) {
      clearInterval(midGpsRef.current);
      midGpsRef.current = null;
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    stopMidRecordingGps();
    cameraRef.current?.stopRecording();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [stopMidRecordingGps]);

  const confirmStartRecording = useCallback(async () => {
    setShowConsentModal(false);

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const video = await cameraRef.current?.recordAsync({
        maxDuration: MAX_DURATION,
      });

      if (video?.uri) {
        setRecordedUri(video.uri);
        setPhase('preview');
      }
    } catch (error) {
      console.error('Recording error:', error);
      Alert.alert('Error', 'Failed to record video. Please try again.');
      setPhase('ready');
    }

    stopMidRecordingGps();
  }, [stopMidRecordingGps]);

  const handleStartRecording = useCallback(() => {
    setPhase('recording');
    setElapsed(0);
    startMidRecordingGps();

    timerRef.current = setInterval(() => {
      setElapsed((prev) => {
        if (prev + 1 >= MAX_DURATION) {
          stopRecording();
          return MAX_DURATION;
        }
        return prev + 1;
      });
    }, 1000);

    confirmStartRecording();
  }, [startMidRecordingGps, confirmStartRecording, stopRecording]);

  const handleRetake = useCallback(() => {
    setRecordedUri(null);
    setElapsed(0);
    setPhase('ready');
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!recordedUri || !id) return;

    setPhase('uploading');
    try {
      const videoBlob = {
        uri: recordedUri,
        type: 'video/mp4',
        name: 'walkthrough.mp4',
      } as unknown as File;

      const result = await requestHostingVerificationTier({
        input: {
          hostingId: id,
          targetTier: HostingVerificationTier.IdentityVerified,
          documentNames: ['Property Walkthrough Video'],
          uploads: [videoBlob],
        },
      });

      if (result.error) {
        handleError(result.error);
        setPhase('preview');
        return;
      }

      if (result.data?.requestHostingVerificationTier) {
        toast.show({
          type: 'success',
          text1: 'Walkthrough Uploaded',
          text2: 'Your property walkthrough video has been submitted for review.',
        });
        router.back();
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.show({
        type: 'error',
        text1: 'Upload Failed',
        text2: 'Could not upload the video. Please try again.',
      });
      setPhase('preview');
    }
  }, [recordedUri, id, router, requestHostingVerificationTier]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (midGpsRef.current) clearInterval(midGpsRef.current);
    };
  }, []);

  const consentReady = consentRecording && consentThirdParty;
  const progress = elapsed / MAX_DURATION;

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <VideoOff size={48} color={hexToRgba(colors.text, 0.3)} />
          <Text style={[styles.permissionTitle, { color: colors.text }]}>
            Camera Permission Required
          </Text>
          <Text style={styles.permissionSubtitle}>
            We need camera and microphone access to record your property walkthrough.
          </Text>
          <Button onPress={requestPermission} type="primary">
            <Text style={{ color: colors['primary-content'], fontFamily: Fonts.semibold }}>
              Grant Permission
            </Text>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <StatusBar style="light" hidden />
      <View style={styles.container}>
        <CameraView ref={cameraRef} style={styles.camera} mode="video" />

        {phase === 'gps-check' && (
          <View style={styles.overlayCenter}>
            <View style={styles.gpsCheckCard}>
              <View style={styles.gpsSpinner} />
              <Text style={styles.gpsCheckTitle}>Checking GPS...</Text>
              <Text style={styles.gpsCheckSubtitle}>
                Taking {GPS_SAMPLE_COUNT} location samples to verify you are at the property
              </Text>
              <View style={styles.gpsProgressDots}>
                {Array.from({ length: GPS_SAMPLE_COUNT }).map((_, i) => (
                  <View
                    key={i}
                    style={[styles.gpsDot, i < gpsSamples.length && styles.gpsDotActive]}
                  />
                ))}
              </View>
            </View>
          </View>
        )}

        {phase === 'ready' && (
          <>
            {hostingLat && hostingLng && (
              <GeofenceOverlay
                hostingLatitude={hostingLat}
                hostingLongitude={hostingLng}
                visible={true}
              />
            )}

            <View style={styles.topBar}>
              <Pressable onPress={() => router.back()} style={styles.closeButton}>
                <X size={20} color="white" />
              </Pressable>
              <View style={styles.topBarTitle}>
                <Video size={14} color="#FFA500" />
                <Text style={styles.topBarText}>Property Walkthrough</Text>
              </View>
              <View style={{ width: 36 }} />
            </View>

            {gpsError && (
              <View style={styles.warningBanner}>
                <MapPin size={12} color="#FBBF24" />
                <Text style={styles.warningText}>{gpsError}</Text>
              </View>
            )}

            <View style={styles.readyBottom}>
              <Text style={styles.readyHint}>Tap to record a walkthrough of the property</Text>
              <Text style={styles.readySubHint}>Max 2 minutes · 720p · GPS-tagged</Text>
              <Pressable onPress={handleStartRecording} style={styles.recordButtonOuter}>
                <View style={styles.recordButtonInner} />
              </Pressable>
            </View>
          </>
        )}

        {phase === 'recording' && (
          <>
            {hostingLat && hostingLng && (
              <GeofenceOverlay
                hostingLatitude={hostingLat}
                hostingLongitude={hostingLng}
                visible={true}
              />
            )}

            <View style={styles.recordingTopBar}>
              <View style={styles.recordingIndicator}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingText}>REC</Text>
              </View>
              <Text style={styles.timerText}>
                {String(Math.floor(elapsed / 60)).padStart(2, '0')}:
                {String(elapsed % 60).padStart(2, '0')}
              </Text>
            </View>

            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progress * 100}%`,
                    backgroundColor:
                      progress > 0.85 ? '#EF4444' : progress > 0.6 ? '#FBBF24' : '#22C55E',
                  },
                ]}
              />
            </View>

            <View style={styles.recordingBottom}>
              <Pressable onPress={stopRecording} style={styles.stopButton}>
                <View style={styles.stopIcon} />
              </Pressable>
              <Text style={styles.recordingHint}>
                {elapsed >= MAX_DURATION - 10
                  ? 'Auto-stop in ' + (MAX_DURATION - elapsed) + 's'
                  : 'Tap to stop recording'}
              </Text>
            </View>
          </>
        )}

        {phase === 'preview' && recordedUri && (
          <View style={styles.previewOverlay}>
            <View style={styles.previewTopBar}>
              <Pressable onPress={handleRetake} style={styles.previewAction}>
                <RotateCcw size={18} color="white" />
                <Text style={styles.previewActionText}>Retake</Text>
              </Pressable>
              <Text style={styles.previewTitle}>Preview</Text>
              <View style={{ width: 80 }} />
            </View>

            <View style={styles.previewCenter}>
              <View style={styles.previewPlaceholder}>
                <Video size={40} color="rgba(255,255,255,0.3)" />
                <Text style={styles.previewDuration}>
                  {String(Math.floor(elapsed / 60)).padStart(2, '0')}:
                  {String(elapsed % 60).padStart(2, '0')}
                </Text>
              </View>
            </View>

            <View style={styles.previewBottom}>
              <Button type="tinted" onPress={handleRetake} style={styles.previewButton}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <RotateCcw size={16} color={colors.text} />
                  <Text style={{ color: colors.text, fontFamily: Fonts.semibold }}>Re-record</Text>
                </View>
              </Button>
              <Button type="primary" onPress={handleSubmit} style={styles.previewButton}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Check size={16} color={colors['primary-content']} />
                  <Text style={{ color: colors['primary-content'], fontFamily: Fonts.semibold }}>
                    Submit Walkthrough
                  </Text>
                </View>
              </Button>
            </View>
          </View>
        )}
      </View>

      <Modal
        visible={showConsentModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConsentModal(false)}
      >
        <View style={styles.consentOverlay}>
          <View style={[styles.consentSheet, { backgroundColor: colors.background }]}>
            <View style={styles.consentHandle} />

            <View style={styles.consentHeader}>
              <View style={styles.consentIconContainer}>
                <Video size={22} color="#FFA500" />
              </View>
              <Text style={[styles.consentTitle, { color: colors.text }]}>Recording Consent</Text>
              <Text style={styles.consentSubtitle}>
                Your walkthrough video will be used to verify the property and build trust with
                potential guests. Please review and accept the following:
              </Text>
            </View>

            <ScrollView style={styles.consentBody} showsVerticalScrollIndicator={false}>
              <View style={styles.consentCheckRow}>
                <Checkbox
                  checked={consentRecording}
                  onValueChange={setConsentRecording}
                  color="#FFA500"
                  size={22}
                />
                <View style={styles.consentCheckContent}>
                  <Text style={[styles.consentCheckTitle, { color: colors.text }]}>
                    I consent to recording
                  </Text>
                  <Text style={styles.consentCheckDesc}>
                    I understand this video will be recorded on the property premises and submitted
                    to Kushi for verification purposes.
                  </Text>
                </View>
              </View>

              <View style={styles.consentCheckRow}>
                <Checkbox
                  checked={consentThirdParty}
                  onValueChange={setConsentThirdParty}
                  color="#FFA500"
                  size={22}
                />
                <View style={styles.consentCheckContent}>
                  <Text style={[styles.consentCheckTitle, { color: colors.text }]}>
                    Third-party disclosure
                  </Text>
                  <Text style={styles.consentCheckDesc}>
                    I acknowledge that this video may be reviewed by Kushi verification staff and
                    may be stored securely on Kushi&apos;s infrastructure. I have obtained consent
                    from any persons who may appear in the recording.
                  </Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.consentActions}>
              <Button
                type="tinted"
                onPress={() => {
                  setShowConsentModal(false);
                  setConsentRecording(false);
                  setConsentThirdParty(false);
                }}
                style={{ flex: 1 }}
              >
                <Text style={{ color: colors.text, fontFamily: Fonts.semibold }}>Cancel</Text>
              </Button>
              <Button
                type="primary"
                disabled={!consentReady}
                onPress={handleStartRecording}
                style={{ flex: 1 }}
              >
                <Text style={{ color: colors['primary-content'], fontFamily: Fonts.semibold }}>
                  Start Recording
                </Text>
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      <LoadingModal visible={phase === 'uploading'} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  permissionTitle: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    textAlign: 'center',
    marginTop: 8,
  },
  permissionSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    lineHeight: 20,
  },

  overlayCenter: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  gpsCheckCard: {
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 20,
    padding: 28,
    paddingHorizontal: 36,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  gpsSpinner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: 'rgba(255,165,0,0.2)',
    borderTopColor: '#FFA500',
  },
  gpsCheckTitle: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: 'white',
  },
  gpsCheckSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 220,
  },
  gpsProgressDots: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  gpsDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  gpsDotActive: {
    backgroundColor: '#22C55E',
  },

  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  topBarText: {
    fontSize: 13,
    fontFamily: Fonts.semibold,
    color: 'white',
  },

  warningBanner: {
    position: 'absolute',
    top: 110,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  warningText: {
    fontSize: 11,
    color: '#FBBF24',
    flex: 1,
    lineHeight: 16,
  },

  readyBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: 56,
    paddingTop: 40,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  readyHint: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontFamily: Fonts.medium,
    marginBottom: 4,
  },
  readySubHint: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    fontFamily: Fonts.regular,
    marginBottom: 28,
  },
  recordButtonOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  recordButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EF4444',
  },

  recordingTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  recordingText: {
    fontSize: 12,
    fontFamily: Fonts.bold,
    color: '#EF4444',
    letterSpacing: 1,
  },
  timerText: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: 'white',
    fontVariant: ['tabular-nums'],
  },

  progressBar: {
    position: 'absolute',
    top: 98,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  progressFill: {
    height: '100%',
    borderRadius: 1.5,
  },

  recordingBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: 56,
    paddingTop: 40,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  stopButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  stopIcon: {
    width: 28,
    height: 28,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  recordingHint: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 12,
    fontFamily: Fonts.regular,
  },

  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
  },
  previewTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  previewAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    width: 80,
    justifyContent: 'center',
  },
  previewActionText: {
    fontSize: 13,
    color: 'white',
    fontFamily: Fonts.medium,
  },
  previewTitle: {
    fontSize: 15,
    fontFamily: Fonts.semibold,
    color: 'white',
  },
  previewCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  previewDuration: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: 'rgba(255,255,255,0.6)',
    fontVariant: ['tabular-nums'],
  },
  previewBottom: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 56,
  },
  previewButton: {
    flex: 1,
  },

  consentOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  consentSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 34,
    maxHeight: '70%',
  },
  consentHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'center',
    marginBottom: 20,
  },
  consentHeader: {
    paddingHorizontal: 24,
    gap: 8,
  },
  consentIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 165, 0, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  consentTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
  },
  consentSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 20,
    marginBottom: 8,
  },
  consentBody: {
    paddingHorizontal: 24,
    gap: 20,
    marginTop: 12,
  },
  consentCheckRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  consentCheckContent: {
    flex: 1,
    gap: 4,
  },
  consentCheckTitle: {
    fontSize: 14,
    fontFamily: Fonts.semibold,
    lineHeight: 20,
  },
  consentCheckDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
    lineHeight: 18,
  },
  consentActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    marginTop: 24,
  },
});

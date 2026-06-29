import React, { useCallback, useRef, useState } from 'react';
import { View, StyleSheet, Pressable, ActivityIndicator, Modal } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import * as Location from 'expo-location';
import * as FileSystem from 'expo-file-system/legacy';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Video, X, RotateCcw } from 'lucide-react-native';
import DetailsLayout from '@/components/layouts/details';
import VideoCard from '@/components/molecules/m-video-card';
import HostingStepper from '@/components/molecules/m-hosting-stepper';
import SectionCard from '@/components/molecules/m-section-card';
import ThemedText from '@/components/atoms/a-themed-text';
import Button from '@/components/atoms/a-button';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import { Fonts } from '@/lib/constants/theme';
import { useRouter } from '@/lib/hooks/use-router';
import { toast } from '@/lib/hooks/use-toast';
import { handleError } from '@/lib/utils/error';
import { useHostingForm } from '@/lib/hooks/hosting-form';
import {
  useCreateHostingVideoUploadUrlMutation,
  useSetHostingVideoMutation,
} from '@/lib/services/graphql/generated';

const MAX_DURATION = 300; // 5 minutes
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export default function HostingVideoStep() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const hostingId = String(id ?? '');
  const colors = useThemeColors();
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();

  const { hosting } = useHostingForm(hostingId);
  const existingUrl = hosting?.video?.asset.publicUrl ?? null;
  const existingDuration = hosting?.video?.durationSeconds ?? 0;

  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [recorderOpen, setRecorderOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [uploading, setUploading] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const durationRef = useRef(0);
  // GPS captured silently for verification — never gates recording.
  const gpsStartRef = useRef<Location.LocationObject | null>(null);
  const gpsEndRef = useRef<Location.LocationObject | null>(null);

  const [, createUploadUrl] = useCreateHostingVideoUploadUrlMutation();
  const [, setHostingVideo] = useSetHostingVideoMutation();

  // Preview: the freshly recorded local file takes precedence, else the
  // already-saved walkthrough.
  const previewSource = recordedUri ?? existingUrl;

  const goNext = useCallback(() => {
    router.replace(`/hostings/form/step-3?id=${hostingId}`);
  }, [router, hostingId]);

  const sampleGps = useCallback(
    async (ref: React.MutableRefObject<Location.LocationObject | null>) => {
      try {
        const perm = await Location.getForegroundPermissionsAsync();
        if (perm.status !== 'granted') {
          const req = await Location.requestForegroundPermissionsAsync();
          if (req.status !== 'granted') return;
        }
        ref.current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.BestForNavigation,
        });
      } catch {
        // best-effort
      }
    },
    [],
  );

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
    cameraRef.current?.stopRecording();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const startRecording = useCallback(async () => {
    setIsRecording(true);
    setElapsed(0);
    durationRef.current = 0;
    gpsStartRef.current = null;
    gpsEndRef.current = null;
    void sampleGps(gpsStartRef);

    timerRef.current = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1;
        durationRef.current = next;
        if (next >= MAX_DURATION) {
          stopRecording();
          return MAX_DURATION;
        }
        return next;
      });
    }, 1000);

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const video = await cameraRef.current?.recordAsync({
        maxDuration: MAX_DURATION,
        maxFileSize: 200 * 1024 * 1024,
      });
      void sampleGps(gpsEndRef);
      if (video?.uri) {
        setRecordedUri(video.uri);
      }
    } catch (e) {
      console.error('Recording error:', e);
      toast.show({ type: 'error', text1: 'Recording failed', text2: 'Please try again.' });
    } finally {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setIsRecording(false);
      setRecorderOpen(false);
    }
  }, [sampleGps, stopRecording]);

  const openRecorder = useCallback(async () => {
    if (!permission?.granted) {
      const r = await requestPermission();
      if (!r.granted) {
        toast.show({ type: 'error', text1: 'Camera needed', text2: 'Allow camera access to record.' });
        return;
      }
    }
    if (!micPermission?.granted) await requestMicPermission();
    setElapsed(0);
    setRecorderOpen(true);
  }, [permission, micPermission, requestPermission, requestMicPermission]);

  const handleContinue = useCallback(async () => {
    // No new local recording — keep whatever's saved (or nothing) and move on.
    if (!recordedUri) {
      goNext();
      return;
    }
    setUploading(true);
    try {
      const contentType = recordedUri.toLowerCase().endsWith('.mov')
        ? 'video/quicktime'
        : 'video/mp4';

      const target = await createUploadUrl({ hostingId, contentType });
      const t = target.data?.createHostingVideoUploadUrl;
      if (target.error || !t) {
        if (target.error) handleError(target.error);
        else
          toast.show({ type: 'error', text1: "Couldn't start the upload", text2: 'Please try again.' });
        setUploading(false);
        return;
      }

      const res = await FileSystem.uploadAsync(t.uploadUrl, recordedUri, {
        httpMethod: 'PUT',
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
        headers: { 'Content-Type': contentType },
      });
      if (res.status < 200 || res.status >= 300) throw new Error(`Upload failed (${res.status})`);

      const gpsStart = gpsStartRef.current?.coords;
      const gpsEnd = gpsEndRef.current?.coords;
      const samples = [gpsStartRef.current, gpsEndRef.current].filter(Boolean);
      const save = await setHostingVideo({
        assetId: t.assetId,
        input: {
          hostingId,
          durationSeconds: durationRef.current || 1,
          geofenceStatus: gpsStart ? 'captured' : 'no_gps',
          gpsSamples: samples.length ? JSON.stringify(samples) : undefined,
          gpsStartLat: gpsStart?.latitude,
          gpsStartLng: gpsStart?.longitude,
          gpsEndLat: gpsEnd?.latitude,
          gpsEndLng: gpsEnd?.longitude,
          ndprConsent: true,
          consentText: 'Host confirmed the right to record and publish this property video.',
          recordedAt: new Date().toISOString(),
        },
      });
      if (save.error) {
        handleError(save.error);
        setUploading(false);
        return;
      }
      toast.show({ type: 'success', text1: 'Video saved', text2: 'Your property tour was added.' });
      goNext();
    } catch (e) {
      toast.show({
        type: 'error',
        text1: 'Upload failed',
        text2: e instanceof Error ? e.message : 'Please try again.',
      });
      setUploading(false);
    }
  }, [recordedUri, hostingId, createUploadUrl, setHostingVideo, goNext]);

  return (
    <>
      <DetailsLayout
        title="Hosting"
        footer={<HostingStepper step={3} loading={uploading} onPress={handleContinue} />}
      >
        <View style={{ gap: 20, paddingBottom: 24 }}>
          <SectionCard
            icon={<Video size={16} color={colors.primary} />}
            title="Video Walkthrough"
            subtitle="Optional — record a short tour (up to 5 min). Guests see it in your gallery."
          >
            {previewSource ? (
              <View style={{ gap: 12 }}>
                {/* Poster card → tap opens the immersive fullscreen player.
                    Recordings are shot on-device, so default to a portrait frame. */}
                <VideoCard
                  source={previewSource}
                  durationSeconds={recordedUri ? durationRef.current : existingDuration}
                  title="Property tour"
                  style={{ width: '100%', height: 240, borderRadius: 12 }}
                />
                <ThemedText style={{ fontSize: 12, color: hexToRgba(colors.text, 0.5) }}>
                  {recordedUri
                    ? 'New recording — tap Continue to save it.'
                    : `Saved walkthrough${existingDuration ? ` · ${fmt(existingDuration)}` : ''}`}
                </ThemedText>
                <Button type="shade" onPress={openRecorder} disabled={uploading}>
                  <View className="flex-row items-center justify-center gap-2">
                    <RotateCcw color={colors.text} size={18} />
                    <ThemedText content="shade">Record a new video</ThemedText>
                  </View>
                </Button>
              </View>
            ) : (
              <View style={{ gap: 14, alignItems: 'center', paddingVertical: 18 }}>
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 16,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: hexToRgba(colors.primary, 0.12),
                  }}
                >
                  <Video color={colors.primary} size={28} />
                </View>
                <ThemedText
                  style={{ fontSize: 13, color: hexToRgba(colors.text, 0.6), textAlign: 'center' }}
                >
                  Show guests around — exterior, living areas, and rooms. You can skip this and add it
                  later.
                </ThemedText>
                <Button type="primary" onPress={openRecorder} className="w-full">
                  <ThemedText content="primary">Record video</ThemedText>
                </Button>
              </View>
            )}
          </SectionCard>
        </View>
      </DetailsLayout>

      {/* Fullscreen recorder */}
      <Modal
        visible={recorderOpen}
        animationType="slide"
        onRequestClose={() => setRecorderOpen(false)}
      >
        <View style={styles.fill}>
          <StatusBar style="light" />
          <CameraView ref={cameraRef} style={styles.fill} mode="video" />

          <SafeAreaView style={styles.topBar} pointerEvents="box-none">
            <Pressable
              onPress={() => {
                if (isRecording) stopRecording();
                setRecorderOpen(false);
              }}
              style={styles.iconBtn}
            >
              <X color="#fff" size={20} />
            </Pressable>
            <View style={styles.pill}>
              <ThemedText style={{ color: '#fff', fontSize: 13, fontFamily: Fonts.semibold }}>
                {isRecording ? `● ${fmt(elapsed)}` : `Up to ${fmt(MAX_DURATION)}`}
              </ThemedText>
            </View>
            <View style={{ width: 40 }} />
          </SafeAreaView>

          <SafeAreaView style={styles.bottom} pointerEvents="box-none">
            {isRecording ? (
              <Pressable onPress={stopRecording} style={styles.recordOuter}>
                <View style={styles.stopInner} />
              </Pressable>
            ) : (
              <Pressable onPress={startRecording} style={styles.recordOuter}>
                <View style={styles.recordInner} />
              </Pressable>
            )}
          </SafeAreaView>
        </View>
      </Modal>

      {uploading && (
        <Modal visible transparent animationType="fade">
          <View style={[styles.fill, styles.center, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
            <ActivityIndicator color="#fff" />
            <ThemedText style={{ color: '#fff', marginTop: 12 }}>Uploading video…</ThemedText>
          </View>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: '#000' },
  center: { alignItems: 'center', justifyContent: 'center' },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  bottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: 32,
  },
  recordOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#FF3B30' },
  stopInner: { width: 28, height: 28, borderRadius: 6, backgroundColor: '#FF3B30' },
});

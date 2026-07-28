import React from 'react';
import { Pressable, View, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { ImagePlus, Star, X } from 'lucide-react-native';
import ThemedText from '@/components/atoms/a-themed-text';
import SectionCard from '@/components/molecules/m-section-card';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import { SURFACE } from '@/lib/constants/surface';
import { Fonts } from '@/lib/constants/theme';
import { formMutation, generateRNFile } from '@/lib/services/graphql/utils/fetch';
import {
  HostingImageVariant,
  useDeleteHostingImageMutation,
  useSetHostingCoverMutation,
} from '@/lib/services/graphql/generated';
import {
  UPLOAD_HOSTING_IMAGE,
  SET_HOSTING_COVER,
} from '@/lib/services/graphql/requests/mutations/hostings';
import { toast } from '@/lib/hooks/use-toast';
import { handleError } from '@/lib/utils/error';

const MAX_POSTERS = 5;

type Poster = {
  id: string;
  caption?: string | null;
  asset: { id: string; publicUrl: string };
};

type Props = {
  hostingId: string;
  posters: Poster[];
  /** The hosting's current cover asset id, to mark which poster is the cover. */
  coverAssetId?: string | null;
  /** Called after any change so the parent can refetch the hosting. */
  onChange?: () => void;
};

const HostingPosters: React.FC<Props> = ({ hostingId, posters, coverAssetId, onChange }) => {
  const colors = useThemeColors();
  const [uploading, setUploading] = React.useState(false);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [, deletePoster] = useDeleteHostingImageMutation();
  const [, setCover] = useSetHostingCoverMutation();

  const atLimit = posters.length >= MAX_POSTERS;

  const pickAndUpload = async () => {
    if (atLimit || uploading) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.9,
    });
    if (result.canceled || !result.assets?.length) return;

    setUploading(true);
    try {
      const uri = result.assets[0].uri;
      const res = await formMutation(UPLOAD_HOSTING_IMAGE, {
        hostingId,
        variant: HostingImageVariant.Poster,
        image: generateRNFile(uri),
      });
      if (res.error) {
        handleError(res.error);
      } else {
        toast.show({ type: 'success', text2: 'Poster added' });
        onChange?.();
      }
    } catch {
      toast.show({ type: 'error', text2: 'Could not upload the poster' });
    } finally {
      setUploading(false);
    }
  };

  const remove = async (id: string) => {
    setBusyId(id);
    const res = await deletePoster({ id });
    setBusyId(null);
    if (res.error) return handleError(res.error);
    onChange?.();
  };

  const makeCover = async (assetId: string) => {
    setBusyId(assetId);
    const res = await setCover({ hostingId, assetId });
    setBusyId(null);
    if (res.error) return handleError(res.error);
    toast.show({ type: 'success', text2: 'Cover updated' });
    onChange?.();
  };

  return (
    <SectionCard
      icon={<ImagePlus size={16} color={colors.primary} />}
      title="Posters & renders"
      subtitle="Optional — proposed development / artist's impressions. Uploaded, not verified. Max 5."
    >
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 4 }}>
        {posters.map((p) => {
          const isCover = !!coverAssetId && coverAssetId === p.asset.id;
          const busy = busyId === p.asset.id || busyId === p.id;
          return (
            <View
              key={p.id}
              style={{
                width: 104,
                height: 104,
                borderRadius: 14,
                overflow: 'hidden',
                backgroundColor: hexToRgba(colors.text, 0.05),
                boxShadow: SURFACE.shadow,
              }}
            >
              <Image
                source={{ uri: p.asset.publicUrl }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
              />
              {busy && (
                <View
                  style={{
                    ...StyleSheetAbsFill,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(0,0,0,0.35)',
                  }}
                >
                  <ActivityIndicator color="#fff" />
                </View>
              )}
              {/* delete */}
              <Pressable
                onPress={() => remove(p.id)}
                hitSlop={8}
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  backgroundColor: 'rgba(0,0,0,0.55)',
                  borderRadius: 999,
                  padding: 4,
                }}
              >
                <X size={13} color="#fff" />
              </Pressable>
              {/* set cover */}
              <Pressable
                onPress={() => makeCover(p.asset.id)}
                hitSlop={8}
                style={{
                  position: 'absolute',
                  bottom: 4,
                  left: 4,
                  backgroundColor: isCover ? colors.primary : 'rgba(0,0,0,0.55)',
                  borderRadius: 999,
                  paddingHorizontal: 6,
                  paddingVertical: 3,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                <Star size={11} color={isCover ? '#050505' : '#fff'} fill={isCover ? '#050505' : 'transparent'} />
                <ThemedText
                  style={{ fontSize: 9, color: isCover ? '#050505' : '#fff', fontFamily: Fonts.medium }}
                >
                  {isCover ? 'Cover' : 'Set cover'}
                </ThemedText>
              </Pressable>
            </View>
          );
        })}

        {!atLimit && (
          <Pressable
            onPress={pickAndUpload}
            disabled={uploading}
            style={{
              width: 104,
              height: 104,
              borderRadius: 14,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              backgroundColor: hexToRgba(colors.text, 0.04),
              boxShadow: SURFACE.shadow,
            }}
          >
            {uploading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <>
                <ImagePlus size={22} color={hexToRgba(colors.text, 0.5)} />
                <ThemedText style={{ fontSize: 11, color: hexToRgba(colors.text, 0.5) }}>
                  Add poster
                </ThemedText>
              </>
            )}
          </Pressable>
        )}
      </View>
    </SectionCard>
  );
};

const StyleSheetAbsFill = {
  position: 'absolute' as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};

export default HostingPosters;

import Skeleton from '@/components/atoms/a-skeleton';
import ThemedText from '@/components/atoms/a-themed-text';
import DetailsLayout from '@/components/layouts/details';
import EmptyList from '@/components/molecules/m-empty-list';
import SavedHostingCard, {
  SavedHostingCardSkeleton,
} from '@/components/molecules/m-saved-hosting-card';
import { Fonts } from '@/lib/constants/theme';
import {
  useDeleteSavedHostingMutation,
  useSavedHostingFolderQuery,
  useSavedHostingsQuery,
} from '@/lib/services/graphql/generated';
import { cast } from '@/lib/types/utils';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Platform, Pressable, View } from 'react-native';
import { SimpleGrid } from 'react-native-super-grid';
import Button from '@/components/atoms/a-button';
import ThemedView from '@/components/atoms/a-themed-view';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, X, Trash2 } from 'lucide-react-native';
import { handleError } from '@/lib/utils/error';
import { toast } from '@/lib/hooks/use-toast';
import React from 'react';

export default function HostingFolder() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const [selectMode, setSelectMode] = React.useState(false);
  const [selected, setSelected] = React.useState<string[]>([]);

  const [{ data, fetching }] = useSavedHostingFolderQuery({
    variables: { savedHostingFolderId: cast(id) },
  });
  const [{ fetching: savedFetching, data: savedData }, refetchSaved] = useSavedHostingsQuery({
    variables: {
      filters: {
        folderId: cast(id),
      },
    },
  });
  const [, deleteSavedHosting] = useDeleteSavedHostingMutation();

  const toggleSelectMode = () => {
    setSelectMode((c) => !c);
    setSelected([]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const handleSelect = (savedId: string) => {
    setSelected((c) => {
      const newVal = new Set(c);
      newVal.add(savedId);
      return Array.from(newVal);
    });
  };

  const handleDeSelect = (savedId: string) => {
    setSelected((c) => {
      const newVal = new Set(c);
      newVal.delete(savedId);
      return Array.from(newVal);
    });
  };

  const handleRemoveFromFolder = async () => {
    if (selected.length === 0) return;

    const promises = selected.map((savedId) => {
      const hosting = savedData?.savedHostings?.find((h) => h.id === savedId);
      return deleteSavedHosting({ hostingId: hosting?.hosting.id ?? '' });
    });

    const results = await Promise.all(promises);
    const hasError = results.some((r) => r.error);

    if (hasError) {
      toast.show({ type: 'error', text1: 'Error', text2: 'Some items could not be removed' });
    } else {
      toast.show({
        type: 'success',
        text1: 'Success',
        text2: `${selected.length} item(s) removed from folder`,
      });
      setSelected([]);
      setSelectMode(false);
      refetchSaved({ requestPolicy: 'network-only' });
    }
  };

  const hostings = savedData?.savedHostings ?? [];

  return (
    <>
      <DetailsLayout title={data?.savedHostingFolder.folderName} withProfile>
        <View style={{ marginTop: 24, gap: 32 }}>
          {(fetching || savedFetching) && hostings.length === 0 && (
            <View style={{ gap: 12 }}>
              <View style={{ paddingHorizontal: 4 }}>
                <Skeleton
                  style={{
                    width: '100%',
                    height: 22,
                    borderRadius: 12,
                    maxWidth: 180,
                  }}
                />
              </View>
              <SimpleGrid
                listKey={undefined}
                itemDimension={160}
                data={Array.from({ length: 4 }).map((_, index) => index + 1)}
                renderItem={() => <SavedHostingCardSkeleton />}
              />
            </View>
          )}

          {!savedFetching && hostings.length === 0 && (
            <EmptyList message="No listings in this folder" />
          )}

          {hostings.length > 0 && (
            <View style={{ gap: 12 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: 4,
                }}
              >
                <ThemedText style={{ fontFamily: Fonts.semibold, fontSize: 16 }}>
                  {data?.savedHostingFolder.folderName}
                </ThemedText>
                <ThemedText
                  style={{
                    fontFamily: Fonts.medium,
                    fontSize: 13,
                    color: hexToRgba(colors.text, 0.4),
                  }}
                >
                  {hostings.length} {hostings.length === 1 ? 'listing' : 'listings'}
                </ThemedText>
              </View>
              <SimpleGrid
                listKey="id"
                itemDimension={160}
                data={hostings}
                renderItem={({ item }) => (
                  <SavedHostingCard
                    hosting={item}
                    selectMode={selectMode}
                    selected={selected.includes(item.id)}
                    onSelect={handleSelect}
                    onDeSelect={handleDeSelect}
                    onSelectMode={toggleSelectMode}
                  />
                )}
              />
            </View>
          )}
        </View>
      </DetailsLayout>

      {selectMode ? (
        <ThemedView
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            paddingBottom: insets.bottom,
            paddingLeft: insets.left,
            paddingRight: insets.right,
            paddingTop: 14,
            borderTopWidth: 1,
            borderTopColor: hexToRgba(colors.error, 0.2),
            backgroundColor: colors.background,
            ...Platform.select({
              ios: {
                shadowColor: colors.error,
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.1,
                shadowRadius: 16,
              },
              android: {
                elevation: 12,
              },
            }),
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
              paddingHorizontal: 4,
            }}
          >
            <ThemedText style={{ fontFamily: Fonts.medium, fontSize: 14, color: colors.primary }}>
              {selected.length} selected
            </ThemedText>
            <Pressable
              onPress={toggleSelectMode}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
            >
              <X size={16} color={hexToRgba(colors.text, 0.6)} />
              <ThemedText
                style={{
                  fontFamily: Fonts.medium,
                  fontSize: 14,
                  color: hexToRgba(colors.text, 0.6),
                }}
              >
                Cancel
              </ThemedText>
            </Pressable>
          </View>
          <Button onPress={handleRemoveFromFolder} disabled={selected.length === 0} type="error">
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Trash2 size={16} color="#fff" />
              <ThemedText content="error" style={{ fontFamily: Fonts.semibold }}>
                Remove from Folder
              </ThemedText>
            </View>
          </Button>
        </ThemedView>
      ) : hostings.length > 0 ? (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            paddingBottom: insets.bottom,
            paddingLeft: insets.left,
            paddingRight: insets.right,
            paddingTop: 12,
          }}
        >
          <Button
            onPress={toggleSelectMode}
            variant="outline"
            type="primary"
            style={{ marginHorizontal: 4 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Check size={16} color={colors.primary} />
              <ThemedText style={{ fontFamily: Fonts.semibold, color: colors.primary }}>
                Select
              </ThemedText>
            </View>
          </Button>
        </View>
      ) : null}
    </>
  );
}

import Skeleton from '@/components/atoms/a-skeleton';
import ThemedText from '@/components/atoms/a-themed-text';
import DetailsLayout from '@/components/layouts/details';
import SavedHostingCard, {
  SavedHostingCardSkeleton,
} from '@/components/molecules/m-saved-hosting-card';
import { Fonts } from '@/lib/constants/theme';
import React from 'react';
import * as Haptics from 'expo-haptics';
import { Platform, Pressable, RefreshControl, View } from 'react-native';
import { SimpleGrid } from 'react-native-super-grid';
import Button from '@/components/atoms/a-button';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ThemedView from '@/components/atoms/a-themed-view';
import { hexToRgba } from '@/lib/utils/colors';
import { FolderPlus, Check, X } from 'lucide-react-native';
import SelectInput, { SelectOption } from '@/components/molecules/m-select-input';
import BottomSheet from '@/components/atoms/a-bottom-sheet';
import SavedHostingFolderCard from '@/components/molecules/m-saved-hosting-folder-card';
import {
  useCreateUpdateSavedHostingMutation,
  useDeleteSavedHostingMutation,
  useSavedHostingFoldersQuery,
  useSavedHostingsQuery,
} from '@/lib/services/graphql/generated';
import EmptyList from '@/components/molecules/m-empty-list';
import SavedHostingFolderModal from '@/components/organisms/o-saved-hosting-folder-modal';
import { useRouter } from 'expo-router';
import AuthGuard from '@/components/guards/auth-guard';
import { toast } from '@/lib/hooks/use-toast';

export default function GuestSaved() {
  return (
    <AuthGuard>
      <SavedContent />
    </AuthGuard>
  );
}

function SavedContent() {
  const router = useRouter();
  const colors = useThemeColors();
  const [createFolderOpen, setCreateFolderOpen] = React.useState(false);
  const [selectFolderOpen, setSelectFolderOpen] = React.useState(false);
  const [selectMode, setSelectMode] = React.useState(false);
  const [selected, setSelected] = React.useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = React.useState('');
  const insets = useSafeAreaInsets();
  const [{ fetching: folderFetching, data: folderData }, refetchFolders] =
    useSavedHostingFoldersQuery({ requestPolicy: 'cache-and-network' });
  const [{ fetching: savedFetching, data: savedData }, refetchSaved] = useSavedHostingsQuery({
    variables: {
      filters: {
        noFolder: true,
      },
    },
    requestPolicy: 'cache-and-network',
  });
  const [, deleteSavedHosting] = useDeleteSavedHostingMutation();
  const [, updateSavedHosting] = useCreateUpdateSavedHostingMutation();

  const handleRefresh = () => {
    refetchFolders({ requestPolicy: 'network-only' });
    refetchSaved({ requestPolicy: 'network-only' });
  };

  const toggleSelectMode = () => {
    setSelectMode((c) => !c);
    setSelected([]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const handleSelect = (id: string) => {
    setSelected((c) => {
      const newVal = new Set(c);
      newVal.add(id);
      return Array.from(newVal);
    });
  };

  const handleDeSelect = (id: string) => {
    setSelected((c) => {
      const newVal = new Set(c);
      newVal.delete(id);
      return Array.from(newVal);
    });
  };

  const handleSelectAll = () => {
    const allIds = (savedData?.savedHostings ?? []).map((h) => h.id);
    setSelected(allIds);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleCreate = () => {
    refetchFolders({ requestPolicy: 'network-only' });
    setCreateFolderOpen(false);
  };

  const handleOrganize = async () => {
    if (!selectedFolder || selected.length === 0) return;

    const promises = selected.map((savedId) => {
      const hosting = savedData?.savedHostings?.find((h) => h.id === savedId);
      return updateSavedHosting({
        input: {
          id: savedId,
          hostingId: hosting?.hosting.id ?? '',
          folderId: selectedFolder,
        },
      });
    });

    const results = await Promise.all(promises);
    const hasError = results.some((r) => r.error);

    if (hasError) {
      toast.show({ type: 'error', text1: 'Error', text2: 'Some items could not be moved' });
    } else {
      toast.show({ type: 'success', text1: 'Success', text2: `${selected.length} item(s) organized` });
      setSelected([]);
      setSelectMode(false);
      setSelectFolderOpen(false);
      setSelectedFolder('');
      refetchSaved({ requestPolicy: 'network-only' });
      refetchFolders({ requestPolicy: 'network-only' });
    }
  };

  const handleDelete = async () => {
    if (selected.length === 0) return;

    const promises = selected.map((savedId) => {
      const hosting = savedData?.savedHostings?.find((h) => h.id === savedId);
      return deleteSavedHosting({ hostingId: hosting?.hosting.id ?? '' });
    });

    const results = await Promise.all(promises);
    const hasError = results.some((r) => r.error);

    if (hasError) {
      toast.show({ type: 'error', text1: 'Error', text2: 'Some items could not be deleted' });
    } else {
      toast.show({ type: 'success', text1: 'Success', text2: `${selected.length} item(s) removed` });
      setSelected([]);
      setSelectMode(false);
      refetchSaved({ requestPolicy: 'network-only' });
    }
  };

  const folderOptions = (folderData?.savedHostingFolders ?? []).map((f) => ({
    label: f.folderName,
    value: f.id,
  }));

  const hasData =
    (folderData?.savedHostingFolders?.length ?? 0) > 0 ||
    (savedData?.savedHostings?.length ?? 0) > 0;

  return (
    <>
      <DetailsLayout
        title="Saved Listings"
        withProfile
        refreshControl={
          <RefreshControl refreshing={folderFetching || savedFetching} onRefresh={handleRefresh} />
        }
      >
        <View className="mt-6 gap-8">
          {(folderFetching || savedFetching) && (
            <View className="gap-3">
              <View className="px-1">
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

          {!folderFetching && !savedFetching && !hasData && (
            <EmptyList
              message="No saved listings yet"
              buttonTitle="Explore Homes"
              onButtonPress={() => router.replace('/guest/home')}
            />
          )}

          {folderData?.savedHostingFolders && folderData.savedHostingFolders.length > 0 && (
            <View className="gap-3">
              <View className="flex-row items-center justify-between px-1">
                <ThemedText style={{ fontFamily: Fonts.semibold, fontSize: 16 }}>
                  Collections
                </ThemedText>
                <ThemedText
                  style={{
                    fontFamily: Fonts.medium,
                    fontSize: 13,
                    color: hexToRgba(colors.text, 0.4),
                  }}
                >
                  {folderData.savedHostingFolders.length}
                </ThemedText>
              </View>
              <SimpleGrid
                listKey="folders"
                itemDimension={160}
                data={folderData.savedHostingFolders}
                renderItem={({ item }) => <SavedHostingFolderCard folder={item} />}
              />
            </View>
          )}

          {savedData?.savedHostings && savedData.savedHostings.length > 0 && (
            <View className="gap-3">
              <View className="flex-row items-center justify-between px-1">
                <ThemedText style={{ fontFamily: Fonts.semibold, fontSize: 16 }}>
                  Unsorted
                </ThemedText>
                <ThemedText
                  style={{
                    fontFamily: Fonts.medium,
                    fontSize: 13,
                    color: hexToRgba(colors.text, 0.4),
                  }}
                >
                  {savedData.savedHostings.length}
                </ThemedText>
              </View>
              <SimpleGrid
                listKey="saved"
                itemDimension={160}
                data={savedData.savedHostings}
                renderItem={({ item }) => (
                  <SavedHostingCard
                    selected={selected.includes(item.id)}
                    onSelect={handleSelect}
                    onDeSelect={handleDeSelect}
                    onSelectMode={toggleSelectMode}
                    selectMode={selectMode}
                    hosting={item}
                  />
                )}
              />
            </View>
          )}
        </View>
        <SavedHostingFolderModal
          open={createFolderOpen}
          onClose={() => setCreateFolderOpen(false)}
          onCreate={handleCreate}
        />
        <BottomSheet isVisible={selectFolderOpen} onClose={() => setSelectFolderOpen(false)}>
          <View style={{ minHeight: 280 }}>
            <View style={{ gap: 20 }}>
              <View>
                <ThemedText style={{ fontFamily: Fonts.semibold, fontSize: 18 }}>
                  Move to Folder
                </ThemedText>
                <ThemedText
                  style={{
                    fontFamily: Fonts.regular,
                    fontSize: 14,
                    color: hexToRgba(colors.text, 0.5),
                    marginTop: 4,
                  }}
                >
                  {selected.length} item(s) selected
                </ThemedText>
              </View>
              <SelectInput
                focused
                label="Choose Folder"
                placeholder="Select a folder"
                value={selectedFolder}
                onSelect={(v) => setSelectedFolder(v.value)}
                renderItem={SelectOption}
                options={folderOptions}
              />
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 12,
                marginTop: 24,
                paddingHorizontal: 4,
              }}
            >
              <Button onPress={() => setSelectFolderOpen(false)} variant="text">
                <ThemedText style={{ color: hexToRgba(colors.text, 0.6) }}>Cancel</ThemedText>
              </Button>
              <Button
                onPress={handleOrganize}
                disabled={!selectedFolder}
                type="primary"
                style={{ paddingHorizontal: 24 }}
              >
                <ThemedText content="primary" style={{ fontFamily: Fonts.semibold }}>
                  Move
                </ThemedText>
              </Button>
            </View>
          </View>
        </BottomSheet>
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
            borderTopColor: hexToRgba(colors.primary, 0.15),
            backgroundColor: colors.background,
            ...Platform.select({
              ios: {
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.12,
                shadowRadius: 16,
              },
              android: {
                elevation: 12,
                shadowColor: hexToRgba(colors.primary, 0.2),
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
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <Pressable onPress={handleSelectAll}>
                <ThemedText
                  style={{ fontFamily: Fonts.medium, fontSize: 14, color: colors.primary }}
                >
                  Select All
                </ThemedText>
              </Pressable>
              <Pressable onPress={toggleSelectMode}>
                <X size={18} color={hexToRgba(colors.text, 0.6)} />
              </Pressable>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button
              onPress={() => setSelectFolderOpen(true)}
              disabled={selected.length === 0}
              type="primary"
              style={{ flex: 1 }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <FolderPlus size={16} color={colors['primary-content']} />
                <ThemedText content="primary" style={{ fontFamily: Fonts.semibold }}>
                  Organize
                </ThemedText>
              </View>
            </Button>
            <Button
              onPress={handleDelete}
              disabled={selected.length === 0}
              type="error"
              style={{ flex: 1 }}
            >
              <ThemedText content="error" style={{ fontFamily: Fonts.semibold }}>
                Delete
              </ThemedText>
            </Button>
          </View>
        </ThemedView>
      ) : (
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
          <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 4 }}>
            <Button
              onPress={toggleSelectMode}
              disabled={!hasData}
              variant="outline"
              type="primary"
              style={{ flex: 1 }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Check size={16} color={colors.primary} />
                <ThemedText style={{ fontFamily: Fonts.semibold, color: colors.primary }}>
                  Select
                </ThemedText>
              </View>
            </Button>
            <Button
              onPress={() => setCreateFolderOpen(true)}
              type="primary"
              style={{ flex: 1 }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <FolderPlus size={16} color={colors['primary-content']} />
                <ThemedText content="primary" style={{ fontFamily: Fonts.semibold }}>
                  New Folder
                </ThemedText>
              </View>
            </Button>
          </View>
        </View>
      )}
    </>
  );
}


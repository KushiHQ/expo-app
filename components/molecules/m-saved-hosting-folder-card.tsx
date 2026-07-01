import moment from 'moment';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import ThemedView from '../atoms/a-themed-view';
import { hexToRgba } from '@/lib/utils/colors';
import { Alert, Pressable, View } from 'react-native';
import { SURFACE } from '@/lib/constants/surface';
import { HugeiconsFolder03 } from '../icons/i-files';
import ThemedText from '../atoms/a-themed-text';
import { Fonts } from '@/lib/constants/theme';
import {
  SavedHostingFolder,
  useDeleteSavedHostingFolderMutation,
} from '@/lib/services/graphql/generated';
import React from 'react';
import * as Haptics from 'expo-haptics';
import { useRouter } from '@/lib/hooks/use-router';
import { toast } from '@/lib/hooks/use-toast';
import { Trash2 } from 'lucide-react-native';

type Props = {
  folder: SavedHostingFolder;
  onDelete?: () => void;
};

const SavedHostingFolderCard: React.FC<Props> = ({ folder, onDelete }) => {
  const router = useRouter();
  const colors = useThemeColors();
  const [, deleteFolder] = useDeleteSavedHostingFolderMutation();

  const handleDelete = async () => {
    const result = await deleteFolder({ folderId: folder.id });
    if (result.error) {
      toast.show({ type: 'error', text1: 'Error', text2: 'Failed to delete folder' });
    } else {
      toast.show({
        type: 'success',
        text1: 'Folder deleted',
        text2: 'Saved homes moved back to Unsorted',
      });
      onDelete?.();
    }
  };

  const confirmDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Delete Folder',
      `Delete "${folder.folderName}"? Its saved homes will move back to Unsorted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: handleDelete },
      ],
    );
  };

  // "few" fix: a brand-new folder reads "a few seconds ago" via moment.fromNow(),
  // which is long and overflowed the row — show a short "Just now" for the first
  // minute, then the relative time.
  const lastUpdatedMoment = moment(folder.lastUpdated);
  const relativeTime =
    moment().diff(lastUpdatedMoment, 'seconds') < 60 ? 'Just now' : lastUpdatedMoment.fromNow();

  return (
    <Pressable
      onPress={() => router.push(`/hostings/folders/${folder.id}`)}
      onLongPress={confirmDelete}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
    >
      <ThemedView
        style={{
          gap: 16,
          borderRadius: 20,
          padding: 18,
          backgroundColor: hexToRgba(colors.text, 0.05),
          boxShadow: SURFACE.shadow,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              backgroundColor: hexToRgba(colors.primary, 0.1),
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <HugeiconsFolder03 color={colors.primary} size={22} />
          </View>
          <Pressable
            onPress={confirmDelete}
            hitSlop={10}
            style={{ marginLeft: 'auto', padding: 4 }}
            accessibilityLabel="Delete folder"
          >
            <Trash2 color={hexToRgba(colors.text, 0.45)} size={18} />
          </Pressable>
        </View>
        <View style={{ gap: 6 }}>
          <ThemedText
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{ fontFamily: Fonts.semibold, fontSize: 16 }}
          >
            {folder.folderName}
          </ThemedText>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
            }}
          >
            <ThemedText
              numberOfLines={1}
              style={{
                fontSize: 12,
                fontFamily: Fonts.regular,
                color: hexToRgba(colors.text, 0.45),
                flexShrink: 0,
              }}
            >
              {folder.itemCount} {folder.itemCount === 1 ? 'listing' : 'listings'}
            </ThemedText>
            <ThemedText
              numberOfLines={1}
              style={{
                fontSize: 12,
                fontFamily: Fonts.regular,
                color: hexToRgba(colors.text, 0.35),
                flexShrink: 1,
                textAlign: 'right',
              }}
            >
              {relativeTime}
            </ThemedText>
          </View>
        </View>
      </ThemedView>
    </Pressable>
  );
};

export default SavedHostingFolderCard;

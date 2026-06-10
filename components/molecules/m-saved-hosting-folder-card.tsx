import moment from 'moment';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import ThemedView from '../atoms/a-themed-view';
import { hexToRgba } from '@/lib/utils/colors';
import { Alert, Platform, Pressable, View } from 'react-native';
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

  const handleLongPress = () => {
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

  return (
    <Pressable
      onPress={() => router.push(`/hostings/folders/${folder.id}`)}
      onLongPress={handleLongPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
    >
      <ThemedView
        style={{
          gap: 16,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: hexToRgba(colors.primary, 0.12),
          padding: 18,
          backgroundColor: colors['surface-01'],
          ...Platform.select({
            ios: {
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
            },
            android: {
              elevation: 6,
              shadowColor: hexToRgba(colors.primary, 0.15),
            },
          }),
        }}
      >
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
        <View style={{ gap: 6 }}>
          <ThemedText
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{ fontFamily: Fonts.semibold, fontSize: 16 }}
          >
            {folder.folderName}
          </ThemedText>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <ThemedText
              style={{
                fontSize: 12,
                fontFamily: Fonts.regular,
                color: hexToRgba(colors.text, 0.45),
              }}
            >
              {folder.itemCount} {folder.itemCount === 1 ? 'listing' : 'listings'}
            </ThemedText>
            <ThemedText
              style={{
                fontSize: 12,
                fontFamily: Fonts.regular,
                color: hexToRgba(colors.text, 0.35),
              }}
            >
              {moment(folder.lastUpdated).fromNow()}
            </ThemedText>
          </View>
        </View>
      </ThemedView>
    </Pressable>
  );
};

export default SavedHostingFolderCard;

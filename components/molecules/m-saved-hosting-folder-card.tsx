import moment from 'moment';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import ThemedView from '../atoms/a-themed-view';
import { hexToRgba } from '@/lib/utils/colors';
import { Platform, Pressable, View } from 'react-native';
import { HugeiconsFolder03 } from '../icons/i-files';
import ThemedText from '../atoms/a-themed-text';
import { Fonts } from '@/lib/constants/theme';
import { SavedHostingFolder } from '@/lib/services/graphql/generated';
import React from 'react';
import { useRouter } from 'expo-router';

type Props = {
  folder: SavedHostingFolder;
};

const SavedHostingFolderCard: React.FC<Props> = ({ folder }) => {
  const router = useRouter();
  const colors = useThemeColors();

  return (
    <Pressable onPress={() => router.push(`/hostings/folders/${folder.id}`)}>
      <ThemedView
        className="gap-5 rounded-2xl border p-4"
        style={{
          borderColor: hexToRgba(colors.text, 0.1),
          ...Platform.select({
            ios: {
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
            },
            android: {
              elevation: 10,
              shadowColor: hexToRgba(colors.text, 0.3),
            },
          }),
        }}
      >
        <View>
          <HugeiconsFolder03 color={colors.text} size={32} />
        </View>
        <View className="gap-2">
          <ThemedText
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{ fontFamily: Fonts.medium, fontSize: 18 }}
          >
            {folder.folderName}
          </ThemedText>
          <View className="flex-row items-center justify-between">
            <ThemedText
              style={{
                fontSize: 12,
                color: hexToRgba(colors.text, 0.6),
              }}
            >
              {folder.itemCount} items
            </ThemedText>
            <ThemedText
              style={{
                fontSize: 12,
                color: hexToRgba(colors.text, 0.6),
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

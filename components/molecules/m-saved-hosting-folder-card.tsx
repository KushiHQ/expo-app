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
import { useRouter } from '@/lib/hooks/use-router';

type Props = {
  folder: SavedHostingFolder;
};

const SavedHostingFolderCard: React.FC<Props> = ({ folder }) => {
  const router = useRouter();
  const colors = useThemeColors();

  return (
    <Pressable
      onPress={() => router.push(`/hostings/folders/${folder.id}`)}
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

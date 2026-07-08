import React from 'react';
import { Pressable, View } from 'react-native';
import { Copy, Trash2 } from 'lucide-react-native';

import BottomSheet from '../atoms/a-bottom-sheet';
import ThemedText from '../atoms/a-themed-text';
import { Fonts } from '@/lib/constants/theme';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';

type Props = {
  visible: boolean;
  onClose: () => void;
  spaceName?: string;
  /** Copy is only offered for a saved space on a unit that belongs to a parent. */
  canCopy?: boolean;
  onCopy?: () => void;
  onDelete: () => void;
};

/**
 * Action list for a single space (room) in the hosting form — replaces the
 * inline primary buttons with a compact sheet. Copy appears only for units of
 * a parent property (copy a space to a sibling unit); delete is always here.
 */
const RoomActionsSheet: React.FC<Props> = ({
  visible,
  onClose,
  spaceName,
  canCopy,
  onCopy,
  onDelete,
}) => {
  const colors = useThemeColors();

  const rowStyle = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: hexToRgba(colors.text, 0.05),
  };

  return (
    <BottomSheet isVisible={visible} onClose={onClose}>
      <View className="gap-2 pb-2">
        {spaceName ? (
          <ThemedText
            style={{
              fontSize: 13,
              fontFamily: Fonts.medium,
              color: hexToRgba(colors.text, 0.5),
              marginBottom: 4,
            }}
          >
            {spaceName}
          </ThemedText>
        ) : null}

        {canCopy && onCopy ? (
          <Pressable style={rowStyle} onPress={onCopy}>
            <Copy size={18} color={colors.text} />
            <ThemedText style={{ fontSize: 15, fontFamily: Fonts.medium }}>
              Copy to another unit
            </ThemedText>
          </Pressable>
        ) : null}

        <Pressable
          style={{ ...rowStyle, backgroundColor: hexToRgba(colors.error, 0.1) }}
          onPress={onDelete}
        >
          <Trash2 size={18} color={colors.error} />
          <ThemedText style={{ fontSize: 15, fontFamily: Fonts.medium, color: colors.error }}>
            Delete space
          </ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
};

export default RoomActionsSheet;

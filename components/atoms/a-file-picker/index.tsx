import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import * as DocumentPicker from 'expo-document-picker';
import * as Haptics from 'expo-haptics';
import { FileText, Upload, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import ThemedText from '@/components/atoms/a-themed-text';

export type PickedFile = {
  uri: string;
  name: string;
  /** Lowercased MIME type, e.g. `application/pdf` or `image/jpeg`. */
  type: string;
  size?: number;
};

type Props = {
  /** Stable id used to label the picker when nothing is selected. */
  label: string;
  /** Hint text shown next to the label (e.g. "PDF or image, max 10MB"). */
  hint?: string;
  /** Optional description for the file picker. */
  description?: string;
  /** When set, the picker is locked to that file and shows a "Replace" CTA. */
  value?: PickedFile | null;
  onChange: (file: PickedFile | null) => void;
  /** Picker is disabled (e.g. while a request is submitting). */
  disabled?: boolean;
  /** NativeWind className passed to the outer container. */
  className?: string;
};

const ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/heic',
  'image/webp',
];

function formatBytes(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const FilePicker: React.FC<Props> = ({ label, hint, description, value, onChange, disabled, className }) => {
  const colors = useThemeColors();
  const [picking, setPicking] = useState(false);

  const handlePick = async () => {
    if (disabled || picking) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPicking(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ACCEPTED_MIME_TYPES,
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const asset = result.assets?.[0];
      if (!asset) return;

      onChange({
        uri: asset.uri,
        name: asset.name ?? 'document',
        type: (asset.mimeType ?? 'application/octet-stream').toLowerCase(),
        size: asset.size,
      });
    } finally {
      setPicking(false);
    }
  };

  const handleClear = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(null);
  };

  return (
    <View
      className={className}
      style={{
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: value ? colors.primary : hexToRgba(colors.text, 0.1),
        backgroundColor: value ? hexToRgba(colors.primary, 0.08) : hexToRgba(colors.text, 0.04),
      }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <ThemedText
            style={{
              fontFamily: 'Inter_600',
              fontSize: 14,
              color: colors.text,
            }}
          >
            {label}
          </ThemedText>
          {description ? (
            <ThemedText
              style={{
                fontSize: 12,
                color: hexToRgba(colors.text, 0.7),
                marginTop: 4,
                marginBottom: 2,
              }}
            >
              {description}
            </ThemedText>
          ) : null}
          {hint ? (
            <ThemedText
              style={{
                fontSize: 11,
                color: hexToRgba(colors.text, 0.6),
                marginTop: 2,
              }}
            >
              {hint}
            </ThemedText>
          ) : null}
        </View>
        {value ? (
          <Pressable
            onPress={handleClear}
            hitSlop={10}
            accessibilityLabel="Remove file"
            className="h-9 w-9 items-center justify-center rounded-full"
            style={{ backgroundColor: hexToRgba(colors.text, 0.08) }}
          >
            <X size={16} color={colors.text} />
          </Pressable>
        ) : null}
      </View>

      {value ? (
        <View className="mt-3 flex-row items-center gap-2">
          <FileText size={18} color={colors.primary} />
          <View className="flex-1">
            <ThemedText
              numberOfLines={1}
              style={{ fontSize: 13, color: colors.text, fontFamily: 'Inter_500' }}
            >
              {value.name}
            </ThemedText>
            <ThemedText
              style={{ fontSize: 11, color: hexToRgba(colors.text, 0.6) }}
            >
              {value.type}
              {value.size ? ` · ${formatBytes(value.size)}` : ''}
            </ThemedText>
          </View>
          <Pressable
            onPress={handlePick}
            disabled={disabled || picking}
            hitSlop={8}
            className="rounded-full px-3 py-1.5"
            style={{ backgroundColor: hexToRgba(colors.primary, 0.15) }}
          >
            <ThemedText
              style={{ fontSize: 12, color: colors.primary, fontFamily: 'Inter_600' }}
            >
              Replace
            </ThemedText>
          </Pressable>
        </View>
      ) : (
        <Pressable
          onPress={handlePick}
          disabled={disabled || picking}
          className="mt-3 flex-row items-center justify-center gap-2 rounded-xl py-2.5"
          style={{
            backgroundColor: hexToRgba(colors.primary, 0.12),
            opacity: disabled || picking ? 0.6 : 1,
          }}
        >
          <Upload size={16} color={colors.primary} />
          <ThemedText
            style={{ fontSize: 13, color: colors.primary, fontFamily: 'Inter_600' }}
          >
            {picking ? 'Opening…' : 'Choose file'}
          </ThemedText>
        </Pressable>
      )}
    </View>
  );
};

export default FilePicker;

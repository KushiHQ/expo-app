import { DocumentPickerAsset } from 'expo-document-picker';
import { Download, X } from 'lucide-react-native';
import React from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import {
  FluentDocumentImage16Regular,
  FluentDocumentPdf32Filled,
  FluentDocumentSquare20Filled,
  FluentDocumentText28Filled,
  IconParkOutlineVideoTwo,
} from '../icons/i-document';
import ThemedText from '../atoms/a-themed-text';
import { hexToRgba } from '@/lib/utils/colors';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { ChatMessagesQuery } from '@/lib/services/graphql/generated';
import { useDownlods } from '@/lib/hooks/downloads';
import { openLocalFile } from '@/lib/utils/file';

type LocalDoc = {
  type: 'local';
  asset: DocumentPickerAsset;
};

type RemoteDoc = {
  type: 'remote';
  asset: ChatMessagesQuery['chatMessages'][number]['assets'][number];
};

type Props = {
  deletable?: boolean;
  downloadable?: boolean;
  openable?: boolean;
  document: LocalDoc | RemoteDoc;
  index: number;
  onDelete?: (index: number) => void;
};

const ListDocument: React.FC<Props> = ({
  document,
  downloadable,
  openable,
  index,
  deletable,
  onDelete,
}) => {
  const colors = useThemeColors();
  const { downloading, download, isDownloaded, getLocalUri } = useDownlods();
  const [downloaded, setDownloaded] = React.useState(
    isDownloaded(document.type === 'local' ? document.asset.uri : document.asset.asset.publicUrl),
  );

  const contentType =
    document.type === 'local' ? document.asset.mimeType : document.asset.asset.contentType;

  const Icon =
    contentType === 'application/pdf'
      ? FluentDocumentPdf32Filled
      : contentType?.includes('text')
        ? FluentDocumentText28Filled
        : contentType?.includes('image')
          ? FluentDocumentImage16Regular
          : contentType?.includes('video')
            ? IconParkOutlineVideoTwo
            : FluentDocumentSquare20Filled;

  const fileName =
    document.type === 'local' ? document.asset.name : document.asset.asset.originalFilename;

  const fileUrl = document.type === 'local' ? document.asset.uri : document.asset.asset.publicUrl;

  const handleDownload = async () => {
    const locaUri = await download(fileUrl, fileUrl.split('/').pop() ?? '');
    setDownloaded(isDownloaded(fileUrl));
    return locaUri;
  };

  const handleOpen = async () => {
    if (!openable) return;

    let localUri = getLocalUri(fileUrl);
    if (!localUri) {
      localUri = await handleDownload();
    }

    if (!localUri) return;
    openLocalFile(localUri);
  };

  return (
    <Pressable
      onPress={handleOpen}
      className="relative h-16 w-[150px] rounded-2xl p-2"
      style={{ borderColor: hexToRgba(colors.text, 0.2), borderWidth: 1 }}
    >
      <View className="relative flex-row items-center gap-2">
        <Icon size={30} color={colors.primary} />
        <ThemedText numberOfLines={2} style={{ fontSize: 12, maxWidth: 100 }} ellipsizeMode="tail">
          {fileName}
        </ThemedText>
        {downloadable && !downloaded && (
          <Pressable
            onPress={handleDownload}
            disabled={downloading}
            className="absolute right-0 rounded-lg p-1"
            style={{ backgroundColor: colors.text }}
          >
            {downloading ? (
              <ActivityIndicator size={26} color={colors.background} />
            ) : (
              <Download color={colors.background} size={26} />
            )}
          </Pressable>
        )}
      </View>
      {deletable && (
        <Pressable
          onPress={() => onDelete?.(index)}
          className="absolute right-0 top-0 h-6 w-6 items-center justify-center rounded bg-white"
        >
          <X color="#000000" size={12} />
        </Pressable>
      )}
    </Pressable>
  );
};

export default ListDocument;

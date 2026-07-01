import { PROPERTY_BLURHASH } from '@/lib/constants/images';
import { useUploadStore } from '@/lib/stores/uploads';
import { Image } from 'expo-image';
import { Check, RotateCcw, Star, X } from 'lucide-react-native';
import React from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

type Props = {
  src: string;
  /** Optional resized/proxied uri to DISPLAY (keeps `src` as the identity used for
   *  upload-status, cover-matching and delete). Falls back to `src`. */
  displayUri?: string;
  roomIndex: number;
  imageIndex: number;
  onDeleteRoomImage?: (roomIndex: number, imageIndex: number) => void;
  /** Whether this image is the hosting's current cover. */
  isCover?: boolean;
  /** Show the "set as cover" control (only for saved/uploaded images). */
  canSetCover?: boolean;
  onSetCover?: (roomIndex: number, imageIndex: number) => void;
  /** Tapping the photo opens it in the fullscreen swipe/edit gallery. */
  onPress?: (roomIndex: number, imageIndex: number) => void;
  /** Multi-select (move/delete) mode — tapping toggles selection instead of
   *  opening, and the per-photo controls are hidden. */
  selectMode?: boolean;
  selected?: boolean;
  onToggleSelect?: (roomIndex: number, imageIndex: number) => void;
};

const HostingRoomImage: React.FC<Props> = ({
  src,
  displayUri,
  roomIndex,
  imageIndex,
  onDeleteRoomImage,
  isCover,
  canSetCover,
  onSetCover,
  onPress,
  selectMode,
  selected,
  onToggleSelect,
}) => {
  // Background-upload status for this thumbnail (keyed by its local file:// uri);
  // clears automatically once the url swaps to the uploaded one.
  const uploadStatus = useUploadStore((s) => s.tasks[src]?.status);
  const retryUpload = useUploadStore((s) => s.retry);

  return (
    <View
      style={{
        position: 'relative',
        width: 88,
        height: 88,
        borderRadius: 12,
        boxShadow: selected
          ? '0px 0px 0px 2.5px rgba(245,158,11,0.95)'
          : isCover
            ? '0px 0px 0px 2px rgba(255,165,0,0.85), 0px 8px 22px -10px rgba(255,165,0,0.40)'
            : undefined,
      }}
    >
      <Pressable
        onPress={() =>
          selectMode
            ? onToggleSelect?.(roomIndex, imageIndex)
            : onPress?.(roomIndex, imageIndex)
        }
        style={{ height: '100%', width: '100%' }}
      >
        <Image
          source={{ uri: displayUri ?? src }}
          recyclingKey={src}
          style={{ height: '100%', width: '100%', borderRadius: 12 }}
          contentFit="cover"
          transition={400}
          placeholder={{ blurhash: PROPERTY_BLURHASH }}
          placeholderContentFit="cover"
          cachePolicy="memory-disk"
          priority="high"
        />
      </Pressable>

      {/* Upload status overlay: spinner while uploading, tap-to-retry on failure. */}
      {uploadStatus === 'uploading' ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 12,
            backgroundColor: 'rgba(0,0,0,0.45)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ActivityIndicator color="#fff" size="small" />
        </View>
      ) : uploadStatus === 'error' ? (
        <Pressable
          onPress={() => retryUpload(src)}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 12,
            backgroundColor: 'rgba(180,30,30,0.5)',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
          }}
        >
          <RotateCcw color="#fff" size={18} strokeWidth={2.5} />
        </Pressable>
      ) : null}

      {/* Select-mode check (top-right); replaces the per-photo controls. */}
      {selectMode && (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 5,
            right: 5,
            width: 22,
            height: 22,
            borderRadius: 11,
            backgroundColor: selected ? '#F59E0B' : 'rgba(0,0,0,0.5)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {selected && <Check color="#0A0A0A" size={13} strokeWidth={3} />}
        </View>
      )}

      {/* Cover badge / set-as-cover control (top-left) */}
      {!selectMode && isCover ? (
        <View
          style={{
            position: 'absolute',
            top: 4,
            left: 4,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 3,
            paddingHorizontal: 6,
            height: 20,
            borderRadius: 10,
            backgroundColor: '#FFA500',
          }}
        >
          <Star color="#000000" size={9} strokeWidth={2.5} fill="#000000" />
        </View>
      ) : !selectMode && canSetCover ? (
        <Pressable
          onPress={() => onSetCover?.(roomIndex, imageIndex)}
          hitSlop={6}
          style={{
            position: 'absolute',
            top: 4,
            left: 4,
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: 'rgba(0,0,0,0.72)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Star color="#FFFFFF" size={11} strokeWidth={2} />
        </Pressable>
      ) : null}

      {!selectMode && (
        <Pressable
          onPress={() => onDeleteRoomImage?.(roomIndex, imageIndex)}
          style={{
            position: 'absolute',
            top: 4,
            right: 4,
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: 'rgba(0,0,0,0.72)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X color="#FFFFFF" size={10} strokeWidth={2.5} />
        </Pressable>
      )}
    </View>
  );
};

export default HostingRoomImage;

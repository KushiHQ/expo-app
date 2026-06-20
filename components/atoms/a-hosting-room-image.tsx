import { PROPERTY_BLURHASH } from '@/lib/constants/images';
import { Image } from 'expo-image';
import { Star, X } from 'lucide-react-native';
import React from 'react';
import { Pressable, View } from 'react-native';

type Props = {
  src: string;
  roomIndex: number;
  imageIndex: number;
  onDeleteRoomImage?: (roomIndex: number, imageIndex: number) => void;
  /** Whether this image is the hosting's current cover. */
  isCover?: boolean;
  /** Show the "set as cover" control (only for saved/uploaded images). */
  canSetCover?: boolean;
  onSetCover?: (roomIndex: number, imageIndex: number) => void;
};

const HostingRoomImage: React.FC<Props> = ({
  src,
  roomIndex,
  imageIndex,
  onDeleteRoomImage,
  isCover,
  canSetCover,
  onSetCover,
}) => {
  return (
    <View
      style={{
        position: 'relative',
        width: 88,
        height: 88,
        borderRadius: 12,
        borderWidth: isCover ? 2 : 0,
        borderColor: isCover ? '#FFA500' : 'transparent',
      }}
    >
      <Image
        source={{ uri: src }}
        style={{ height: '100%', width: '100%', borderRadius: isCover ? 10 : 12 }}
        contentFit="cover"
        transition={400}
        placeholder={{ blurhash: PROPERTY_BLURHASH }}
        placeholderContentFit="cover"
        cachePolicy="memory-disk"
        priority="high"
      />

      {/* Cover badge / set-as-cover control (top-left) */}
      {isCover ? (
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
      ) : canSetCover ? (
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
    </View>
  );
};

export default HostingRoomImage;

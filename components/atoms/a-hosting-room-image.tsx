import { FALLBACK_IMAGE, PROPERTY_BLURHASH } from '@/lib/constants/images';
import { useFallbackImages } from '@/lib/hooks/images';
import { Image } from 'expo-image';
import { X } from 'lucide-react-native';
import React from 'react';
import { Pressable, View } from 'react-native';

type Props = {
  src: string;
  roomIndex: number;
  imageIndex: number;
  onDeleteRoomImage?: (roomIndex: number, imageIndex: number) => void;
};

const HostingRoomImage: React.FC<Props> = ({
  src,
  roomIndex,
  imageIndex,
  onDeleteRoomImage: onDeleteRoomImage,
}) => {
  const { failedImages, handleImageError } = useFallbackImages();

  return (
    <View className="relative h-16 w-20">
      <Image
        source={{
          uri: failedImages.has(0) ? FALLBACK_IMAGE : src,
        }}
        style={{
          height: '100%',
          width: '100%',
          borderRadius: 8,
        }}
        contentFit="cover"
        transition={300}
        placeholder={{ blurhash: PROPERTY_BLURHASH }}
        placeholderContentFit="cover"
        cachePolicy="memory-disk"
        priority="high"
        onError={() => handleImageError(0)}
      />
      <Pressable
        onPress={() => onDeleteRoomImage?.(roomIndex, imageIndex)}
        className="absolute right-0 top-0 h-6 w-6 items-center justify-center rounded bg-white"
      >
        <X color="#000000" size={12} />
      </Pressable>
    </View>
  );
};

export default HostingRoomImage;

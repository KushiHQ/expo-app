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

const HostingRoomImage: React.FC<Props> = ({ src, roomIndex, imageIndex, onDeleteRoomImage }) => {
  const { failedImages, handleImageError } = useFallbackImages();

  return (
    <View style={{ position: 'relative', width: 88, height: 88 }}>
      <Image
        source={{ uri: failedImages.has(imageIndex) ? FALLBACK_IMAGE : src }}
        style={{ height: '100%', width: '100%', borderRadius: 12 }}
        contentFit="cover"
        transition={400}
        placeholder={{ blurhash: PROPERTY_BLURHASH }}
        placeholderContentFit="cover"
        cachePolicy="memory-disk"
        priority="high"
        onError={() => handleImageError(imageIndex)}
      />
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

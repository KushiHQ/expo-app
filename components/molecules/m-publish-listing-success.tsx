import BottomSheet from '../atoms/a-bottom-sheet';
import { Image } from 'expo-image';
import { Fonts } from '@/lib/constants/theme';
import { View } from 'react-native';
import ThemedText from '../atoms/a-themed-text';
import Button from '../atoms/a-button';
import { useRouter } from 'expo-router';

type Props = {
  show: boolean;
  onClose: () => void;
};

const PublishListingSuccess: React.FC<Props> = ({ show, onClose }) => {
  const router = useRouter();

  return (
    <BottomSheet isVisible={show} onClose={onClose}>
      <View>
        <View className="items-center">
          <View className="items-center">
            <ThemedText className="text-center" style={{ fontFamily: Fonts.medium }}>
              🎉 Your listing has been submitted for review!
            </ThemedText>
            <ThemedText className="max-w-[255px] text-center" style={{ fontSize: 14 }}>
              Our team will verify and publish it shortly. You’ll be notified.
            </ThemedText>
          </View>
          <View
            style={{
              width: 250,
              height: 250,
            }}
          >
            <Image
              style={{
                width: 250,
                height: 250,
                objectFit: 'cover',
              }}
              source={require('@/assets/images/success-check.png')}
            />
          </View>
        </View>
        <View className="gap-4">
          <Button type="primary" onPress={onClose}>
            <ThemedText content="primary">Go to Dashboard</ThemedText>
          </Button>
          <Button type="tinted" onPress={() => router.push('/host/listings')}>
            <ThemedText content="tinted">Edit Listing</ThemedText>
          </Button>
        </View>
      </View>
    </BottomSheet>
  );
};

export default PublishListingSuccess;

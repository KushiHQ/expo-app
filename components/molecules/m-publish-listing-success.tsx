import BottomSheet from '../atoms/a-bottom-sheet';
import { Image } from 'expo-image';
import { Fonts } from '@/lib/constants/theme';
import { View } from 'react-native';
import ThemedText from '../atoms/a-themed-text';
import Button from '../atoms/a-button';
import { useRouter } from '@/lib/hooks/use-router';

type Props = {
  show: boolean;
  onClose: () => void;
  hostingId?: string;
};

const PublishListingSuccess: React.FC<Props> = ({ show, onClose, hostingId }) => {
  const router = useRouter();

  const handleGetVerified = () => {
    onClose();
    if (hostingId) {
      router.push(`/hostings/form/verification/overview?id=${hostingId}`);
    }
  };

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
        <ThemedText className="mb-4 text-center" style={{ fontSize: 13, opacity: 0.6 }}>
          Verification is optional — your listing stays up whether or not it’s verified. Getting
          verified earns a trust badge that helps guests choose your property.
        </ThemedText>
        <View className="gap-4">
          {hostingId && (
            <Button type="primary" onPress={handleGetVerified}>
              <ThemedText content="primary">Get Verified</ThemedText>
            </Button>
          )}
          <Button type={hostingId ? 'tinted' : 'primary'} onPress={onClose}>
            <ThemedText content={hostingId ? 'tinted' : 'primary'}>Go to Dashboard</ThemedText>
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

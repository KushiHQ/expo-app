import FloatingLabelInput from '@/components/atoms/a-floating-label-input';
import LoadingModal from '@/components/atoms/a-loading-modal';
import LocationCard from '@/components/atoms/a-location-card';
import Skeleton from '@/components/atoms/a-skeleton';
import ThemedText from '@/components/atoms/a-themed-text';
import DetailsLayout from '@/components/layouts/details';
import HostingStepper from '@/components/molecules/m-hosting-stepper';
import SectionCard from '@/components/molecules/m-section-card';
import { Fonts } from '@/lib/constants/theme';
import { useHostingForm } from '@/lib/hooks/hosting-form';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { cast } from '@/lib/types/utils';
import { hexToRgba } from '@/lib/utils/colors';
import { handleError } from '@/lib/utils/error';
import { getAddressFromCoords, getLocationAsync } from '@/lib/utils/locations';
import * as Location from 'expo-location';
import { useLocalSearchParams } from 'expo-router';
import { useRouter } from '@/lib/hooks/use-router';
import { MapPin, Phone } from 'lucide-react-native';
import React, { useRef } from 'react';
import { TextInput, View } from 'react-native';
import { RefreshControl } from 'react-native-gesture-handler';
import { toast } from '@/lib/hooks/use-toast';
import PhoneNumberSelectInput from '@/components/organisms/o-phone-number-select-input';

export default function NewHostingStep3() {
  const router = useRouter();
  const colors = useThemeColors();
  const { id } = useLocalSearchParams();
  const landmarkRef = useRef<TextInput>(null);
  const [locationFetching, setLocationFetching] = React.useState(false);
  const [permission, requestPermission] = Location.useForegroundPermissions();
  const { input, mutate, updateInput, mutating } = useHostingForm(id);

  const loading = locationFetching || mutating;

  const fetchLocation = React.useCallback(async () => {
    setLocationFetching(true);
    try {
      const loc = await getLocationAsync();
      if (loc) {
        const addreses = await getAddressFromCoords(loc?.coords.latitude, loc?.coords.longitude);
        const address = addreses?.at(0);
        updateInput({
          latitude: loc.coords.latitude.toString(),
          longitude: loc.coords.longitude.toString(),
          state: address?.region,
          country: address?.country,
          city: address?.city,
          street: address?.street,
          postalCode: address?.postalCode,
        });
      }
    } catch (err) {
      console.error('Failed', { err });
    } finally {
      setLocationFetching(false);
    }
  }, [updateInput]);

  React.useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    } else if (!input.longitude || !input.latitude) {
      fetchLocation();
    }
  }, [permission, input.latitude, input.longitude, fetchLocation, requestPermission]);

  const handleMutate = () => {
    mutate({ input: input }).then((res) => {
      if (res.error) {
        handleError(res.error);
      }
      if (res.data?.createOrUpdateHosting) {
        router.push(`/hostings/form/step-4?id=${res.data?.createOrUpdateHosting.data?.id}`);
        toast.show({
          type: 'success',
          text1: 'Success',
          text2: res.data.createOrUpdateHosting.message,
        });
      }
    });
  };

  return (
    <>
      <DetailsLayout
        refreshControl={<RefreshControl onRefresh={fetchLocation} refreshing={locationFetching} />}
        title="Hosting"
        footer={
          <HostingStepper
            onPress={handleMutate}
            disabled={mutating || !input.contact || !input.longitude || !input.latitude}
            loading={mutating}
            step={3}
          />
        }
      >
        <View style={{ gap: 20, paddingBottom: 24 }}>
          <SectionCard
            icon={<MapPin size={16} color={colors.primary} />}
            title="Location"
            subtitle="We'll pin your property automatically — pull to refresh to retry"
          >
            {!input.longitude || !input.latitude ? (
              <Skeleton style={{ height: 220, borderRadius: 12 }} />
            ) : (
              <LocationCard
                withActions={false}
                location={{
                  longitude: Number(input.longitude),
                  latitude: Number(input.latitude),
                }}
                zoom={18}
              />
            )}
            {!input.state ? (
              <Skeleton style={{ height: 48, borderRadius: 10 }} />
            ) : (
              <View
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 10,
                  backgroundColor: hexToRgba(colors.primary, 0.06),
                  borderWidth: 1,
                  borderColor: hexToRgba(colors.primary, 0.1),
                }}
              >
                <ThemedText style={{ fontSize: 12, color: hexToRgba(colors.text, 0.55) }}>
                  {input?.street}, {input?.city} {input?.postalCode}
                </ThemedText>
                <ThemedText
                  style={{
                    fontSize: 14,
                    fontFamily: Fonts.medium,
                    marginTop: 2,
                  }}
                >
                  {input?.state}, {input?.country}
                </ThemedText>
              </View>
            )}
          </SectionCard>

          <SectionCard
            icon={<Phone size={16} color={colors.primary} />}
            title="Contact Information"
            subtitle="How guests can reach you about this property"
          >
            <View
              style={{
                borderWidth: 1,
                borderColor: hexToRgba(colors.text, 0.1),
                borderRadius: 12,
                overflow: 'hidden',
              }}
            >
              <PhoneNumberSelectInput
                defaultValue={cast(input.contact)}
                onSelect={(v) => {
                  updateInput({ contact: v.label });
                }}
              />
            </View>
            <FloatingLabelInput
              ref={landmarkRef}
              focused
              multiline
              label="Landmarks (Optional)"
              value={cast(input.landmarks)}
              onChangeText={(landmarks) => updateInput({ landmarks })}
              containerStyle={{ minHeight: 80 }}
              placeholder="Enter landmarks close to the property"
              returnKeyType="done"
            />
          </SectionCard>
        </View>
      </DetailsLayout>
      <LoadingModal visible={loading} />
    </>
  );
}

import Button from '@/components/atoms/a-button';
import FloatingLabelInput from '@/components/atoms/a-floating-label-input';
import LoadingModal from '@/components/atoms/a-loading-modal';
import ThemedText from '@/components/atoms/a-themed-text';
import DetailsLayout from '@/components/layouts/details';
import HostingStepper from '@/components/molecules/m-hosting-stepper';
import SectionCard from '@/components/molecules/m-section-card';
import TextSelectButton from '@/components/molecules/m-text-select-button';
import { useHostingForm } from '@/lib/hooks/hosting-form';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { showAmenitiesStep } from '@/lib/constants/hosting/step-rules';
import { FACILITIES_BY_VARIANT } from '@/lib/types/enums/hostings';
import { cast } from '@/lib/types/utils';
import { hexToRgba } from '@/lib/utils/colors';
import { handleError } from '@/lib/utils/error';
import { useLocalSearchParams } from 'expo-router';
import { useRouter } from '@/lib/hooks/use-router';
import { Check, Plus, Sparkles } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';
import { SimpleGrid } from 'react-native-super-grid';
import { toast } from '@/lib/hooks/use-toast';

export default function NewHostingStep4() {
  const router = useRouter();
  const colors = useThemeColors();
  const { id } = useLocalSearchParams();
  const [newFacility, setNewFacility] = React.useState<string | null>(null);
  const {
    input,
    mutate,
    updateInput,
    mutating,
    fetching: fetchingHosting,
    hosting,
  } = useHostingForm(id);

  React.useEffect(() => {
    if (hosting && !showAmenitiesStep(hosting.propertyType)) {
      router.replace(`/hostings/form/step-5?id=${hosting.id}`);
    }
  }, [hosting]);

  const facilities = React.useMemo(() => {
    const selected = input.facilities ?? [];
    const defaultFacilities = FACILITIES_BY_VARIANT.filter((v) =>
      v.hostingVariants.includes(cast(input.propertyType ?? '')),
    ).map((v) => v.facility);
    const other = selected.filter((v) => !defaultFacilities.includes(cast(v)));
    return [...defaultFacilities, ...other];
  }, [input.facilities, input.propertyType]);

  const toggleFacilitySelect = (facility: string) => {
    const list = [...(input.facilities ?? [])];
    if (list.includes(facility)) {
      updateInput({ facilities: list.filter((v) => v !== facility) });
    } else {
      updateInput({ facilities: [...list, facility] });
    }
  };

  const handleMutate = () => {
    mutate({ input: input }).then((res) => {
      if (res.error) {
        handleError(res.error);
      }
      if (res.data?.createOrUpdateHosting) {
        router.push(`/hostings/form/step-5?id=${res.data?.createOrUpdateHosting.data?.id}`);
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
        title="Hosting"
        footer={
          <HostingStepper
            onPress={handleMutate}
            disabled={mutating || !input.facilities?.length}
            loading={mutating}
            step={5}
          />
        }
      >
        <View style={{ gap: 20, paddingBottom: 24 }}>
          <SectionCard
            icon={<Sparkles size={16} color={colors.primary} />}
            title="Features & Amenities"
            subtitle="Tap to select everything available at your property"
          >
            <SimpleGrid
              listKey={undefined}
              itemDimension={180}
              data={facilities}
              spacing={0}
              renderItem={({ item }) => (
                <View style={{ marginBottom: 8, marginRight: 8 }}>
                  <TextSelectButton
                    value={item}
                    onSelect={toggleFacilitySelect}
                    selected={input.facilities?.includes(item)}
                  />
                </View>
              )}
            />
          </SectionCard>

          <SectionCard
            icon={<Plus size={16} color={colors.primary} />}
            title="Add Custom Feature"
            subtitle="Not in the list? Add your own"
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <FloatingLabelInput
                  label="Feature / Facility"
                  focused
                  value={newFacility ?? ''}
                  onChangeText={setNewFacility}
                  placeholder="e.g. Rooftop terrace"
                  returnKeyType="done"
                  onSubmitEditing={() => {
                    if (newFacility) toggleFacilitySelect(newFacility);
                    setNewFacility(null);
                  }}
                />
              </View>
              <Button
                onPress={() => {
                  if (newFacility) toggleFacilitySelect(newFacility);
                  setNewFacility(null);
                }}
                variant="outline"
                type="primary"
              >
                <Check color={colors.primary} />
              </Button>
            </View>
          </SectionCard>
        </View>
      </DetailsLayout>
      <LoadingModal visible={mutating} />
    </>
  );
}

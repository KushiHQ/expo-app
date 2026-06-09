import FloatingLabelInput from '@/components/atoms/a-floating-label-input';
import ThemedText from '@/components/atoms/a-themed-text';
import DetailsLayout from '@/components/layouts/details';
import HostingStepper from '@/components/molecules/m-hosting-stepper';
import SectionCard from '@/components/molecules/m-section-card';
import SelectInput, { SelectOption } from '@/components/molecules/m-select-input';
import { useHostingForm } from '@/lib/hooks/hosting-form';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { ListingType } from '@/lib/services/graphql/generated';
import { PROPERTY_TYPE } from '@/lib/types/enums/hostings';
import { cast } from '@/lib/types/utils';
import { handleError } from '@/lib/utils/error';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AlignLeft, Building2 } from 'lucide-react-native';
import React, { useRef } from 'react';
import { RefreshControl, TextInput, View } from 'react-native';
import { toast } from '@/lib/hooks/use-toast';

export default function NewHostingStep1() {
  const router = useRouter();
  const colors = useThemeColors();
  const { id } = useLocalSearchParams();
  const descriptionRef = useRef<TextInput>(null);
  const {
    mutate,
    mutating,
    input,
    updateInput,
    fetching,
    refetch: refetchHosting,
  } = useHostingForm(id);

  const [refreshing, setRefreshing] = React.useState(false);
  React.useEffect(() => {
    if (!fetching) setRefreshing(false);
  }, [fetching]);

  const handleMutate = () => {
    mutate({ input: input }).then((res) => {
      if (res.error) {
        handleError(res.error);
      }
      if (res.data?.createOrUpdateHosting) {
        router.replace(`/hostings/form/step-2?id=${res.data?.createOrUpdateHosting.data?.id}`);
        toast.show({
          type: 'success',
          text1: 'Success',
          text2: res.data.createOrUpdateHosting.message,
        });
      }
    });
  };

  return (
    <DetailsLayout
      title="Property Details"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            id && refetchHosting();
          }}
        />
      }
      footer={
        <HostingStepper
          loading={mutating}
          onPress={handleMutate}
          disabled={
            mutating ||
            !input?.title?.length ||
            !input.propertyType?.length ||
            !input.listingType?.length ||
            !input.description?.length
          }
          step={1}
        />
      }
    >
      <View style={{ gap: 20, paddingBottom: 24 }}>
        <SectionCard
          icon={<Building2 size={16} color={colors.primary} />}
          title="Property Identity"
          style={{ minHeight: 180 }}
          subtitle="Title, property type, and listing style"
        >
          <FloatingLabelInput
            focused
            label="Title"
            value={cast(input.title)}
            placeholder="4 Bedroom Apartment"
            onChangeText={(v) => updateInput({ title: v })}
            returnKeyType="next"
            onSubmitEditing={() => descriptionRef.current?.focus()}
            blurOnSubmit={false}
          />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <SelectInput
                focused
                label="Property Type"
                placeholder="Residential"
                defaultValue={
                  input.propertyType
                    ? { label: input.propertyType, value: input.propertyType }
                    : undefined
                }
                options={PROPERTY_TYPE.map((v) => ({ label: v, value: v }))}
                onSelect={(v) => updateInput({ propertyType: v.value })}
                renderItem={SelectOption}
              />
            </View>
            <View style={{ flex: 1 }}>
              <SelectInput
                focused
                label="Listing Type"
                placeholder="Rent"
                defaultValue={
                  input.listingType
                    ? { label: input.listingType, value: input.listingType }
                    : undefined
                }
                options={Object.keys(ListingType).map((v) => ({
                  label: `For ${v}`,
                  value: v,
                }))}
                onSelect={(v) =>
                  updateInput({
                    listingType: ListingType[v.value as keyof typeof ListingType],
                  })
                }
                renderItem={SelectOption}
              />
            </View>
          </View>
        </SectionCard>

        <SectionCard
          icon={<AlignLeft size={16} color={colors.primary} />}
          title="Description"
          style={{ padding: 0, minHeight: 200 }}
          subtitle="Tell guests what makes your property special"
        >
          <FloatingLabelInput
            ref={descriptionRef}
            focused
            className="rounded-t-sm"
            multiline
            placeholder="A 4 bedroom bungalow with a spacious compound..."
            containerStyle={{ minHeight: 200, borderWidth: 0 }}
            numberOfLines={6}
            value={cast(input.description)}
            onChangeText={(v) => updateInput({ description: v })}
            returnKeyType="default"
          />
        </SectionCard>
      </View>
    </DetailsLayout>
  );
}

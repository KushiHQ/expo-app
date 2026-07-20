import FloatingLabelInput from '@/components/atoms/a-floating-label-input';
import DetailsLayout from '@/components/layouts/details';
import HostingStepper from '@/components/molecules/m-hosting-stepper';
import SectionCard from '@/components/molecules/m-section-card';
import SelectInput, { SelectOption } from '@/components/molecules/m-select-input';
import AiContentSuggestion from '@/components/molecules/m-ai-content-suggestion';
import { ParentListingOption } from '@/components/molecules/m-parent-listing-option';
import ThemedText from '@/components/atoms/a-themed-text';
import { useHostingForm } from '@/lib/hooks/hosting-form';
import { usePropertyTypeConfig } from '@/lib/hooks/use-property-type-config';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { useUser } from '@/lib/hooks/user';
import {
  HostingKind,
  ListingType,
  ManagementType,
  useHostListingsQuery,
} from '@/lib/services/graphql/generated';
import { hexToRgba } from '@/lib/utils/colors';
import { joinLocation } from '@/lib/utils/locations';
import { Fonts } from '@/lib/constants/theme';
import { cast } from '@/lib/types/utils';
import { handleError } from '@/lib/utils/error';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AlignLeft, Building2 } from 'lucide-react-native';
import React, { useRef } from 'react';
import { RefreshControl, TextInput, View } from 'react-native';
import { toast } from '@/lib/hooks/use-toast';

const DESCRIPTION_MIN = 40;
const DESCRIPTION_MAX = 1500;

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
    hosting,
  } = useHostingForm(id);
  const { user } = useUser();
  const { propertyTypes } = usePropertyTypeConfig();
  const descLen = input.description?.length ?? 0;

  // Parent / child kind. Seed from the input, else the fetched hosting, else standalone.
  const currentKind =
    (input.kind as HostingKind | undefined) ?? hosting?.kind ?? HostingKind.Standalone;
  const currentParentId = input.parentId ?? hosting?.parentId ?? null;
  // A plaza that already has shops can't change kind (server enforces this too).
  const kindLocked = hosting?.kind === HostingKind.Parent && (hosting?.childCount ?? 0) > 0;

  const KIND_OPTIONS = [
    { label: 'Standalone listing', value: HostingKind.Standalone },
    { label: 'Parent (a multi-unit property)', value: HostingKind.Parent },
    { label: 'Child (a unit within a property)', value: HostingKind.Child },
  ];

  // Kushi-managed (full flow) vs agent-managed (advertise-only). Default Kushi.
  const currentManagement =
    (input.managementType as ManagementType | undefined) ??
    hosting?.managementType ??
    ManagementType.KushiManaged;
  const MANAGEMENT_OPTIONS = [
    { label: 'Kushi Managed', value: ManagementType.KushiManaged },
    { label: 'Agent Managed', value: ManagementType.AgentManaged },
  ];

  // Eligible parents = the host's own Parent/Standalone listings (not this one).
  const [{ data: parentListings }] = useHostListingsQuery({
    variables: { filters: { creatorId: user.user?.id } },
    pause: currentKind !== HostingKind.Child || !user.user?.id,
  });
  const parentOptions = (parentListings?.hostings ?? [])
    .filter((h) => h.kind !== HostingKind.Child && h.id !== id)
    .map((h) => ({
      label: h.title ?? 'Untitled listing',
      value: h.id,
      image: h.coverImage?.asset.publicUrl ?? null,
      location: joinLocation(h.city, h.state),
      description: h.description ?? null,
    }));

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
            !input.description?.length ||
            (currentKind === HostingKind.Child && !currentParentId)
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
          <SelectInput
            focused
            label="Who manages this listing?"
            placeholder="Kushi Managed"
            defaultValue={{
              label:
                MANAGEMENT_OPTIONS.find((o) => o.value === currentManagement)?.label ??
                'Kushi Managed',
              value: currentManagement,
            }}
            options={MANAGEMENT_OPTIONS}
            onSelect={(v) => updateInput({ managementType: v.value as ManagementType })}
            renderItem={SelectOption}
          />
          <ThemedText
            style={{
              fontSize: 12,
              marginTop: 6,
              marginBottom: 14,
              color: hexToRgba(colors.text, 0.5),
            }}
          >
            {currentManagement === ManagementType.AgentManaged
              ? 'Advert only — interested renters contact you directly. No tenancy agreement, mandate, or payout on Kushi, and the exact address stays hidden (only state & city show).'
              : 'The full Kushi flow — verified, digital tenancy agreement, and payment held in escrow.'}
          </ThemedText>

          <View
            pointerEvents={kindLocked ? 'none' : 'auto'}
            style={kindLocked ? { opacity: 0.55 } : undefined}
          >
            <SelectInput
              focused
              label="Listing kind"
              placeholder="Standalone listing"
              defaultValue={{
                label:
                  KIND_OPTIONS.find((o) => o.value === currentKind)?.label ?? 'Standalone listing',
                value: currentKind,
              }}
              options={KIND_OPTIONS}
              onSelect={(v) =>
                updateInput({
                  kind: v.value,
                  // clear the parent unless this is (still) a child
                  parentId: v.value === HostingKind.Child ? currentParentId : null,
                })
              }
              renderItem={SelectOption}
            />
          </View>
          {kindLocked ? (
            <ThemedText
              style={{
                fontSize: 12,
                marginTop: 6,
                color: hexToRgba(colors.text, 0.5),
              }}
            >
              This property already has units, so its kind is locked.
            </ThemedText>
          ) : null}

          {currentKind === HostingKind.Child ? (
            <View style={{ marginTop: 12 }}>
              <SelectInput
                searchable
                searchField="label"
                focused
                label="Parent listing"
                placeholder="Select the property this unit belongs to"
                defaultValue={
                  currentParentId
                    ? {
                        label:
                          parentOptions.find((o) => o.value === currentParentId)?.label ??
                          'Selected property',
                        value: currentParentId,
                      }
                    : undefined
                }
                options={parentOptions}
                onSelect={(v) => updateInput({ parentId: v.value })}
                renderItem={ParentListingOption}
              />
              <ThemedText
                style={{
                  fontSize: 12,
                  marginTop: 6,
                  color: hexToRgba(colors.text, 0.5),
                }}
              >
                This unit inherits the parent property location, mandate, tenancy terms and payout —
                you can edit them as you go.
              </ThemedText>
            </View>
          ) : null}

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
                searchable
                searchField="label"
                label="Property Type"
                placeholder="Search e.g. flat, shop, land…"
                defaultValue={
                  input.propertyType
                    ? { label: input.propertyType, value: input.propertyType, searchTerms: [] }
                    : undefined
                }
                options={propertyTypes.map((p) => ({
                  label: p.label,
                  value: p.value,
                  searchTerms: p.searchTerms,
                }))}
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

        {id ? (
          <AiContentSuggestion
            hostingId={String(id)}
            onApply={({ title, description }) => updateInput({ title, description })}
          />
        ) : null}

        <SectionCard
          icon={<AlignLeft size={16} color={colors.primary} />}
          title="Description"
          subtitle="Tell guests what makes your property special"
        >
          <View
            style={{
              backgroundColor: hexToRgba(colors.text, 0.06),
              borderRadius: 16,
              paddingHorizontal: 16,
              paddingVertical: 14,
              minHeight: 168,
            }}
          >
            <TextInput
              ref={descriptionRef}
              multiline
              textAlignVertical="top"
              placeholder="A 4-bedroom bungalow with a spacious compound, 24/7 power, and a serene, gated neighbourhood…"
              placeholderTextColor={hexToRgba(colors.text, 0.35)}
              value={cast(input.description)}
              onChangeText={(v) => updateInput({ description: v })}
              maxLength={DESCRIPTION_MAX}
              returnKeyType="default"
              style={{
                flex: 1,
                minHeight: 132,
                color: colors.text,
                fontFamily: Fonts.regular,
                fontSize: 15,
                lineHeight: 23,
              }}
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 10,
              paddingHorizontal: 2,
            }}
          >
            <ThemedText style={{ fontSize: 12, color: hexToRgba(colors.text, 0.45) }}>
              {descLen === 0
                ? 'A vivid description gets more applications'
                : descLen < DESCRIPTION_MIN
                  ? `Add ${DESCRIPTION_MIN - descLen} more character${
                      DESCRIPTION_MIN - descLen === 1 ? '' : 's'
                    }`
                  : 'Great — that gives guests a real feel for it'}
            </ThemedText>
            <ThemedText
              style={{
                fontSize: 12,
                fontFamily: Fonts.medium,
                color: descLen >= DESCRIPTION_MIN ? colors.primary : hexToRgba(colors.text, 0.45),
              }}
            >
              {descLen}/{DESCRIPTION_MAX}
            </ThemedText>
          </View>
        </SectionCard>
      </View>
    </DetailsLayout>
  );
}

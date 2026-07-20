import DetailsLayout from '@/components/layouts/details';
import HostingStepper from '@/components/molecules/m-hosting-stepper';
import SectionCard from '@/components/molecules/m-section-card';
import SelectInput, { SelectOption } from '@/components/molecules/m-select-input';
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
import { handleError } from '@/lib/utils/error';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Building2 } from 'lucide-react-native';
import React from 'react';
import { RefreshControl, View } from 'react-native';
import { toast } from '@/lib/hooks/use-toast';

export default function NewHostingStep1() {
  const router = useRouter();
  const colors = useThemeColors();
  const { id } = useLocalSearchParams();
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

  // Parent / child kind. Seed from the input, else the fetched hosting, else standalone.
  const currentKind =
    (input.kind as HostingKind | undefined) ?? hosting?.kind ?? HostingKind.Standalone;
  const currentParentId = input.parentId ?? hosting?.parentId ?? null;
  // A plaza that already has shops can't change kind (server enforces this too).
  const kindLocked = hosting?.kind === HostingKind.Parent && (hosting?.childCount ?? 0) > 0;

  const KIND_OPTIONS = [
    {
      label: 'Standalone listing',
      value: HostingKind.Standalone,
      description: 'A single, self-contained property.',
      sequence: 1,
    },
    {
      label: 'Parent (a multi-unit property)',
      value: HostingKind.Parent,
      description: 'A property with multiple units — e.g. a block of flats or a plaza.',
      sequence: 2,
    },
    {
      label: 'Child (a unit within a property)',
      value: HostingKind.Child,
      description: 'One unit that belongs to a parent property.',
      sequence: 3,
    },
  ];

  // Kushi-managed (full flow) vs agent-managed (advertise-only). Default Kushi.
  const currentManagement =
    (input.managementType as ManagementType | undefined) ??
    hosting?.managementType ??
    ManagementType.KushiManaged;
  const MANAGEMENT_OPTIONS = [
    {
      label: 'Kushi Managed',
      value: ManagementType.KushiManaged,
      description:
        'Kushi handles it on the platform — the property is verified, the paperwork and signing are handled for you, and payment is secured in escrow.',
      sequence: 1,
    },
    {
      label: 'Agent Managed',
      value: ManagementType.AgentManaged,
      description:
        'An advert only. Interested people contact you directly and you handle the deal off Kushi — no verification, paperwork, or payments here, and your exact address stays hidden.',
      sequence: 2,
    },
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

  // Title/description are now captured at the end (Review & Publish), so a new
  // listing starts with a sensible placeholder name (D9). Number it against the
  // host's existing "Untitled listing" placeholders so they stay distinct.
  const [{ data: myListings }] = useHostListingsQuery({
    variables: { filters: { creatorId: user.user?.id } },
    pause: !!id || !user.user?.id,
  });
  const seededTitle = React.useMemo(() => {
    const untitled = (myListings?.hostings ?? []).filter((h) =>
      (h.title ?? '').startsWith('Untitled listing'),
    ).length;
    return untitled === 0 ? 'Untitled listing' : `Untitled listing (${untitled + 1})`;
  }, [myListings]);

  const [refreshing, setRefreshing] = React.useState(false);
  React.useEffect(() => {
    if (!fetching) setRefreshing(false);
  }, [fetching]);

  const handleMutate = () => {
    mutate({ input: { ...input, title: input.title?.trim() || seededTitle } }).then((res) => {
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
            !input.propertyType?.length ||
            !input.listingType?.length ||
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
          subtitle="How it's managed, property type, and listing style"
        >
          <SelectInput
            focused
            label="Who manages this listing?"
            placeholder="Kushi Managed"
            defaultValue={MANAGEMENT_OPTIONS.find((o) => o.value === currentManagement)}
            options={MANAGEMENT_OPTIONS}
            onSelect={(v) => updateInput({ managementType: v.value as ManagementType })}
            renderItem={SelectOption}
          />
          <View style={{ marginBottom: 14 }} />

          <View
            pointerEvents={kindLocked ? 'none' : 'auto'}
            style={kindLocked ? { opacity: 0.55 } : undefined}
          >
            <SelectInput
              focused
              label="Listing Type"
              placeholder="Standalone listing"
              defaultValue={{
                label:
                  KIND_OPTIONS.find((o) => o.value === currentKind)?.label ?? 'Standalone listing',
                value: currentKind,
              }}
              options={KIND_OPTIONS}
              onSelect={(v) =>
                updateInput({
                  kind: v.value as HostingKind,
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
                label="Offer Type"
                placeholder="Rent"
                defaultValue={
                  input.listingType
                    ? { label: input.listingType, value: input.listingType }
                    : undefined
                }
                options={Object.keys(ListingType).map((v, i) => ({
                  label: `For ${v}`,
                  value: v,
                  description:
                    v === 'Sale'
                      ? 'Sell the property outright to a buyer.'
                      : 'Let the property to a tenant for a rental period.',
                  sequence: i + 1,
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
      </View>
    </DetailsLayout>
  );
}

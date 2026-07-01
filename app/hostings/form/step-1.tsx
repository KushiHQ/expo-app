import FloatingLabelInput from "@/components/atoms/a-floating-label-input";
import DetailsLayout from "@/components/layouts/details";
import HostingStepper from "@/components/molecules/m-hosting-stepper";
import SectionCard from "@/components/molecules/m-section-card";
import SelectInput, {
  SelectOption,
} from "@/components/molecules/m-select-input";
import AiContentSuggestion from "@/components/molecules/m-ai-content-suggestion";
import ThemedText from "@/components/atoms/a-themed-text";
import { useHostingForm } from "@/lib/hooks/hosting-form";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { useUser } from "@/lib/hooks/user";
import {
  HostingKind,
  ListingType,
  useHostListingsQuery,
} from "@/lib/services/graphql/generated";
import { hexToRgba } from "@/lib/utils/colors";
import { PROPERTY_TYPE, PROPERTY_TYPE_SEARCH_TERMS, PropertyType } from "@/lib/types/enums/hostings";
import { cast } from "@/lib/types/utils";
import { handleError } from "@/lib/utils/error";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AlignLeft, Building2 } from "lucide-react-native";
import React, { useRef } from "react";
import { RefreshControl, TextInput, View } from "react-native";
import { toast } from "@/lib/hooks/use-toast";

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

  // Parent / child kind. Seed from the input, else the fetched hosting, else standalone.
  const currentKind =
    (input.kind as HostingKind | undefined) ??
    hosting?.kind ??
    HostingKind.Standalone;
  const currentParentId = input.parentId ?? hosting?.parentId ?? null;
  // A plaza that already has shops can't change kind (server enforces this too).
  const kindLocked =
    hosting?.kind === HostingKind.Parent && (hosting?.childCount ?? 0) > 0;

  const KIND_OPTIONS = [
    { label: "Standalone listing", value: HostingKind.Standalone },
    { label: "Parent (a multi-unit property)", value: HostingKind.Parent },
    { label: "Child (a unit within a property)", value: HostingKind.Child },
  ];

  // Eligible parents = the host's own Parent/Standalone listings (not this one).
  const [{ data: parentListings }] = useHostListingsQuery({
    variables: { filters: { creatorId: user.user?.id } },
    pause: currentKind !== HostingKind.Child || !user.user?.id,
  });
  const parentOptions = (parentListings?.hostings ?? [])
    .filter((h) => h.kind !== HostingKind.Child && h.id !== id)
    .map((h) => ({ label: h.title ?? "Untitled listing", value: h.id }));

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
        router.replace(
          `/hostings/form/step-2?id=${res.data?.createOrUpdateHosting.data?.id}`,
        );
        toast.show({
          type: "success",
          text1: "Success",
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
          <View
            pointerEvents={kindLocked ? "none" : "auto"}
            style={kindLocked ? { opacity: 0.55 } : undefined}
          >
            <SelectInput
              focused
              label="Listing kind"
              placeholder="Standalone listing"
              defaultValue={{
                label:
                  KIND_OPTIONS.find((o) => o.value === currentKind)?.label ??
                  "Standalone listing",
                value: currentKind,
              }}
              options={KIND_OPTIONS}
              onSelect={(v) =>
                updateInput({
                  kind: v.value,
                  // clear the parent unless this is (still) a child
                  parentId:
                    v.value === HostingKind.Child ? currentParentId : null,
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
                          parentOptions.find((o) => o.value === currentParentId)
                            ?.label ?? "Selected property",
                        value: currentParentId,
                      }
                    : undefined
                }
                options={parentOptions}
                onSelect={(v) => updateInput({ parentId: v.value })}
                renderItem={SelectOption}
              />
              <ThemedText
                style={{
                  fontSize: 12,
                  marginTop: 6,
                  color: hexToRgba(colors.text, 0.5),
                }}
              >
                This unit inherits the parent property location, mandate,
                tenancy terms and payout — you can edit them as you go.
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
          <View style={{ flexDirection: "row", gap: 12 }}>
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
                options={PROPERTY_TYPE.map((v) => ({
                  label: v,
                  value: v,
                  searchTerms: PROPERTY_TYPE_SEARCH_TERMS[v as PropertyType] ?? [],
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
                    listingType:
                      ListingType[v.value as keyof typeof ListingType],
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
            onApply={({ title, description }) =>
              updateInput({ title, description })
            }
          />
        ) : null}

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
            numberOfLines={20}
            value={cast(input.description)}
            onChangeText={(v) => updateInput({ description: v })}
            returnKeyType="default"
          />
        </SectionCard>
      </View>
    </DetailsLayout>
  );
}

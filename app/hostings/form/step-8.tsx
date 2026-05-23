import React from 'react';
import { View } from 'react-native';
import ThemedText from '@/components/atoms/a-themed-text';
import Chip from '@/components/atoms/a-chip';
import DataRow from '@/components/atoms/a-data-row';
import StackedRow from '@/components/atoms/a-stacked-row';
import ReviewSection from '@/components/molecules/m-review-section';
import DetailsLayout from '@/components/layouts/details';
import HostingStepper from '@/components/molecules/m-hosting-stepper';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import { Href, Link, useLocalSearchParams } from 'expo-router';
import { useRouter } from '@/lib/hooks/use-router';
import {
  BadgeDollarSign,
  Building2,
  Camera,
  MapPin,
  ShieldCheck,
  Sparkles,
  FileText,
} from 'lucide-react-native';
import { useHostingForm } from '@/lib/hooks/hosting-form';
import { capitalize } from '@/lib/utils/text';
import HostingCard from '@/components/molecules/m-hosting-card';
import { PublishStatus } from '@/lib/services/graphql/generated';
import LoadingModal from '@/components/atoms/a-loading-modal';
import { handleError } from '@/lib/utils/error';
import { toast } from '@/lib/hooks/use-toast';
import PublishListingSuccess from '@/components/molecules/m-publish-listing-success';
import CheckboxInput from '@/components/molecules/m-checkbox-input';
import { Room } from '@/lib/types/enums/hostings';
import { removeTypenames } from '@/lib/utils/graphql/cleanup';

// ─── screen ──────────────────────────────────────────────────────────────────

export default function NewHostingStep8() {
  const router = useRouter();
  const colors = useThemeColors();
  const { id } = useLocalSearchParams();
  const {
    input,
    hosting,
    mutate,
    mutating,
    updateInput,
    fetching: fetchingHosting,
  } = useHostingForm(id);

  const [accepted, setAccepted] = React.useState({
    truth: hosting?.publishStatus === PublishStatus.Live,
    tos: hosting?.publishStatus === PublishStatus.Live,
  });
  const [success, setSuccess] = React.useState(false);

  const loading = mutating;

  const handleMutate = () => {
    const nextStatus =
      hosting?.publishStatus === PublishStatus.Live ? PublishStatus.Draft : PublishStatus.Live;
    updateInput({ publishStatus: nextStatus });
    mutate({
      input: { ...removeTypenames(input), publishStatus: nextStatus },
    }).then((res) => {
      if (res.error) {
        handleError(res.error);
      }
      if (res.data?.createOrUpdateHosting) {
        router.push(`/hostings/form/step-8?id=${res.data?.createOrUpdateHosting.data?.id}`);
        toast.show({
          type: 'success',
          text1: 'Success',
          text2: res.data.createOrUpdateHosting.message,
        });
        setSuccess(true);
      }
    });
  };

  const handleClose = () => {
    setSuccess(false);
    router.dismissAll();
    router.replace('/host/analytics');
  };

  function editStep(step: 1 | 2 | 3 | 4 | 5 | 6 | 7): Href {
    return `/hostings/form/step-${step}?id=${hosting?.id}` as Href;
  }

  const totalPhotos = hosting?.rooms?.reduce((sum, r) => sum + r.images.length, 0) ?? 0;

  const isLive = hosting?.publishStatus === PublishStatus.Live;

  return (
    <>
      <DetailsLayout
        title="Hosting"
        footer={
          <HostingStepper
            onTogglePublish={handleMutate}
            published={isLive}
            loading={mutating}
            disabled={(!accepted.tos || !accepted.truth) && !isLive}
            step={8}
          />
        }
      >
        <View style={{ gap: 20, paddingBottom: 8 }}>
          {/* Hint */}
          <ThemedText
            style={{
              fontSize: 12,
              color: hexToRgba(colors.text, 0.5),
              lineHeight: 18,
            }}
          >
            Review every detail below before publishing. Tap the{' '}
            <ThemedText style={{ fontSize: 12, color: hexToRgba(colors.text, 0.5) }}>✎</ThemedText>{' '}
            icon on any section to make changes.
          </ThemedText>

          {/* Live preview card */}
          {hosting && (
            <View style={{ gap: 8 }}>
              <ThemedText
                style={{
                  fontSize: 10,
                  fontFamily: Fonts.medium,
                  color: hexToRgba(colors.text, 0.38),
                  letterSpacing: 0.8,
                }}
              >
                LISTING PREVIEW
              </ThemedText>
              <HostingCard disabled hosting={hosting} />
            </View>
          )}

          {/* Section 1 — Listing Details */}
          <ReviewSection
            icon={<FileText color={colors.primary} size={15} />}
            title="Listing Details"
            onEdit={() => router.push(editStep(1))}
          >
            <DataRow label="Title" value={input.title ?? ''} />
            <DataRow label="Property Type" value={input.propertyType ?? ''} />
            <DataRow label="Payment Interval" value={capitalize(input.paymentInterval ?? '')} />
            {input.description ? (
              <StackedRow label="Description" value={input.description} />
            ) : null}
          </ReviewSection>

          {/* Section 2 — Spaces & Media */}
          <ReviewSection
            icon={<Camera color={colors.primary} size={15} />}
            title="Spaces & Media"
            onEdit={() => router.push(editStep(2))}
          >
            {hosting?.rooms && hosting.rooms.length > 0 ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {hosting.rooms.map((r) => (
                  <Chip
                    key={r.id}
                    label={Room[r.name as keyof typeof Room] ?? r.name}
                    count={r.count ?? undefined}
                  />
                ))}
              </View>
            ) : (
              <ThemedText style={{ fontSize: 13, color: hexToRgba(colors.text, 0.4) }}>
                No rooms added
              </ThemedText>
            )}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingTop: 2,
              }}
            >
              <ThemedText style={{ fontSize: 12, color: hexToRgba(colors.text, 0.4) }}>
                Total photos uploaded
              </ThemedText>
              <View
                style={{
                  backgroundColor: hexToRgba(colors.text, 0.08),
                  borderRadius: 10,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                }}
              >
                <ThemedText
                  style={{
                    fontSize: 12,
                    fontFamily: Fonts.semibold,
                    color: hexToRgba(colors.text, 0.7),
                  }}
                >
                  {totalPhotos}
                </ThemedText>
              </View>
            </View>
          </ReviewSection>

          {/* Section 3 — Location & Contact */}
          <ReviewSection
            icon={<MapPin color={colors.primary} size={15} />}
            title="Location & Contact"
            onEdit={() => router.push(editStep(3))}
          >
            <StackedRow
              label="Address"
              value={[input.street, input.city, input.postalCode, input.state]
                .filter(Boolean)
                .join(', ')}
            />
            <DataRow label="Contact" value={input.contact ?? ''} />
            {input.landmarks ? <DataRow label="Landmarks" value={input.landmarks} /> : null}
          </ReviewSection>

          {/* Section 4 — Amenities */}
          {(input.facilities ?? []).length > 0 && (
            <ReviewSection
              icon={<Sparkles color={colors.primary} size={15} />}
              title="Amenities"
              onEdit={() => router.push(editStep(4))}
            >
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {(input.facilities ?? []).map((f) => (
                  <Chip key={f} label={f} />
                ))}
              </View>
            </ReviewSection>
          )}

          {/* Section 5 — Pricing & Payment */}
          <ReviewSection
            icon={<BadgeDollarSign color={colors.primary} size={15} />}
            title="Pricing & Payment"
            onEdit={() => router.push(editStep(5))}
          >
            <DataRow
              label="Rent"
              value={`₦${Number(hosting?.price ?? 0).toLocaleString()} / ${capitalize(hosting?.paymentInterval ?? '')}`}
              accent
            />
            {hosting?.cautionFee ? (
              <DataRow
                label="Caution Fee"
                value={`₦${Number(hosting.cautionFee).toLocaleString()}`}
              />
            ) : null}
            {hosting?.serviceCharge ? (
              <DataRow
                label="Service Charge"
                value={`₦${Number(hosting.serviceCharge).toLocaleString()}`}
              />
            ) : null}
            {hosting?.maxOccupants ? (
              <DataRow label="Max Occupants" value={String(hosting.maxOccupants)} />
            ) : null}
            <View
              style={{
                height: 1,
                backgroundColor: hexToRgba(colors.text, 0.07),
                marginVertical: 2,
              }}
            />
            <DataRow label="Bank" value={hosting?.paymentDetails?.bankDetails?.name ?? ''} />
            <DataRow label="Account No." value={hosting?.paymentDetails?.accountNumber ?? ''} />
          </ReviewSection>

          {/* Section 6 — Ownership */}
          <ReviewSection
            icon={<ShieldCheck color={colors.primary} size={15} />}
            title="Ownership"
            onEdit={() => router.push(editStep(6))}
          >
            <DataRow label="Landlord" value={hosting?.verification?.landlordFullName ?? ''} />
            <StackedRow
              label="Landlord Address"
              value={hosting?.verification?.landlordAddress ?? ''}
            />
            <DataRow
              label="Relationship"
              value={capitalize(hosting?.verification?.propertyRelationship ?? '')}
            />
          </ReviewSection>

          {/* Section 7 — Tenancy Agreement */}
          <ReviewSection
            icon={<Building2 color={colors.primary} size={15} />}
            title="Tenancy Agreement"
            onEdit={() => router.push(editStep(7))}
          >
            <ThemedText
              style={{
                fontSize: 13,
                color: hexToRgba(colors.text, 0.55),
                lineHeight: 20,
              }}
            >
              Your tenancy agreement template has been configured. Tap edit to review or adjust the
              active clauses.
            </ThemedText>
          </ReviewSection>

          {/* Attestations */}
          <View
            style={{
              gap: 12,
              padding: 16,
              borderRadius: 14,
              backgroundColor: hexToRgba(colors.text, 0.03),
              borderWidth: 1,
              borderColor: hexToRgba(colors.text, 0.07),
            }}
          >
            <CheckboxInput
              checked={accepted.truth}
              onCheckChange={(v) => setAccepted((c) => ({ ...c, truth: v }))}
            >
              <ThemedText style={{ fontSize: 13, lineHeight: 20, flex: 1 }}>
                I confirm that the information provided is true and accurate to the best of my
                knowledge.
              </ThemedText>
            </CheckboxInput>
            <CheckboxInput
              checked={accepted.tos}
              onCheckChange={(v) => setAccepted((c) => ({ ...c, tos: v }))}
            >
              <ThemedText style={{ fontSize: 13, lineHeight: 20, flex: 1 }}>
                I agree to Kushi&apos;s hosting{' '}
                <Link
                  href="https://kushicorp.com/legal/terms-of-service"
                  style={{
                    color: colors.primary,
                    textDecorationLine: 'underline',
                  }}
                >
                  Terms of Service
                </Link>
                .
              </ThemedText>
            </CheckboxInput>
          </View>
        </View>
      </DetailsLayout>

      <LoadingModal visible={loading} />
      <PublishListingSuccess show={success} onClose={handleClose} />
    </>
  );
}

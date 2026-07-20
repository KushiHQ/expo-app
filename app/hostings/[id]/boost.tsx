import { PayWithFlutterwave } from 'flutterwave-react-native';
import { Pressable, View } from 'react-native';
import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useRouter } from '@/lib/hooks/use-router';
import DetailsLayout from '@/components/layouts/details';
import SectionCard from '@/components/molecules/m-section-card';
import ThemedText from '@/components/atoms/a-themed-text';
import Button from '@/components/atoms/a-button';
import LoadingModal from '@/components/atoms/a-loading-modal';
import SuccessModal from '@/components/organisms/o-success-modal';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import { useUser } from '@/lib/hooks/user';
import { toast } from '@/lib/hooks/use-toast';
import { handleError } from '@/lib/utils/error';
import { Check, Rocket } from 'lucide-react-native';
import {
  ListingTier,
  TransactionStatus,
  useInitiateListingBoostMutation,
  useListingBoostCatalogueQuery,
  useVerifyListingBoostMutation,
} from '@/lib/services/graphql/generated';

export default function BoostListing() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colors = useThemeColors();
  const user = useUser();

  const [{ data: catalogueData }] = useListingBoostCatalogueQuery();
  const options = catalogueData?.listingBoostCatalogue ?? [];

  const [selectedTier, setSelectedTier] = React.useState<ListingTier | null>(null);
  const [activeRef, setActiveRef] = React.useState('');
  const [amount, setAmount] = React.useState(0);
  const [pendingOpen, setPendingOpen] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const flutterwaveOpen = React.useRef<(() => void) | null>(null);

  const [{ fetching: initiating }, initiateBoost] = useInitiateListingBoostMutation();
  const [{ fetching: verifying }, verifyBoost] = useVerifyListingBoostMutation();

  const selectedOption = options.find((o) => o.tier === selectedTier);

  // Open Flutterwave once a fresh reference has been minted by `initiate`.
  React.useEffect(() => {
    if (pendingOpen && flutterwaveOpen.current) {
      flutterwaveOpen.current();
      setPendingOpen(false);
    }
  }, [activeRef, pendingOpen]);

  function handleVerify(data: { status: string; tx_ref: string }) {
    if (data.status === 'cancelled') return;
    verifyBoost({ reference: activeRef }).then((res) => {
      if (res.error) return handleError(res.error);
      const tx = res.data?.verifyListingBoost;
      if (tx) {
        toast.show({ type: 'success', text1: 'Success', text2: tx.message });
        if (tx.data?.status === TransactionStatus.Success) setSuccess(true);
      }
    });
  }

  function handlePay() {
    if (!selectedTier) return;
    initiateBoost({ hostingId: String(id), tier: selectedTier }).then((res) => {
      if (res.error) return handleError(res.error);
      const tx = res.data?.initiateListingBoost?.data;
      if (!tx?.reference) return;
      setActiveRef(tx.reference);
      setAmount(Number(tx.amount));
      setPendingOpen(true);
    });
  }

  return (
    <>
      <DetailsLayout
        title="Boost Listing"
        footer={
          <View style={{ padding: 16 }}>
            <PayWithFlutterwave
              onRedirect={handleVerify}
              options={{
                authorization: process.env.EXPO_PUBLIC_FLUTTERWAVE_PUBLIC_KEY ?? '',
                amount,
                tx_ref: activeRef,
                currency: 'NGN',
                customer: {
                  email: user.user.email ?? '',
                  name: user.user.user?.profile.fullName,
                },
                customizations: {
                  title: 'Kushi Listing Boost',
                  description: selectedOption ? `${selectedOption.label} boost` : 'Boost your listing',
                  logo: 'https://res.cloudinary.com/dev-media/image/upload/v1772369352/logo_miq5eq.png',
                },
              }}
              customButton={(props) => {
                flutterwaveOpen.current = props.onPress;
                return (
                  <Button
                    onPress={handlePay}
                    disabled={!selectedTier || initiating || props.disabled}
                    type="primary"
                  >
                    <ThemedText content="primary">
                      {initiating
                        ? 'Preparing…'
                        : selectedOption
                          ? `Boost for ₦${Number(selectedOption.price).toLocaleString()}`
                          : 'Select a tier'}
                    </ThemedText>
                  </Button>
                );
              }}
            />
          </View>
        }
      >
        <View style={{ gap: 20, paddingBottom: 24 }}>
          <SectionCard
            icon={<Rocket size={16} color={colors.primary} />}
            title="Boost your listing"
            subtitle="Rank higher in search and the feed for a set period"
          >
            <View style={{ gap: 10 }}>
              {options.map((opt) => {
                const isSel = selectedTier === opt.tier;
                return (
                  <Pressable
                    key={opt.tier}
                    onPress={() => setSelectedTier(opt.tier)}
                    style={{
                      borderRadius: 16,
                      padding: 14,
                      gap: 4,
                      backgroundColor: isSel
                        ? hexToRgba(colors.primary, 0.1)
                        : hexToRgba(colors.text, 0.04),
                      boxShadow: isSel ? `0 0 0 1.5px ${colors.primary}` : undefined,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <ThemedText type="semibold" style={{ fontSize: 15 }}>
                        {opt.label}
                      </ThemedText>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <ThemedText type="semibold" style={{ fontSize: 15, color: colors.primary }}>
                          ₦{Number(opt.price).toLocaleString()}
                        </ThemedText>
                        {isSel ? <Check size={18} color={colors.primary} /> : null}
                      </View>
                    </View>
                    {opt.description ? (
                      <ThemedText
                        style={{ fontSize: 12, lineHeight: 18, color: hexToRgba(colors.text, 0.55) }}
                      >
                        {opt.description}
                      </ThemedText>
                    ) : null}
                    <ThemedText style={{ fontSize: 11, color: hexToRgba(colors.text, 0.4) }}>
                      {opt.durationDays} days
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </SectionCard>
        </View>
      </DetailsLayout>

      <SuccessModal
        open={success}
        onClose={() => setSuccess(false)}
        title="Listing Boosted"
        description={`Your listing now has a ${selectedOption?.label ?? ''} boost and will rank higher for ${selectedOption?.durationDays ?? 30} days.`}
        action={
          <Button onPress={() => router.back()} type="primary" className="w-60">
            <ThemedText content="primary">Done</ThemedText>
          </Button>
        }
      />
      <LoadingModal visible={initiating || verifying} />
    </>
  );
}

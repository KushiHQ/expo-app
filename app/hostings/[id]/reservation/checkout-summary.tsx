import Button from '@/components/atoms/a-button';
import Skeleton from '@/components/atoms/a-skeleton';
import ThemedText from '@/components/atoms/a-themed-text';
import DetailsLayout from '@/components/layouts/details';
import CheckoutSummaryItem from '@/components/molecules/m-checkout-summary-item';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import {
  PaymentInterval,
  useCalculateHostingFeesQuery,
  useHostingQuery,
} from '@/lib/services/graphql/generated';
import { useBookingApplicationStore } from '@/lib/stores/bookings';
import { hexToRgba } from '@/lib/utils/colors';
import { formatNaira } from '@/lib/utils/currency';
import { useLocalSearchParams } from 'expo-router';
import { useRouter } from '@/lib/hooks/use-router';
import { ChevronLeftIcon, ChevronRightIcon, Info } from 'lucide-react-native';
import React from 'react';
import { Pressable, View } from 'react-native';

export default function CheckoutSummary() {
  const router = useRouter();
  const colors = useThemeColors();
  const { id } = useLocalSearchParams();
  const { input, updateInput } = useBookingApplicationStore();
  const [{ data: hostingData, fetching: hostingFetching }] = useHostingQuery({
    variables: { hostingId: String(id) },
  });
  const [{ data, fetching: feesFetching }] = useCalculateHostingFeesQuery({
    variables: {
      hostingId: String(id),
      multiplier: input.intervalMultiplier ?? 1,
    },
  });

  const calculated = data?.calculateHostingFees;

  const duration = React.useMemo(() => {
    let label = 'Years';
    switch (hostingData?.hosting.paymentInterval) {
      case PaymentInterval.Weekly:
        label = 'Weeks';
      case PaymentInterval.Nightly:
        label = 'Nigths';
      case PaymentInterval.Monthly:
        label = 'Months';
      default:
        label = 'Years';
    }

    return label;
  }, [hostingData]);
  return (
    <DetailsLayout
      title="Checkout Summary"
      footer={
        <View className="gap-4 px-6 pb-4" style={{ backgroundColor: colors.background }}>
          <Button onPress={() => router.push(`/hostings/${id}/reservation/step-1/`)} type="primary">
            <ThemedText content="primary">Continue</ThemedText>
          </Button>
        </View>
      }
    >
      <View className="mt-4 gap-6">
        {hostingFetching ? (
          <Skeleton style={{ height: 50, borderRadius: 14 }} />
        ) : (
          <View
            className="flex-row items-center justify-between rounded-2xl p-2 px-6"
            style={{ backgroundColor: hexToRgba(colors.text, 0.03) }}
          >
            <ThemedText style={{ fontSize: 18 }}>{duration}</ThemedText>
            <View className="flex-row items-center gap-6">
              <Pressable
                className="p-2"
                disabled={(input.intervalMultiplier ?? 1) <= 1}
                onPress={() =>
                  updateInput({
                    intervalMultiplier: (input.intervalMultiplier ?? 1) - 1,
                  })
                }
              >
                <ChevronLeftIcon color={colors.text} />
              </Pressable>
              <ThemedText type="semibold">{input.intervalMultiplier ?? 1}</ThemedText>
              <Pressable
                className="p-2"
                onPress={() =>
                  updateInput({
                    intervalMultiplier: (input.intervalMultiplier ?? 1) + 1,
                  })
                }
              >
                <ChevronRightIcon color={colors.text} />
              </Pressable>
            </View>
          </View>
        )}
        {hostingFetching || feesFetching ? (
          <Skeleton style={{ height: 500, borderRadius: 18 }} />
        ) : (
          <View
            className="px-4 pb-4"
            style={{
              backgroundColor: hexToRgba(colors.text, 0.03),
              borderRadius: 16,
            }}
          >
            {calculated?.lineItems?.map((item) => (
              <CheckoutSummaryItem
                key={item.key}
                label={item.label}
                description={item.description}
                value={formatNaira(item.amount).formated}
              />
            ))}
            <CheckoutSummaryItem
              extraLarge
              bordered={false}
              label="Total Amount"
              value={formatNaira(calculated?.totalPayableAmount ?? 0).formated}
            />
          </View>
        )}
        <View
          className="flex-row gap-3 rounded-2xl p-4"
          style={{
            backgroundColor: hexToRgba(colors.secondary, 0.1),
          }}
        >
          <Info size={18} color={colors.secondary} style={{ marginTop: 2 }} />
          <ThemedText
            className="flex-1"
            style={{ fontSize: 13, lineHeight: 20, color: hexToRgba(colors.text, 0.8) }}
          >
            You won&apos;t be charged now. Once the host accepts your booking application,
            we&apos;ll send you a bill — you&apos;ll have{' '}
            {calculated?.paymentWindowDays
              ? `${calculated.paymentWindowDays} day${calculated.paymentWindowDays === 1 ? '' : 's'}`
              : 'a few days'}{' '}
            to complete payment, after which the spot may be offered to someone else.
          </ThemedText>
        </View>
      </View>
    </DetailsLayout>
  );
}

import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { BookingQuery, useCalculateHostingFeesQuery } from '@/lib/services/graphql/generated';
import React from 'react';
import DetailsLayout from '../layouts/details';
import { View } from 'react-native';
import Skeleton from '../atoms/a-skeleton';
import { hexToRgba } from '@/lib/utils/colors';
import CheckoutSummaryItem from '../molecules/m-checkout-summary-item';
import { formatNaira } from '@/lib/utils/currency';
import { hostingDuration } from '@/lib/utils/hosting/tenancyAgreement';
import { toTitleCase } from '@/lib/utils/text';

type Props = {
  booking?: BookingQuery['booking'];
  title?: string;
  footer?: React.ReactNode;
  header?: React.ReactNode;
  children?: React.ReactNode;
};

const CheckoutSummaryScreen: React.FC<Props> = ({ title, booking, footer, header, children }) => {
  const colors = useThemeColors();
  const [{ data, fetching }] = useCalculateHostingFeesQuery({
    variables: {
      hostingId: booking?.hosting.id ?? '',
      multiplier: booking?.bookingApplication.intervalMultiplier ?? 1,
    },
    pause: !booking || !booking.bookingApplication.intervalMultiplier,
  });

  const duration = React.useMemo(() => {
    const commencementDate = booking?.commencementDate;
    return hostingDuration(
      booking?.hosting.paymentInterval,
      booking?.bookingApplication.intervalMultiplier,
      commencementDate ? new Date(commencementDate) : undefined,
    );
  }, [booking]);

  const calculated = data?.calculateHostingFees;

  return (
    <DetailsLayout title={title} footer={footer}>
      <View className="mt-4 gap-6">
        {header}
        {fetching ? (
          <Skeleton style={{ height: 500, borderRadius: 18 }} />
        ) : (
          <View
            className="px-4 pb-4"
            style={{
              backgroundColor: hexToRgba(colors.text, 0.03),
              borderRadius: 16,
            }}
          >
            <CheckoutSummaryItem label="Duration" value={toTitleCase(duration.metric)} />
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
        {children}
      </View>
    </DetailsLayout>
  );
};

export default CheckoutSummaryScreen;

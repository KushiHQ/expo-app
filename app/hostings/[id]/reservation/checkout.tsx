import { PayWithFlutterwave } from 'flutterwave-react-native';
import { View } from 'react-native';
import { useUser } from '@/lib/hooks/user';
import CheckoutSummaryScreen from '@/components/screens/checkout-summary';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  PaymentStatus,
  useBookingQuery,
  useTransactionByReferenceQuery,
  useVerifyBookingPaymentMutation,
  useRetryBookingPaymentMutation,
} from '@/lib/services/graphql/generated';
import HostingSummaryCard from '@/components/molecules/m-hosting-summary-card';
import Skeleton from '@/components/atoms/a-skeleton';
import Button from '@/components/atoms/a-button';
import ThemedText from '@/components/atoms/a-themed-text';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import LoadingModal from '@/components/atoms/a-loading-modal';
import { toast } from '@/lib/hooks/use-toast';
import SuccessModal from '@/components/organisms/o-success-modal';
import React from 'react';
import { StreamlineUltimateReceipt } from '@/components/icons/i-receipt';
import { handleError } from '@/lib/utils/error';

export default function ReservationCheckout() {
  const user = useUser();
  const router = useRouter();
  const colors = useThemeColors();
  const { bkId, ref } = useLocalSearchParams();
  const [activeRef, setActiveRef] = React.useState(String(ref));
  const [pendingOpen, setPendingOpen] = React.useState(false);

  const flutterwaveOpen = React.useRef<(() => void) | null>(null);

  const [{ data: bookingData }] = useBookingQuery({
    variables: { bookingId: String(bkId) },
  });
  const [success, setSuccess] = React.useState(false);
  const [{ fetching: verifying, error }, verifyPayment] = useVerifyBookingPaymentMutation();
  const [{ fetching: refreshing }, refreshPayment] = useRetryBookingPaymentMutation();
  const [{ data: referenceData }] = useTransactionByReferenceQuery({
    variables: { reference: activeRef },
  });

  React.useEffect(() => {
    if (error) handleError(error);
  }, [error]);

  React.useEffect(() => {
    if (pendingOpen && flutterwaveOpen.current) {
      flutterwaveOpen.current();
      setPendingOpen(false);
    }
  }, [activeRef, pendingOpen]);

  function handleVerifyPayment(data: { status: string; tx_ref: string }) {
    if (data.status === 'cancelled') return;

    verifyPayment({ verifyBookingPaymentId: String(bkId) }).then((res) => {
      if (res.data?.verifyBookingPayment) {
        toast.show({
          type: 'success',
          text1: 'Success',
          text2: res.data.verifyBookingPayment.message,
        });
        if (res.data.verifyBookingPayment.data?.paymentStatus === PaymentStatus.Paid) {
          setSuccess(true);
        } else {
          router.replace('/bookings');
        }
      }
    });
  }

  function handlePayNow() {
    refreshPayment({ bookingId: String(bkId) }).then((res) => {
      if (res.error) {
        if (res.error?.message.includes('Payment has already been completed')) {
          handleVerifyPayment({ status: 'success', tx_ref: activeRef });
        } else {
          handleError(res.error);
        }
        return;
      }
      const freshRef = res.data?.retryBookingPayment?.data?.reference;
      if (!freshRef) return;
      if (freshRef !== activeRef) {
        setActiveRef(freshRef);
        setPendingOpen(true);
      } else {
        flutterwaveOpen.current?.();
      }
    });
  }

  return (
    <>
      <CheckoutSummaryScreen
        title="Checkout"
        booking={bookingData?.booking}
        header={
          <View className="mb-6">
            {bookingData?.booking.hosting ? (
              <HostingSummaryCard hosting={bookingData?.booking.hosting} />
            ) : (
              <Skeleton style={{ height: 120, borderRadius: 14 }} />
            )}
          </View>
        }
        footer={
          <View className="p-4 py-8">
            <PayWithFlutterwave
              onRedirect={handleVerifyPayment}
              options={{
                authorization: process.env.EXPO_PUBLIC_FLUTTERWAVE_PUBLIC_KEY ?? '',
                amount: Number(referenceData?.transactionByReference.amount ?? '0'),
                tx_ref: activeRef,
                currency: 'NGN',
                customer: {
                  email: user.user.email ?? '',
                  phonenumber: bookingData?.booking.phoneNumber,
                  name: user.user.user?.profile.fullName,
                },
                customizations: {
                  title: 'Kushi Booking',
                  description: `Payment for ${bookingData?.booking.hosting?.title}`,
                  logo: 'https://res.cloudinary.com/dev-media/image/upload/v1772369352/logo_miq5eq.png',
                },
              }}
              customButton={(props) => {
                flutterwaveOpen.current = props.onPress;
                return (
                  <Button
                    onPress={handlePayNow}
                    disabled={props.disabled || refreshing}
                    style={{ borderRadius: 14, backgroundColor: colors.accent }}
                  >
                    <ThemedText style={{ color: 'white' }}>
                      {refreshing ? 'Preparing...' : 'Pay Now'}
                    </ThemedText>
                  </Button>
                );
              }}
            />
          </View>
        }
      />
      <SuccessModal
        open={success}
        onClose={() => setSuccess(false)}
        title="Payment Successful"
        description={`Your reservation for "${bookingData?.booking.hosting.title}" is confirmed. You have a two-week period to finalize or cancel your booking, after which it will be automatically finalized. Upon finalization, refunds are solely subject to the terms of the signed tenancy agreement.`}
        action={
          <Button onPress={() => router.replace('/bookings')} type="primary" className="w-60">
            <View className="flex-row items-center gap-2">
              <StreamlineUltimateReceipt size={18} color={colors['primary-content']} />
              <ThemedText content="primary">View E-Recipet</ThemedText>
            </View>
          </Button>
        }
      />
      <LoadingModal visible={verifying || refreshing} />
    </>
  );
}

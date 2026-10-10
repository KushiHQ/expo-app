import { useEffect } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Spinner } from '@/components/k';
import { color } from '@/lib/k/theme';
import { useKBookingQuery } from '@/lib/services/graphql/generated';

/** Notifications reference bookings; Your homes is keyed by application. */
export default function BookingRedirect() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const [{ data, error }] = useKBookingQuery({ variables: { bookingId: id } });
	useEffect(() => {
		const app = data?.booking?.bookingApplication?.id;
		if (app) router.replace(`/trips/${app}`);
		else if (error || data) router.replace('/trips');
	}, [data, error]);
	return (
		<View style={{ flex: 1, backgroundColor: color.bg, alignItems: 'center', justifyContent: 'center' }}>
			<Spinner size="large" />
		</View>
	);
}

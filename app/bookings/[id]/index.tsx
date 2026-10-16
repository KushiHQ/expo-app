import { useLocalSearchParams } from 'expo-router';
import { BookingRedirect } from '@/components/k/booking';

/** Old booking page → the trip (guest) or the application (host). Kept for links, receipts and support cards. */
export default function OldBooking() {
	const { id } = useLocalSearchParams<{ id: string }>();
	return <BookingRedirect id={id} />;
}

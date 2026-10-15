import { useLocalSearchParams } from 'expo-router';
import { BookingRedirect } from '@/components/k/booking';

/** Notifications reference bookings; a trip is keyed by its application. Hosts go to the application. */
export default function BookingLink() {
	const { id } = useLocalSearchParams<{ id: string }>();
	return <BookingRedirect id={id} />;
}

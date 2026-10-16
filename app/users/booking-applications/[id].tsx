import { useLocalSearchParams } from 'expo-router';
import { ApplicationRedirect } from '@/components/k/booking';

/** Old application page (notifications, push) → the trip (guest) or the review screen (host). */
export default function OldApplication() {
	const { id } = useLocalSearchParams<{ id: string }>();
	return <ApplicationRedirect id={id} />;
}

import { useLocalSearchParams } from 'expo-router';
import { ApplicationReview } from '@/components/k/application-review';

/** Host review of one application (push notifications, the Applications tab and listing boards land here). */
export default function Review() {
	const { id } = useLocalSearchParams<{ id: string }>();
	return <ApplicationReview id={String(id)} />;
}

import { Redirect, useLocalSearchParams } from 'expo-router';

/** The old three-step reservation is now one guided application. */
export default function OldReservationStep() {
	const { id } = useLocalSearchParams<{ id: string }>();
	return <Redirect href={{ pathname: '/hostings/[id]/apply', params: { id: String(id) } }} />;
}

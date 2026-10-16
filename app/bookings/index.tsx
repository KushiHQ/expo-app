import { Redirect } from 'expo-router';

/** Old "My Bookings" list → Homes, which shows applications and bookings together. */
export default function OldBookings() {
	return <Redirect href="/trips" />;
}

import { Redirect } from 'expo-router';

/** Old URL — moved to /account/notifications. */
export default function Moved() {
	return <Redirect href="/account/notifications" />;
}

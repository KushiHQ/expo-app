import { Redirect } from 'expo-router';

/** Old URL — moved to /account/payments. */
export default function Moved() {
	return <Redirect href="/account/payments" />;
}

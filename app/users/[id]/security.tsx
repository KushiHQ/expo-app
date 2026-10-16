import { Redirect } from 'expo-router';

/** Old URL — moved to /account/security. */
export default function Moved() {
	return <Redirect href="/account/security" />;
}

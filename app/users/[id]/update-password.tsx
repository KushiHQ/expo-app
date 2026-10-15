import { Redirect } from 'expo-router';

/** Old URL — moved to /account/password. */
export default function Moved() {
	return <Redirect href="/account/password" />;
}

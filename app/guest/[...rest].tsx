import { Redirect } from 'expo-router';

/** Old guest-tab URLs (/guest/home, /guest/saved…) now live at the root tabs. */
export default function LegacyGuest() {
	return <Redirect href="/" />;
}

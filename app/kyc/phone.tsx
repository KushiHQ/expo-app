import { Redirect } from 'expo-router';

/** Old URL — the verification journey lives at /verify/phone. */
export default function KycRedirect() {
	return <Redirect href="/verify/phone" />;
}

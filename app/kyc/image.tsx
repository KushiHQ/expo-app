import { Redirect } from 'expo-router';

/** Old URL — the verification journey lives at /verify/selfie. */
export default function KycRedirect() {
	return <Redirect href="/verify/selfie" />;
}

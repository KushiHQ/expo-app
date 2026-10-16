import { Redirect } from 'expo-router';

/** Old URL — the verification journey lives at /verify/nin. */
export default function KycRedirect() {
	return <Redirect href="/verify/nin" />;
}

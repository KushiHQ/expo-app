import { Redirect, useLocalSearchParams } from 'expo-router';

/** Old per-listing review route — the single review screen is /applications/[id]. */
export default function LegacyApplication() {
	const { applicationId } = useLocalSearchParams<{ applicationId: string }>();
	return <Redirect href={{ pathname: '/applications/[id]', params: { id: String(applicationId) } }} />;
}

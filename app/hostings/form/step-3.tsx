import { Redirect, useLocalSearchParams, type Href } from 'expo-router';

/** Old wizard route, kept for links and notifications. The flow now lives at /hostings/form/location. */
export default function OldStep() {
	const { id } = useLocalSearchParams<{ id?: string }>();
	return <Redirect href={(id ? `/hostings/form/location?id=${id}` : '/hostings/form/location') as Href} />;
}

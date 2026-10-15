import { Redirect, useLocalSearchParams, type Href } from 'expo-router';

/** Old wizard route, kept for links and notifications. The flow now lives at /hostings/form/price. */
export default function OldStep() {
	const { id } = useLocalSearchParams<{ id?: string }>();
	return <Redirect href={(id ? `/hostings/form/price?id=${id}` : '/hostings/form/price') as Href} />;
}

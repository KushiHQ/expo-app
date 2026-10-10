import { Redirect, useLocalSearchParams } from 'expo-router';

// Interim: the redesigned apply flow replaces this.
export default function Apply() {
	const { id } = useLocalSearchParams<{ id: string }>();
	return <Redirect href={{ pathname: '/hostings/[id]/reservation/checkout-summary', params: { id } }} />;
}

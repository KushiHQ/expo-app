import { Redirect } from 'expo-router';

// Interim: hosting mode lands on the current dashboard until it's rebuilt.
export default function HostHome() {
	return <Redirect href="/host/analytics" />;
}

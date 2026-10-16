import { Redirect } from 'expo-router';

/** Old URL — moved to /notifications. */
export default function Moved() {
	return <Redirect href="/notifications" />;
}

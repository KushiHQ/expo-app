import { Redirect } from 'expo-router';

/** Old URL — moved to /account/feedback. */
export default function Moved() {
	return <Redirect href="/account/feedback" />;
}

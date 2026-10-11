import { Redirect } from 'expo-router';

/** `/auth` was linked to by guards but never existed — it now lands on sign in. */
export default function AuthIndex() {
	return <Redirect href="/auth/sign-in" />;
}

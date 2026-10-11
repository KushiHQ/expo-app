import { Redirect, useLocalSearchParams } from 'expo-router';

/** The reset flow lives on one screen. */
export default function ResetPassword() {
	const { email } = useLocalSearchParams<{ email?: string }>();
	return <Redirect href={{ pathname: '/auth/forgot-password', params: { email: email ?? '' } }} />;
}

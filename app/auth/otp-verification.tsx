import { Redirect, useLocalSearchParams } from 'expo-router';

/** Verification now happens inside sign-up. */
export default function OtpVerification() {
	const { email } = useLocalSearchParams<{ email?: string }>();
	return <Redirect href={{ pathname: '/auth/sign-up', params: { email: email ?? '', verify: '1' } }} />;
}

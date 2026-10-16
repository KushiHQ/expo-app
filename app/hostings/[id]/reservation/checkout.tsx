import { Redirect, useLocalSearchParams } from 'expo-router';

/** Old checkout → the escrow payment screen. */
export default function OldCheckout() {
	const { bkId, ref } = useLocalSearchParams<{ bkId?: string; ref?: string }>();
	if (!bkId) return <Redirect href="/trips" />;
	return <Redirect href={{ pathname: '/pay', params: ref ? { bkId, ref } : { bkId } }} />;
}

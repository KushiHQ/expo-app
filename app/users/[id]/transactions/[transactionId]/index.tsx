import { Redirect, useLocalSearchParams } from 'expo-router';

/** Old URL — receipts moved to /account/payments/[ref]. */
export default function Moved() {
	const { transactionId } = useLocalSearchParams<{ transactionId: string }>();
	return <Redirect href={{ pathname: '/account/payments/[ref]', params: { ref: String(transactionId ?? '') } }} />;
}

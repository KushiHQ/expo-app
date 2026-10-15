import { Stack } from 'expo-router';
import { AuthGuard } from '@/components/guards/auth-guard';
import { STACK_SCREEN_OPTIONS } from '@/lib/constants/navigation';

/** Verification journey: hub (index) + one screen per step. */
export default function VerifyLayout() {
	return (
		<AuthGuard>
			<Stack screenOptions={STACK_SCREEN_OPTIONS} />
		</AuthGuard>
	);
}

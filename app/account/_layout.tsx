import { Stack } from 'expo-router';
import { AuthGuard } from '@/components/guards/auth-guard';
import { STACK_SCREEN_OPTIONS } from '@/lib/constants/navigation';

/** Account & settings reached from the You tab: security, password, notification preferences, payments, feedback, deletion. */
export default function AccountLayout() {
	return (
		<AuthGuard>
			<Stack screenOptions={STACK_SCREEN_OPTIONS} />
		</AuthGuard>
	);
}

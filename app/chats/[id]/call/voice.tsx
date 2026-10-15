import { useLocalSearchParams } from 'expo-router';
import { CallStage } from '@/components/k/call';
import { useActiveCall } from '@/lib/hooks/call';

/** Voice call (outgoing, incoming from push/CallKeep, or answered from the lock screen). */
export default function VoiceCall() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const call = useActiveCall();
	return <CallStage c={call} chatId={String(id)} />;
}

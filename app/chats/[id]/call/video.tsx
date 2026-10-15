import { useLocalSearchParams } from 'expo-router';
import { CallStage } from '@/components/k/call';
import { useActiveCall } from '@/lib/hooks/call';

/** Video call — same stage as voice with camera controls and picture-in-picture. */
export default function VideoCall() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const call = useActiveCall();
	return <CallStage c={call} chatId={String(id)} video />;
}

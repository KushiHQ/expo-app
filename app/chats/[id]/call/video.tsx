import ChatVideoCallScreen from '@/components/screens/video-call';
import { useActiveCall } from '@/lib/hooks/call';

export default function ChatVideoCall() {
  const callData = useActiveCall();

  return <ChatVideoCallScreen callData={callData} />;
}

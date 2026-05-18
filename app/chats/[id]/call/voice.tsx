import React from 'react';
import { useActiveCall } from '@/lib/hooks/call';
import CallScreen from '@/components/screens/call';

export default function ChatCall() {
  const callData = useActiveCall();

  return <CallScreen callData={callData} />;
}

import { useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Button, Eyebrow, Header, KText, Screen } from '@/components/k';
import { PhoneStep } from '@/components/k/verify/nin-phone';
import { backToHub, useVerification } from '@/components/k/kyc';

/** Step 3: a verified phone number (SMS code). */
export default function VerifyPhone() {
	const { next } = useLocalSearchParams<{ next?: string }>();
	const [phone, setPhone] = useState('');
	const v = useVerification();
	const done = v.steps.find((s) => s.key === 'phone')?.done;

	return (
		<Screen
			header={<Header eyebrow="Step 3 · Phone" title="Verify your phone" />}
			width="form"
			keyboard
			footer={<Button title={done ? 'Done' : 'Back to verification'} variant={done ? 'amber' : 'ghost'} size="lg" block onPress={() => backToHub(next)} testID="phone-done" />}
		>
			<View style={{ gap: 8, paddingTop: 20 }}>
				<Eyebrow>Phone number</Eyebrow>
				<KText v="title">So your host can reach you after you pay.</KText>
				<KText v="small">Enter a Nigerian number and we’ll text you a 6-digit code. Hosts see your number only once a booking is paid.</KText>
			</View>
			<PhoneStep value={phone} onChange={setPhone} />
			<KText v="xs">Code not arriving? Check the number and wait a minute, then tap “Change number” to send another. DND on your line can delay texts.</KText>
		</Screen>
	);
}

import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Eyebrow, Header, KText, Notice, Screen } from '@/components/k';
import { IdNumberStep, PrivacyNote, Tips, backToHub, useVerification } from '@/components/k/kyc';
import { toast } from '@/lib/hooks/use-toast';

/** Step 2: NIN, matched against the selfie by Dojah. */
export default function VerifyNin() {
	const { next } = useLocalSearchParams<{ next?: string }>();
	const v = useVerification();
	const selfie = v.steps.find((s) => s.key === 'selfie')?.done;

	return (
		<Screen header={<Header eyebrow="Step 2 · NIN" title="Confirm your NIN" />} width="form" keyboard>
			<View style={{ gap: 8, paddingTop: 20 }}>
				<Eyebrow>National Identity Number</Eyebrow>
				<KText v="title">Enter the 11 digits from your NIN slip or the NIMC app.</KText>
				<KText v="small">We check it with NIMC and compare the photo on record with your selfie.</KText>
			</View>
			{v.identityVerified ? (
				<>
					<Notice tone="success" title="Your NIN is verified">
						Nothing more to do here.
					</Notice>
					<Button title="Back to verification" variant="ghost" block onPress={() => backToHub(next)} />
				</>
			) : !selfie && !v.loading ? (
				<>
					<Notice tone="warn" title="Take your selfie first">
						The NIN check compares your selfie with the photo NIMC has on record.
					</Notice>
					<Button title="Take my selfie" size="lg" block onPress={() => router.replace({ pathname: '/verify/selfie', params: next ? { next } : {} })} />
				</>
			) : (
				<IdNumberStep
					kind="nin"
					onDone={() => {
						toast.show({ type: 'success', text1: 'NIN verified', text2: 'Your identity is confirmed.' });
						backToHub(next);
					}}
				/>
			)}
			<View style={{ gap: 10 }}>
				<KText v="smallStrong">Don’t have your NIN to hand?</KText>
				<Tips items={['Dial *346# from the phone line you used to register your NIN.', 'Or open the NIMC MWS app — your NIN is on the home screen.', 'Use the 11-digit NIN, not the tracking ID on your enrolment slip.']} />
			</View>
			<PrivacyNote compact />
		</Screen>
	);
}

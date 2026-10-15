import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Eyebrow, Header, KText, Notice, Screen } from '@/components/k';
import { IdNumberStep, PrivacyNote, Tips, backToHub, useVerification } from '@/components/k/kyc';
import { toast } from '@/lib/hooks/use-toast';

/** Step 4: BVN — required to host and receive payouts, optional for renters. */
export default function VerifyBvn() {
	const { next } = useLocalSearchParams<{ next?: string }>();
	const v = useVerification();
	const done = v.steps.find((s) => s.key === 'bvn')?.done;
	const selfie = v.steps.find((s) => s.key === 'selfie')?.done;

	return (
		<Screen header={<Header eyebrow={v.host ? 'Step 4 · BVN' : 'Step 4 · BVN · optional'} title="Confirm your BVN" />} width="form" keyboard>
			<View style={{ gap: 8, paddingTop: 20 }}>
				<Eyebrow>Bank Verification Number</Eyebrow>
				<KText v="title">{v.host ? 'Needed before you can list and get paid.' : 'Only needed if you plan to host.'}</KText>
				<KText v="small">Your BVN lets Kushi confirm that the bank account your payouts go to is yours. It gives no one access to your money.</KText>
			</View>
			{done ? (
				<>
					<Notice tone="success" title="Your BVN is verified">
						Nothing more to do here.
					</Notice>
					<Button title="Back to verification" variant="ghost" block onPress={() => backToHub(next)} />
				</>
			) : !selfie && !v.loading ? (
				<>
					<Notice tone="warn" title="Take your selfie first">
						The BVN check compares your selfie with the photo your bank has on record.
					</Notice>
					<Button title="Take my selfie" size="lg" block onPress={() => router.replace({ pathname: '/verify/selfie', params: next ? { next } : {} })} />
				</>
			) : (
				<IdNumberStep
					kind="bvn"
					onDone={() => {
						toast.show({ type: 'success', text1: 'BVN verified', text2: 'Saved to your verification.' });
						backToHub(next);
					}}
				/>
			)}
			<View style={{ gap: 10 }}>
				<KText v="smallStrong">Find your BVN</KText>
				<Tips items={['Dial *565*0# from the phone number linked to your bank account.', 'It’s also in your bank app, usually under Profile or Account details.']} />
			</View>
			<PrivacyNote compact />
		</Screen>
	);
}

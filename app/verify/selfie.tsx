import { useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Glasses, Lightbulb, ScanFace, Smile } from 'lucide-react-native';
import { Button, Card, Eyebrow, Header, KText, Notice, Screen } from '@/components/k';
import { PrivacyNote, backToHub } from '@/components/k/kyc';
import { Selfie } from '@/components/k/verify/selfie';
import { color } from '@/lib/k/theme';
import { toast } from '@/lib/hooks/use-toast';
import { useUserStore } from '@/lib/stores/users';

const TIPS = [
	{ I: Lightbulb, t: 'Face a window or a light. No bright light behind you.' },
	{ I: Glasses, t: 'Take off glasses, caps and face coverings.' },
	{ I: Smile, t: 'Look straight at the camera with a neutral face.' },
	{ I: ScanFace, t: 'Fit your face inside the oval. The button turns on when we can see you.' }
];

/** Step 1: selfie, with guidance before the camera opens. */
export default function VerifySelfie() {
	const { next } = useLocalSearchParams<{ next?: string }>();
	const onFile = useUserStore((s) => !!s.user.user?.kyc?.image);
	const [camera, setCamera] = useState(false);

	return (
		<Screen
			header={<Header eyebrow="Step 1 · Selfie" title="Take a selfie" />}
			width="form"
			footer={camera ? undefined : <Button title={onFile ? 'Retake my selfie' : 'Open camera'} size="lg" block onPress={() => setCamera(true)} testID="selfie-open-camera" />}
		>
			{camera ? (
				<View style={{ gap: 14, paddingTop: 16 }}>
					<Selfie
						onDone={() => {
							toast.show({ type: 'success', text1: 'Selfie saved', text2: 'Next, confirm your NIN.' });
							backToHub(next);
						}}
					/>
					<KText v="xs" center>
						If the button stays off, move closer to the light and hold the phone at eye level.
					</KText>
				</View>
			) : (
				<>
					<View style={{ gap: 8, paddingTop: 20 }}>
						<Eyebrow>Why a selfie</Eyebrow>
						<KText v="title">We match it to the photo on your NIN.</KText>
						<KText v="small">It proves the ID belongs to you. It takes under a minute and you only do it once.</KText>
					</View>
					{onFile ? (
						<Notice tone="success" title="We already have your selfie">
							Retake it only if your NIN or BVN check said the photos didn’t match.
						</Notice>
					) : null}
					<Card>
						<KText v="heading">For a photo that passes first time</KText>
						{TIPS.map(({ I, t }) => (
							<View key={t} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
								<I size={18} color={color.amber} />
								<KText v="small" c="fg" style={{ flex: 1 }}>
									{t}
								</KText>
							</View>
						))}
					</Card>
					<KText v="xs">Kushi uses your camera only for this photo. You can turn camera access off in your phone’s Settings afterwards.</KText>
					<PrivacyNote compact />
				</>
			)}
		</Screen>
	);
}

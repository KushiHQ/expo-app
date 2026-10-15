import { useState } from 'react';
import { Platform, View } from 'react-native';
import { router } from 'expo-router';
import { KeyRound, LogOut, Mail, Smartphone } from 'lucide-react-native';
import { Button, Eyebrow, Header, KText, Notice, Row, Screen, Sheet } from '@/components/k';
import { Group } from '@/components/k/settings';
import { color } from '@/lib/k/theme';
import { useUserStore } from '@/lib/stores/users';

/** Security: password, this device, and how to lock things down. */
export default function Security() {
	const email = useUserStore((s) => s.user.user?.email);
	const [signOut, setSignOut] = useState(false);
	const device = Platform.OS === 'ios' ? (Platform.isPad ? 'This iPad' : 'This iPhone') : 'This phone';

	return (
		<Screen header={<Header eyebrow="You" title="Security" />} width="form">
			<View style={{ gap: 8, paddingTop: 20 }}>
				<Eyebrow>Keep your account safe</Eyebrow>
				<KText v="small">Kushi never asks for your password, OTP codes or bank PIN by phone, WhatsApp or email. If someone does, it isn’t us.</KText>
			</View>

			<Group title="Sign-in">
				<Row icon={<Mail size={17} color={color.fg2} />} title="Email" detail={email ?? '—'} />
				<Row icon={<KeyRound size={17} color={color.fg2} />} title="Change password" detail="We email you a code to confirm it’s you" onPress={() => router.push('/account/password')} testID="security-password" />
			</Group>

			<Group title="Devices" note="Kushi can’t list your other signed-in devices yet. If you think someone else is using your account, change your password and contact support.">
				<Row icon={<Smartphone size={17} color={color.fg2} />} title={device} detail="Signed in now" />
				<Row icon={<LogOut size={17} color={color.fg2} />} title="Sign out of this device" onPress={() => setSignOut(true)} testID="security-sign-out" />
			</Group>

			<Notice tone="info" title="Something look wrong?">
				If you didn’t make a payment, booking or change you see in your account, contact Kushi Support straight away.
			</Notice>
			<Button title="Contact support" variant="ghost" block onPress={() => router.push('/support')} />

			<Sheet open={signOut} onClose={() => setSignOut(false)} eyebrow="Sign out" title="Sign out of Kushi?">
				<KText v="small">You’ll need your email and password (or Google/Apple) to sign back in. Nothing in your account is deleted.</KText>
				<Button title="Sign out" variant="danger" size="lg" block onPress={() => {
						setSignOut(false);
						router.replace('/logout');
					}}
				/>
				<Button title="Stay signed in" variant="ghost" size="lg" block onPress={() => setSignOut(false)} />
			</Sheet>
		</Screen>
	);
}

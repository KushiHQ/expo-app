import { useState } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { BadgeCheck } from 'lucide-react-native';
import { Button, Card, Divider, Eyebrow, Header, KText, Screen } from '@/components/k';
import { IdentityCheck } from '@/components/k/verify/identity';
import { NinStep, PhoneStep } from '@/components/k/verify/nin-phone';
import { color } from '@/lib/k/theme';
import { useUserStore } from '@/lib/stores/users';
import { UserType } from '@/lib/types/users';

/** Identity, phone and (for hosts) BVN — one place, skipping what's already done. */
export default function Verify() {
	const { next } = useLocalSearchParams<{ next?: string }>();
	const kyc = useUserStore((s) => s.user.user?.kyc);
	const host = useUserStore((s) => s.user.userType === UserType.Host);
	const [phone, setPhone] = useState('');
	const [bvnOpen, setBvnOpen] = useState(false);
	const done = () => (next ? router.replace(next as never) : router.back());

	return (
		<Screen header={<Header title="Verification" />} keyboard width="form">
			<View style={{ gap: 8, paddingTop: 20 }}>
				<Eyebrow>Verify once</Eyebrow>
				<KText v="display">Then apply anywhere in minutes.</KText>
				<KText v="small">Kushi checks every renter and host once. It protects you from fraud and puts your verified name on agreements.</KText>
			</View>

			<Card>
				<KText v="heading">Identity</KText>
				{kyc?.ninVerified ? (
					<View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
						<BadgeCheck size={18} color={color.success} />
						<KText v="small" c="fg">
							Verified with your NIN and selfie.
						</KText>
					</View>
				) : (
					<IdentityCheck onVerified={() => (next ? done() : undefined)} />
				)}
			</Card>

			<Card>
				<KText v="heading">Phone number</KText>
				<KText v="small">Applications use a verified number so your host can reach you after you pay.</KText>
				<PhoneStep value={phone} onChange={setPhone} />
			</Card>

			<Card>
				<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
					<KText v="heading">Bank Verification Number</KText>
					<KText v="micro" c={kyc?.bvnVerified ? 'success' : host ? 'amber' : 'muted'}>
						{kyc?.bvnVerified ? 'Verified' : host ? 'Needed to host' : 'Optional'}
					</KText>
				</View>
				{kyc?.bvnVerified ? null : !kyc?.image ? (
					<KText v="small">Take your selfie first — the BVN check uses the same photo.</KText>
				) : bvnOpen ? (
					<NinStep kind="bvn" onDone={() => setBvnOpen(false)} />
				) : (
					<>
						<KText v="small">Hosts need a verified BVN to list a property and receive payouts.</KText>
						<Button title="Verify BVN" variant="ghost" onPress={() => setBvnOpen(true)} />
					</>
				)}
			</Card>

			<Divider />
			<Button title={next ? 'Continue' : 'Done'} size="lg" block onPress={done} disabled={!!next && !kyc?.ninVerified} />
		</Screen>
	);
}

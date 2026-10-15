import { useState } from 'react';
import { Linking, View } from 'react-native';
import { Pressable } from '@/components/k/pressable';
import { router } from 'expo-router';
import { BadgeCheck, Bell, Building2, CreditCard, FileText, Headset, LogOut, MessageSquareHeart, ShieldCheck, Trash2, UserRound } from 'lucide-react-native';
import { Avatar, Button, Card, Divider, Eyebrow, KText, PageTitle, Row, Screen, Sheet } from '@/components/k';
import { Contours } from '@/components/k/contours';
import { color, radius } from '@/lib/k/theme';
import { useUserStore } from '@/lib/stores/users';
import { UserType } from '@/lib/types/users';
import { toast } from '@/lib/hooks/use-toast';
import { useDeleteAccountMutation } from '@/lib/services/graphql/generated';

const WEB = 'https://housing.kushi.ng';

export function You({ mode = 'guest' }: { mode?: 'guest' | 'host' }) {
	const { user, updateUser } = useUserStore();
	const me = user.user;
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [{ fetching: deleting }, deleteAccount] = useDeleteAccountMutation();

	function switchMode() {
		if (!me?.id) return router.push('/auth/sign-in');
		if (mode === 'host') {
			updateUser({ userType: UserType.Guest });
			router.replace('/');
		} else {
			updateUser({ userType: UserType.Host });
			router.replace('/host');
		}
	}

	if (!me?.id)
		return (
			<Screen tabbed width="form">
				<PageTitle eyebrow="You" title="Welcome to Kushi" sub="Sign in to apply for homes, message hosts and keep track of everything in one place." />
				<Button title="Sign in" size="lg" block onPress={() => router.push('/auth/sign-in')} testID="you-sign-in" />
				<Button title="Create an account" variant="ghost" size="lg" block onPress={() => router.push('/auth/sign-up')} />
				<HostCard onPress={() => router.push('/auth/sign-up')} />
				<Legal />
			</Screen>
		);

	const verified = !!me.kyc?.ninVerified;
	return (
		<Screen tabbed width="form">
			<View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, paddingTop: 16 }}>
				<Avatar name={me.profile?.fullName} uri={me.profile?.image?.publicUrl} size={72} />
				<View style={{ flex: 1, gap: 4 }}>
					<KText v="title" numberOfLines={1}>
						{me.profile?.fullName ?? 'Your profile'}
					</KText>
					<KText v="small" numberOfLines={1}>
						{me.email}
					</KText>
					{verified ? (
						<View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
							<BadgeCheck size={14} color={color.success} />
							<KText v="xs" c="success">
								Identity verified
							</KText>
						</View>
					) : null}
				</View>
			</View>

			{!verified ? (
				<Card tone="amber" onPress={() => router.push('/verify')}>
					<View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
						<ShieldCheck size={22} color={color.amber} />
						<View style={{ flex: 1 }}>
							<KText v="bodyStrong">Verify your identity</KText>
							<KText v="small">A one-minute selfie + NIN check. Needed before you can apply for a home.</KText>
						</View>
					</View>
				</Card>
			) : null}

			<HostCard onPress={switchMode} host={mode === 'host'} />

			<View>
				<Eyebrow>Account</Eyebrow>
				<Row icon={<UserRound size={17} color={color.fg2} />} title="Personal details" detail="Name, photo and contact" onPress={() => router.push(`/users/${me.id}/profile/edit`)} />
				<Divider />
				<Row icon={<ShieldCheck size={17} color={color.fg2} />} title="Verification" detail={verified ? 'Identity verified' : 'Selfie, NIN and phone'} onPress={() => router.push('/verify')} />
				<Divider />
				<Row icon={<CreditCard size={17} color={color.fg2} />} title="Payments" detail="Receipts and references" onPress={() => router.push(`/users/${me.id}/transactions`)} />
				<Divider />
				<Row icon={<Bell size={17} color={color.fg2} />} title="Notifications" detail="What Kushi sends you" onPress={() => router.push(`/users/${me.id}/notification-settings`)} />
			</View>

			<View>
				<Eyebrow>Help</Eyebrow>
				<Row icon={<Headset size={17} color={color.fg2} />} title="Kushi Support" detail="Chat with a real person" onPress={() => router.push('/support')} />
				<Divider />
				<Row icon={<MessageSquareHeart size={17} color={color.fg2} />} title="Share feedback" detail="Tell us what to improve" onPress={() => router.push('/users/feedback')} />
			</View>

			<Legal />

			<View>
				<Row icon={<LogOut size={17} color={color.fg2} />} title="Sign out" onPress={() => router.push('/logout')} />
				<Divider />
				<Row icon={<Trash2 size={17} color={color.danger} />} title="Delete account" danger onPress={() => setConfirmDelete(true)} />
			</View>

			<Sheet open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete your account?" eyebrow="This can’t be undone">
				<KText v="small">This permanently removes your profile, saved homes and messages. Active bookings and records we must keep by law are retained.</KText>
				<Button
					title="Delete my account"
					variant="danger"
					size="lg"
					block
					loading={deleting}
					onPress={async () => {
						const r = await deleteAccount({});
						if (r.error) return toast.show({ type: 'error', text1: 'Couldn’t delete', text2: r.error.message.replace('[GraphQL] ', '') });
						setConfirmDelete(false);
						router.replace('/logout');
					}}
				/>
				<Button title="Keep my account" variant="ghost" size="lg" block onPress={() => setConfirmDelete(false)} />
			</Sheet>
		</Screen>
	);
}

function HostCard({ onPress, host }: { onPress: () => void; host?: boolean }) {
	return (
		<Pressable onPress={onPress} style={({ pressed }) => [{ borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: color.line2, backgroundColor: color.bg2 }, pressed && { opacity: 0.85 }]}>
			<View style={{ height: 120 }}>
				<Contours seed={3} opacity={0.6} />
			</View>
			<View style={{ padding: 16, gap: 6, flexDirection: 'row', alignItems: 'center' }}>
				<View style={{ flex: 1, gap: 4 }}>
					<KText v="heading">{host ? 'Switch to renting' : 'Switch to hosting'}</KText>
					<KText v="small">{host ? 'Find a home, track your applications and pay rent.' : 'List a property, review verified renters and get paid through escrow.'}</KText>
				</View>
				<Building2 size={24} color={color.amber} />
			</View>
		</Pressable>
	);
}

function Legal() {
	const open = (p: string) => Linking.openURL(`${WEB}${p}`);
	return (
		<View>
			<Eyebrow>Legal</Eyebrow>
			<Row icon={<FileText size={17} color={color.fg2} />} title="Terms of Service" onPress={() => open('/legal/terms-of-service')} />
			<Divider />
			<Row icon={<FileText size={17} color={color.fg2} />} title="Privacy Policy" onPress={() => open('/legal/privacy-policy')} />
			<Divider />
			<Row icon={<FileText size={17} color={color.fg2} />} title="Cancellation & caution policies" onPress={() => open('/legal/booking-cancellation-policy')} />
		</View>
	);
}

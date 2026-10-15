import { useState } from 'react';
import { View } from 'react-native';
import { Pressable } from '@/components/k/pressable';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import { BadgeCheck, Bell, Building2, ChevronRight, CreditCard, FileText, Headset, KeyRound, LogOut, MessageSquareHeart, ShieldCheck, Trash2, UserRound } from 'lucide-react-native';
import { Avatar, Button, Card, KText, PageTitle, Row, Screen, Sheet } from '@/components/k';
import { Contours } from '@/components/k/contours';
import { Group, LinkRow } from '@/components/k/settings';
import { VerifyProgress, useVerification } from '@/components/k/kyc';
import { color, radius } from '@/lib/k/theme';
import { useLayout } from '@/lib/k/layout';
import { LINKS } from '@/lib/k/account';
import { useUserStore } from '@/lib/stores/users';
import { UserType } from '@/lib/types/users';

/** The You tab: profile, verification status and every account setting in one tidy list. */
export function You({ mode = 'guest' }: { mode?: 'guest' | 'host' }) {
	const { user, updateUser } = useUserStore();
	const me = user.user;
	const layout = useLayout();
	const [confirmSignOut, setConfirmSignOut] = useState(false);

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

	const two = layout.expanded;
	const side = (
		<>
			<Pressable
				testID="you-profile"
				accessibilityRole="button"
				accessibilityLabel={`${me.profile?.fullName ?? 'Your profile'}. Edit personal details`}
				onPress={() => router.push(`/users/${me.id}/profile/edit`)}
				style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: 16, paddingTop: 16 }, pressed && { opacity: 0.8 }]}
			>
				<Avatar name={me.profile?.fullName} uri={me.profile?.image?.publicUrl} size={72} />
				<View style={{ flex: 1, gap: 4 }}>
					<KText v="title" numberOfLines={1}>
						{me.profile?.fullName ?? 'Your profile'}
					</KText>
					<KText v="small" numberOfLines={1}>
						{me.email}
					</KText>
					<KText v="xs" c="amber">
						Edit personal details
					</KText>
				</View>
				<ChevronRight size={18} color={color.dim} />
			</Pressable>
			<VerificationCard />
			<HostCard onPress={switchMode} host={mode === 'host'} />
		</>
	);
	const settings = (
		<>
			<Group title="Account">
				<Row icon={<UserRound size={17} color={color.fg2} />} title="Personal details" detail="Name, photo and contact" onPress={() => router.push(`/users/${me.id}/profile/edit`)} testID="you-personal" />
				<Row icon={<ShieldCheck size={17} color={color.fg2} />} title="Verification" detail="Selfie, NIN, phone and BVN" onPress={() => router.push('/verify')} testID="you-verification" />
				<Row icon={<KeyRound size={17} color={color.fg2} />} title="Security" detail="Password and signed-in device" onPress={() => router.push('/account/security')} testID="you-security" />
				<Row icon={<Bell size={17} color={color.fg2} />} title="Notifications" detail="What Kushi sends you" onPress={() => router.push('/account/notifications')} testID="you-notifications" />
				<Row icon={<CreditCard size={17} color={color.fg2} />} title="Payments & receipts" detail="Escrow, refunds and payouts" onPress={() => router.push('/account/payments')} testID="you-payments" />
				<Row icon={<UserRound size={17} color={color.fg2} />} title="Your public profile" detail="What hosts and renters see" onPress={() => router.push(`/users/${me.id}`)} testID="you-public-profile" />
			</Group>

			<Group title="Help">
				<Row icon={<Headset size={17} color={color.fg2} />} title="Kushi Support" detail="Chat with a real person" onPress={() => router.push('/support')} testID="you-support" />
				<Row icon={<MessageSquareHeart size={17} color={color.fg2} />} title="Share feedback" detail="Tell us what to improve" onPress={() => router.push('/account/feedback')} testID="you-feedback" />
			</Group>

			<Legal />

			<Group>
				<Row icon={<LogOut size={17} color={color.fg2} />} title="Sign out" onPress={() => setConfirmSignOut(true)} testID="you-sign-out" />
				<Row icon={<Trash2 size={17} color={color.danger} />} title="Delete account" danger onPress={() => router.push('/account/delete')} testID="you-delete" />
			</Group>
			<KText v="xs" center>
				Kushi Housing {Constants.expoConfig?.version ?? ''}
			</KText>
		</>
	);

	return (
		<Screen tabbed width={two ? 'content' : 'form'}>
			{two ? (
				<View style={{ flexDirection: 'row', gap: 32, alignItems: 'flex-start' }}>
					<View style={{ width: 360, gap: 20 }}>{side}</View>
					<View style={{ flex: 1, gap: 20, paddingTop: 16, maxWidth: 560 }}>{settings}</View>
				</View>
			) : (
				<>
					{side}
					{settings}
				</>
			)}

			<Sheet open={confirmSignOut} onClose={() => setConfirmSignOut(false)} title="Sign out of Kushi?" eyebrow="Sign out">
				<KText v="small">You’ll need your email and password (or Google/Apple) to sign back in. Nothing in your account is deleted.</KText>
				<Button
					title="Sign out"
					variant="danger"
					size="lg"
					block
					onPress={() => {
						setConfirmSignOut(false);
						router.push('/logout');
					}}
					testID="you-sign-out-confirm"
				/>
				<Button title="Stay signed in" variant="ghost" size="lg" block onPress={() => setConfirmSignOut(false)} />
			</Sheet>
		</Screen>
	);
}

/** Verification status: a badge when done, progress and the next step when not. */
function VerificationCard() {
	const v = useVerification();
	if (v.complete)
		return (
			<Card onPress={() => router.push('/verify')}>
				<View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
					<BadgeCheck size={22} color={color.success} />
					<View style={{ flex: 1, gap: 2 }}>
						<KText v="bodyStrong">You’re verified</KText>
						<KText v="xs">{v.host ? 'Identity and BVN confirmed — you can list and get paid.' : 'Hosts see a verified-renter badge when you apply.'}</KText>
					</View>
					<ChevronRight size={18} color={color.dim} />
				</View>
			</Card>
		);
	return (
		<Card tone="amber" onPress={() => router.push('/verify')}>
			<View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
				<ShieldCheck size={22} color={color.amber} />
				<View style={{ flex: 1, gap: 2 }}>
					<KText v="bodyStrong">{v.doneCount ? 'Finish verifying your identity' : 'Verify your identity'}</KText>
					<KText v="small">{v.host ? 'Needed before you can list a property and receive payouts.' : 'About 3 minutes. Needed before you can apply for a home.'}</KText>
				</View>
			</View>
			<VerifyProgress done={v.doneCount} total={v.requiredCount} />
			{v.next ? (
				<KText v="xs" c="fg2">
					Next: {v.next.blockedBy ? 'Take a selfie' : v.next.title}
				</KText>
			) : null}
		</Card>
	);
}

function HostCard({ onPress, host }: { onPress: () => void; host?: boolean }) {
	return (
		<Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [{ borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: color.line2, backgroundColor: color.bg2 }, pressed && { opacity: 0.85 }]}>
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
	return (
		<Group title="Legal">
			<LinkRow icon={<FileText size={17} color={color.fg2} />} title="Privacy policy" detail="kushi.ng/privacy" url={LINKS.privacy} testID="you-privacy" />
			<LinkRow icon={<FileText size={17} color={color.fg2} />} title="Terms of service" detail="kushi.ng/terms" url={LINKS.terms} testID="you-terms" />
			<LinkRow icon={<FileText size={17} color={color.fg2} />} title="Cancellation & caution policies" url={LINKS.cancellation} />
		</Group>
	);
}

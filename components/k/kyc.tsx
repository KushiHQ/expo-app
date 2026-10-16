/**
 * One verification journey: state, step list, privacy note and the ID-number
 * step (NIN / BVN) with plain failure reasons. The selfie and phone steps reuse
 * components/k/verify/* (also used inline by the apply flow).
 */
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { BadgeCheck, Camera, ChevronRight, CreditCard, IdCard, Lock, Phone } from 'lucide-react-native';
import { color, font, radius } from '@/lib/k/theme';
import { cleanError, LINKS } from '@/lib/k/account';
import { useUserStore } from '@/lib/stores/users';
import { UserType } from '@/lib/types/users';
import { PhoneNumberVerificationStatus, useKycStatusQuery, useMeQuery, useVerifyKycMutation, type Kyc, type User } from '@/lib/services/graphql/generated';
import { Pressable } from './pressable';
import { KText } from './text';
import { Button } from './button';
import { Field } from './form';
import { Notice } from './feedback';
import { Pill } from './surface';
import { openLink } from './settings';

export type StepKey = 'selfie' | 'nin' | 'phone' | 'bvn';

export type Step = {
	key: StepKey;
	title: string;
	detail: string;
	done: boolean;
	required: boolean;
	/** Why it can't be started yet (e.g. NIN needs the selfie first). */
	blockedBy?: string;
	minutes: string;
};

/** Server-authoritative verification state (kycStatus + me), falling back to the stored user while loading. */
export function useVerification() {
	const stored = useUserStore((s) => s.user.user);
	const host = useUserStore((s) => s.user.userType === UserType.Host);
	const [{ data: kycData, fetching: kycFetching, error: kycError }, refetchKyc] = useKycStatusQuery({ requestPolicy: 'cache-and-network' });
	const [{ data: meData, fetching: meFetching }, refetchMe] = useMeQuery({ requestPolicy: 'cache-and-network' });

	const refresh = useCallback(() => {
		refetchKyc({ requestPolicy: 'network-only' });
		refetchMe({ requestPolicy: 'network-only' });
	}, [refetchKyc, refetchMe]);

	const k = kycData?.kycStatus;
	const nin = k?.ninVerified ?? !!stored?.kyc?.ninVerified;
	const bvn = k?.bvnVerified ?? !!stored?.kyc?.bvnVerified;
	// NIN/BVN can only pass with a selfie on file, so a verified ID implies the selfie step is done.
	const selfie = (k?.hasLiveness ?? !!stored?.kyc?.image) || nin || bvn;
	const phones = meData?.me?.phoneNumbers ?? stored?.phoneNumbers ?? [];
	const phone = phones.some((p) => p.verificationStatus === PhoneNumberVerificationStatus.Verified);

	const steps = useMemo<Step[]>(
		() => [
			{ key: 'selfie', title: 'Take a selfie', detail: selfie ? 'Selfie on file' : 'A clear photo of your face, matched to your ID', done: selfie, required: true, minutes: '1 min' },
			{ key: 'nin', title: 'Confirm your NIN', detail: nin ? 'National Identity Number verified' : 'Your 11-digit National Identity Number', done: nin, required: true, blockedBy: selfie ? undefined : 'Take your selfie first', minutes: '1 min' },
			{ key: 'phone', title: 'Verify your phone', detail: phone ? 'Phone number verified' : 'We text you a 6-digit code', done: phone, required: true, minutes: '1 min' },
			{
				key: 'bvn',
				title: 'Confirm your BVN',
				detail: bvn ? 'Bank Verification Number verified' : host ? 'Needed to list a property and receive payouts' : 'Only needed if you host',
				done: bvn,
				required: host,
				blockedBy: selfie ? undefined : 'Take your selfie first',
				minutes: '1 min'
			}
		],
		[selfie, nin, phone, bvn, host]
	);
	const required = steps.filter((s) => s.required);
	const doneCount = required.filter((s) => s.done).length;
	const next = steps.find((s) => !s.done && s.required && !s.blockedBy) ?? steps.find((s) => !s.done && s.required) ?? null;

	return {
		host,
		steps,
		doneCount,
		requiredCount: required.length,
		complete: doneCount === required.length,
		identityVerified: nin,
		next,
		loading: (kycFetching && !kycData) || (meFetching && !meData),
		error: kycError ? cleanError(kycError.message) : null,
		refresh
	};
}

/** Re-read verification state whenever the screen comes back into focus. */
export function useRefreshOnFocus(refresh: () => void) {
	useFocusEffect(
		useCallback(() => {
			refresh();
		}, [refresh])
	);
}

const ICON: Record<StepKey, typeof Camera> = { selfie: Camera, nin: IdCard, phone: Phone, bvn: CreditCard };

/** Thin progress bar with "2 of 3 done". */
export function VerifyProgress({ done, total }: { done: number; total: number }) {
	const pct = total ? done / total : 0;
	return (
		<View style={{ gap: 8 }} accessible accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: total, now: done }} accessibilityLabel={`${done} of ${total} steps done`}>
			<View style={s.track}>
				<View style={[s.fill, { width: `${Math.max(pct * 100, done ? 4 : 0)}%`, backgroundColor: pct === 1 ? color.success : color.amber }]} />
			</View>
			<KText v="label">
				{done} of {total} done
			</KText>
		</View>
	);
}

/** One step in the hub list. */
export function StepRow({ step, index, onPress }: { step: Step; index: number; onPress: () => void }) {
	const I = ICON[step.key];
	const blocked = !step.done && !!step.blockedBy;
	return (
		<Pressable
			testID={`verify-step-${step.key}`}
			accessibilityRole="button"
			accessibilityLabel={`Step ${index + 1}: ${step.title}. ${step.done ? 'Done' : blocked ? step.blockedBy : step.detail}`}
			onPress={onPress}
			style={({ pressed }) => [s.step, step.done && { borderColor: 'rgba(60,203,142,0.35)' }, pressed && { opacity: 0.8 }]}
		>
			<View style={[s.stepIcon, step.done && { backgroundColor: color.successSoft, borderColor: 'transparent' }]}>
				{step.done ? <BadgeCheck size={18} color={color.success} /> : <I size={18} color={blocked ? color.dim : color.fg2} />}
			</View>
			<View style={{ flex: 1, gap: 3 }}>
				<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
					<KText v="bodyStrong" c={blocked ? 'muted' : 'fg'}>
						{step.title}
					</KText>
					{!step.required && !step.done ? <KText v="micro">Optional</KText> : null}
				</View>
				<KText v="xs">{blocked ? step.blockedBy : step.detail}</KText>
			</View>
			{step.done ? <Pill tone="success">Done</Pill> : <ChevronRight size={18} color={color.dim} />}
		</Pressable>
	);
}

/** What Kushi stores and who sees it. */
export function PrivacyNote({ compact }: { compact?: boolean }) {
	return (
		<View style={s.privacy}>
			<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
				<Lock size={15} color={color.fg2} />
				<KText v="smallStrong">Your details stay private</KText>
			</View>
			{compact ? (
				<KText v="xs">Checked by our licensed partner Dojah against government records. Hosts only see that you’re verified — never your NIN, BVN or selfie.</KText>
			) : (
				<>
					<KText v="xs">• Your selfie and ID number go to Dojah, our licensed verification partner, who checks them against NIMC (NIN) or bank (BVN) records.</KText>
					<KText v="xs">• Kushi keeps your selfie, the ID number you verified and the result, to protect you and others from fraud and to meet Nigerian law.</KText>
					<KText v="xs">• Hosts and renters only see a “verified” badge and your name — never your NIN, BVN or selfie.</KText>
				</>
			)}
			<Pressable accessibilityRole="link" onPress={() => openLink(LINKS.privacy)} hitSlop={8}>
				<KText v="xs" c="amber" style={{ textDecorationLine: 'underline' }}>
					Read how we handle your data
				</KText>
			</Pressable>
		</View>
	);
}

/** Numbered "do this" tips. */
export function Tips({ items }: { items: string[] }) {
	return (
		<View style={{ gap: 10 }}>
			{items.map((t, i) => (
				<View key={i} style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
					<View style={s.num}>
						<KText style={{ fontFamily: font.monoMedium, fontSize: 11, color: color.amber }}>{i + 1}</KText>
					</View>
					<KText v="small" c="fg" style={{ flex: 1 }}>
						{t}
					</KText>
				</View>
			))}
		</View>
	);
}

export type KycFailure = { title: string; body: string; fix: 'retype' | 'retake' | 'retry' };

/** Turn a server/Dojah error into something a person can act on. */
export function explainKycError(raw: string | null | undefined, kind: 'nin' | 'bvn'): KycFailure {
	const label = kind.toUpperCase();
	const m = (raw ?? '').toLowerCase();
	if (m.includes('image not found') || m.includes('upload image'))
		return { title: 'We need your selfie first', body: `Take your selfie, then come back to confirm your ${label}.`, fix: 'retake' };
	if (m.includes('match') || m.includes('selfie') || m.includes('face'))
		return {
			title: `Your selfie didn’t match your ${label} photo`,
			body: `The photo on your ${label} record may be old or the selfie was dark or blurry. Retake it facing a window or light, without glasses or a cap, then try again.`,
			fix: 'retake'
		};
	if (m.includes('not found') || m.includes('invalid') || m.includes('couldn'))
		return { title: `We couldn’t find that ${label}`, body: `Check all 11 digits. ${kind === 'nin' ? 'Dial *346# from the line you registered your NIN with to see it.' : 'Dial *565*0# from your bank-registered line to see it.'}`, fix: 'retype' };
	if (m.includes('network') || m.includes('fetch') || m.includes('timeout'))
		return { title: 'Couldn’t reach Kushi', body: 'Check your connection and try again. Nothing was saved.', fix: 'retry' };
	return { title: `We couldn’t verify your ${label}`, body: raw ? `${cleanError(raw)}. Try again in a few minutes — if it keeps failing, contact support.` : 'Try again in a few minutes — if it keeps failing, contact support.', fix: 'retry' };
}

/** NIN or BVN entry with clear failure reasons. Calls onDone once the server confirms it. */
export function IdNumberStep({ kind, onDone }: { kind: 'nin' | 'bvn'; onDone: () => void }) {
	const [value, setValue] = useState('');
	const [failure, setFailure] = useState<KycFailure | null>(null);
	const [{ fetching }, verify] = useVerifyKycMutation();
	const label = kind === 'nin' ? 'National Identity Number (NIN)' : 'Bank Verification Number (BVN)';

	async function go() {
		setFailure(null);
		const r = await verify({ input: kind === 'nin' ? { nin: value } : { bvn: value } });
		const k = r.data?.verifyKyc;
		const ok = kind === 'nin' ? k?.ninVerified : k?.bvnVerified;
		if (!ok) return setFailure(explainKycError(r.error ? (r.error.graphQLErrors[0]?.message ?? r.error.message) : null, kind));
		const st = useUserStore.getState();
		const u = st.user.user ?? ({} as User);
		st.updateUser({ user: { ...u, kyc: { ...(u.kyc ?? ({} as Kyc)), ninVerified: k?.ninVerified ?? u.kyc?.ninVerified, bvnVerified: k?.bvnVerified ?? u.kyc?.bvnVerified } } as typeof u });
		onDone();
	}

	return (
		<View style={{ gap: 16 }}>
			<Field
				label={label}
				hint={`${value.length}/11 digits`}
				value={value}
				onChangeText={(t) => {
					setValue(t.replace(/\D/g, '').slice(0, 11));
					if (failure?.fix === 'retype') setFailure(null);
				}}
				keyboardType="number-pad"
				maxLength={11}
				placeholder="00000000000"
				autoComplete="off"
				importantForAutofill="no"
				accessibilityLabel={label}
				style={{ fontFamily: font.mono, letterSpacing: 3 }}
				testID={kind}
			/>
			{failure ? (
				<Notice tone="danger" title={failure.title} action={failure.fix === 'retake' ? 'Retake my selfie' : undefined} onAction={failure.fix === 'retake' ? () => router.push('/verify/selfie') : undefined}>
					{failure.body}
				</Notice>
			) : null}
			<Button title={failure ? 'Try again' : `Verify ${kind.toUpperCase()}`} size="lg" block loading={fetching} disabled={value.length !== 11} onPress={go} testID={`verify-${kind}-submit`} />
		</View>
	);
}

/** Back to the hub after a step (or open it if the step was deep-linked). */
export function backToHub(next?: string) {
	if (router.canGoBack()) router.back();
	else router.replace({ pathname: '/verify', params: next ? { next } : {} });
}

const s = StyleSheet.create({
	track: { height: 6, borderRadius: 3, backgroundColor: color.surface, overflow: 'hidden' },
	fill: { height: 6, borderRadius: 3 },
	step: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: radius.lg, borderWidth: 1, borderColor: color.line, backgroundColor: color.bg2 },
	stepIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: color.line2, backgroundColor: color.surface },
	privacy: { gap: 8, padding: 16, borderRadius: radius.lg, borderWidth: 1, borderColor: color.line, backgroundColor: color.bg2 },
	num: { width: 22, height: 22, borderRadius: 11, borderWidth: 1, borderColor: color.amberLine, alignItems: 'center', justifyContent: 'center', marginTop: 1 }
});

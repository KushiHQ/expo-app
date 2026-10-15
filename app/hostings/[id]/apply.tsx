/**
 * Apply for a home — one guided flow, saved after every step:
 * (verify identity) → your details → about you → read & sign → review & submit (emailed code).
 * Collects guestFormData, which the backend requires before it accepts a submission.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { ArrowRight, BadgeCheck, PartyPopper, PenLine, ShieldCheck } from 'lucide-react-native';
import { Button, Card, Check, Choice, Chip, Divider, Empty, Eyebrow, Field, Header, KText, KV, Notice, OtpSheet, Photo, Spinner, Stepper, Waypoint } from '@/components/k';
import { Agreement } from '@/components/k/agreement';
import { DateField } from '@/components/k/date-field';
import { QuoteLines, useQuote } from '@/components/k/quote';
import { IdentityCheck } from '@/components/k/verify/identity';
import { PhoneStep } from '@/components/k/verify/nin-phone';
import { SignaturePad } from '@/components/k/signature';
import { NEEDS_GUARANTOR } from '@/lib/k/booking';
import { centered, useLayout } from '@/lib/k/layout';
import { usePropertyTypeConfig } from '@/lib/hooks/use-property-type-config';
import { color, gutter, radius } from '@/lib/k/theme';
import { date, duration, naira, perInterval, place } from '@/lib/k/format';
import { sortGuestTenancyAggreement } from '@/lib/k/agreement/application';
import { useUserStore } from '@/lib/stores/users';
import { useSignatureUpload } from '@/lib/hooks/use-signature-upload';
import { UPDATE_GUEST } from '@/lib/services/graphql/requests/mutations/users';
import {
	GuestFormEmploymentStatus as Emp,
	GuestFormGuarantorRelationships as Rel,
	GuestFormIncomeRange as Inc,
	GuestFormOccupancyType as Occ,
	useAuthGuestQuery,
	useCompleteBookingApplicationSubmissionMutation,
	useHostingQuery,
	useInitiateBookingApplicationSubmissionMutation,
	useKInitiateBookingApplicationMutation,
	useKUpdateBookingApplicationMutation,
	useTenancyAgreementSummaryQuery,
	useTenancyAgreementTemplateQuery,
	type BookingApplicationUpdateInput,
	type KInitiateBookingApplicationMutation,
	type TenancyTemplateInput
} from '@/lib/services/graphql/generated';

type App = NonNullable<KInitiateBookingApplicationMutation['initiateBookingApplication']['data']>;
type Step = 'kyc' | 'details' | 'about' | 'sign' | 'review' | 'done';
const MAX: Record<string, number> = { NIGHTLY: 60, WEEKLY: 26, MONTHLY: 24, ANUALLY: 5, ONE_TIME_PAYMENT: 1 };
const clean = (m?: string) => (m ?? '').replace('[GraphQL] ', '');
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const strip = (o: any): any => (Array.isArray(o) ? o.map(strip) : o && typeof o === 'object' ? Object.fromEntries(Object.entries(o).filter(([k]) => k !== '__typename').map(([k, v]) => [k, strip(v)])) : o);
const plus = (d: number) => {
	const x = new Date();
	x.setDate(x.getDate() + d);
	return new Date(x.getTime() - x.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
};

const EMP = [
	{ v: Emp.Employed, l: 'Employed', d: 'Salaried, full or part time' },
	{ v: Emp.SelfEmployed, l: 'Self-employed', d: 'Business owner or freelancer' },
	{ v: Emp.Student, l: 'Student', d: 'In school or university' },
	{ v: Emp.CorpMember, l: 'Corps member', d: 'Serving with the NYSC' },
	{ v: Emp.Unemployed, l: 'Between jobs', d: 'Not working right now' }
];
const INC = [
	{ v: Inc.Low, l: '₦100k – ₦200k' },
	{ v: Inc.Mid, l: '₦200k – ₦1m' },
	{ v: Inc.High, l: '₦1m – ₦5m' },
	{ v: Inc.Vip, l: 'Above ₦5m' }
];
const OCC = [
	{ v: Occ.Single, l: 'Just me' },
	{ v: Occ.Couple, l: 'A couple' },
	{ v: Occ.SmallFamily, l: 'Small family (up to 4)' },
	{ v: Occ.LargeFamily, l: 'Large family (5+)' }
];
const REL = [
	{ v: Rel.Parent, l: 'Parent' },
	{ v: Rel.Sibling, l: 'Sibling' },
	{ v: Rel.Spouse, l: 'Spouse' },
	{ v: Rel.Employer, l: 'Employer' },
	{ v: Rel.Clergy, l: 'Clergy' },
	{ v: Rel.Other, l: 'Other' }
];

export default function Apply() {
	const { id, periods: p0 } = useLocalSearchParams<{ id: string; periods?: string }>();
	const insets = useSafeAreaInsets();
	const layout = useLayout();
	const column = centered(layout.max('form'));
	const me = useUserStore((s) => s.user.user);
	const [{ data: hd }] = useHostingQuery({ variables: { hostingId: id, pagination: { limit: 1, offset: 0 } } });
	const h = hd?.hosting;
	const interval = h?.paymentInterval ?? 'ANUALLY';
	// Commercial tenants have no "household"; the server accepts it missing for them.
	const { useClassFor } = usePropertyTypeConfig();
	const commercial = useClassFor(h?.propertyType) === 'commercial';
	const needsKyc = !me?.kyc?.ninVerified;
	const STEPS: Step[] = needsKyc ? ['kyc', 'details', 'about', 'sign', 'review'] : ['details', 'about', 'sign', 'review'];
	const LABEL: Record<Step, string> = { kyc: 'Verify', details: 'Details', about: 'About you', sign: 'Sign', review: 'Submit', done: 'Done' };
	const [step, setStep] = useState<Step>(needsKyc ? 'kyc' : 'details');
	const scroll = useRef<ScrollView>(null);

	const [app, setApp] = useState<App | null>(null);
	const [bootError, setBootError] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [saving, setSaving] = useState(false);
	const [, initiate] = useKInitiateBookingApplicationMutation();
	const [, update] = useKUpdateBookingApplicationMutation();
	const [{ data: tpl }] = useTenancyAgreementTemplateQuery({ variables: { hostingId: id }, pause: !app });
	const [{ data: sum }] = useTenancyAgreementSummaryQuery({ variables: { hostingId: id }, pause: !app });
	const [{ data: guest }, refetchGuest] = useAuthGuestQuery({ pause: !app });
	const [, initiateSubmit] = useInitiateBookingApplicationSubmissionMutation();
	const [, completeSubmit] = useCompleteBookingApplicationSubmissionMutation();
	const sig = useSignatureUpload(UPDATE_GUEST, () => refetchGuest({ requestPolicy: 'network-only' }));

	// Form
	const [fullName, setFullName] = useState('');
	const [email, setEmail] = useState('');
	const [phone, setPhone] = useState('');
	const [address, setAddress] = useState('');
	const [start, setStart] = useState(plus(14));
	const [periods, setPeriods] = useState(Math.max(1, Number(p0) || 1));
	const [emp, setEmp] = useState<Emp | null>(null);
	const [inc, setInc] = useState<Inc | null>(null);
	const [occ, setOcc] = useState<Occ | null>(null);
	const [guar, setGuar] = useState(false);
	const [gRel, setGRel] = useState<Rel | null>(null);
	const [gName, setGName] = useState('');
	const [gPhone, setGPhone] = useState('');
	const [gAddress, setGAddress] = useState('');
	const [consent, setConsent] = useState(false);
	const [consentData, setConsentData] = useState(false);
	const [otpOpen, setOtpOpen] = useState(false);
	const { quote, fetching: quoting } = useQuote(id, periods, !h);

	async function boot() {
		setBootError(null);
		const r = await initiate({ hostingId: id });
		const a = r.data?.initiateBookingApplication?.data;
		if (!a) return setBootError(clean(r.error?.graphQLErrors[0]?.message ?? r.error?.message) || 'We couldn’t start your application.');
		setApp(a);
		setFullName(a.fullName || me?.profile?.fullName || '');
		setEmail(a.email || me?.email || '');
		setPhone(a.phoneNumber || '');
		setAddress(a.correspondenceAddress || '');
		if (a.commencementDate && a.commencementDate >= plus(0)) setStart(a.commencementDate.slice(0, 10));
		if (a.intervalMultiplier) setPeriods(a.intervalMultiplier);
		const g = a.guestFormData;
		if (g) {
			setEmp(g.employmentStatus);
			setInc(g.incomeRanges ?? null);
			setOcc(g.occupancyTypes ?? null);
			setGRel(g.guarantorRelationships ?? null);
			setGName(g.guarantorName ?? '');
			setGPhone(g.guarantorPhone ?? '');
			setGAddress(g.guarantorAddress ?? '');
			setGuar(!!g.guarantorRelationships);
		}
		if (g && a.fullName && a.phoneNumber && a.correspondenceAddress) setStep('sign');
		else if (a.fullName && a.phoneNumber && a.correspondenceAddress) setStep('about');
	}
	useEffect(() => {
		if (!needsKyc && !app) boot();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [needsKyc]);

	const agreement = useMemo<TenancyTemplateInput | null>(() => {
		if (app?.bookingAggrement?.sections?.length) return strip(app.bookingAggrement);
		if (tpl?.tenancyAgreementTemplate) return strip(sortGuestTenancyAggreement(tpl.tenancyAgreementTemplate as never));
		return null;
	}, [app, tpl]);

	const needsIncome = emp === Emp.Employed || emp === Emp.SelfEmployed;
	const guestFormData = emp
		? {
				employmentStatus: emp,
				incomeRanges: needsIncome ? inc : null,
				occupancyTypes: commercial ? null : occ,
				guarantorRelationships: guar ? gRel : null,
				guarantorName: guar ? gName || null : null,
				guarantorPhone: guar ? gPhone || null : null,
				guarantorAddress: guar ? gAddress.trim() || null : null
			}
		: null;
	const appView = { ...(app ?? {}), fullName, email, correspondenceAddress: address, commencementDate: start, intervalMultiplier: periods, guestFormData };

	async function save() {
		if (!app) return false;
		setSaving(true);
		setError(null);
		const input: BookingApplicationUpdateInput = {
			id: app.id,
			fullName: fullName.trim() || null,
			email: email.trim() || null,
			phoneNumber: phone || null,
			correspondenceAddress: address.trim() || null,
			commencementDate: start,
			intervalMultiplier: periods,
			guestFormData,
			bookingAggrement: agreement
		};
		const r = await update({ input });
		setSaving(false);
		if (r.error) {
			setError(clean(r.error.graphQLErrors[0]?.message ?? r.error.message));
			return false;
		}
		return true;
	}

	const go = (s: Step) => {
		setStep(s);
		setError(null);
		scroll.current?.scrollTo({ y: 0, animated: true });
	};
	const idx = STEPS.indexOf(step);
	async function next() {
		if (!(await save())) return;
		go(STEPS[idx + 1]);
	}
	async function sendCode() {
		if (!app || !(await save())) return;
		setSaving(true);
		const r = await initiateSubmit({ applicationId: app.id });
		setSaving(false);
		if (r.error) return setError(clean(r.error.graphQLErrors[0]?.message ?? r.error.message));
		setOtpOpen(true);
	}

	const detailsOk = fullName.trim().split(/\s+/).length >= 2 && /.+@.+\..+/.test(email) && !!phone && address.trim().length >= 8 && !!start;
	// Kushi's risk check declines students, corps members and people between jobs who have no guarantor.
	const mustGuarantee = !!emp && NEEDS_GUARANTOR.includes(emp);
	const aboutOk = !!emp && (!needsIncome || !!inc) && (commercial || !!occ) && (!mustGuarantee || guar) && (!guar || (!!gRel && gName.trim().length > 2 && gPhone.replace(/\D/g, '').length >= 10));
	const signature = guest?.authGuest?.signature?.secureUrl ?? guest?.authGuest?.signature?.publicUrl;
	const signOk = !!signature && consent && consentData && !!agreement;
	const alreadyApplied = !!app && app.status !== 'IN_PROGRESS' && app.status !== 'CANCELLED';

	if (step === 'done')
		return (
			<ScrollView style={{ flex: 1, backgroundColor: color.bg }} contentContainerStyle={{ paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24, paddingHorizontal: gutter }}>
				<Animated.View entering={FadeIn.duration(500)} style={[{ gap: 16 }, column]} testID="apply-done">
					<View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: color.amberSoft, alignItems: 'center', justifyContent: 'center' }}>
						<PartyPopper size={28} color={color.amber} />
					</View>
					<Eyebrow>Application sent</Eyebrow>
					<KText v="hero">You’re on the map.</KText>
					<KText v="lead">Your application for {h?.title} is with Kushi and the host. Here’s what happens next:</KText>
					{[
						['Kushi checks it', 'We confirm your details — usually within a day.'],
						['The host decides', 'Typically within 3 business days. We’ll notify you.'],
						['You pay into escrow', `Once accepted, pay ${quote ? naira(Number(quote.totalPayableAmount)) : 'the total'} through Kushi. It’s held safely.`],
						['Get your keys, then confirm', 'Arrange the handover with your host. Confirm in Kushi and the host is paid.']
					].map(([t, d], i) => (
						<View key={t} style={{ flexDirection: 'row', gap: 12 }}>
							<View style={{ paddingTop: 5 }}>
								<Waypoint done={i === 0} active={i === 1} />
							</View>
							<View style={{ flex: 1 }}>
								<KText v="bodyStrong">{t}</KText>
								<KText v="small">{d}</KText>
							</View>
						</View>
					))}
					<Button title="Track your application" size="lg" block onPress={() => router.replace(app ? `/trips/${app.id}` : '/trips')} />
					<Button title="Keep exploring" variant="ghost" size="lg" block onPress={() => router.replace('/')} />
				</Animated.View>
			</ScrollView>
		);

	return (
		<KeyboardAvoidingView style={{ flex: 1, backgroundColor: color.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
			<Header eyebrow="Apply to rent" title={h?.title ?? 'Application'} />
			{/* progress */}
			<View style={[{ flexDirection: 'row', gap: 6, paddingHorizontal: gutter, paddingVertical: 12 }, column]} accessibilityLabel={`Step ${idx + 1} of ${STEPS.length}: ${LABEL[step]}`}>
				{STEPS.map((s, i) => (
					<View key={s} style={{ flex: 1, gap: 6 }}>
						<View style={{ height: 3, borderRadius: 2, backgroundColor: i <= idx ? color.amber : color.line2 }} />
						<KText v="micro" style={{ color: i === idx ? color.fg : color.muted }}>
							{LABEL[s]}
						</KText>
					</View>
				))}
			</View>
			<ScrollView ref={scroll} contentContainerStyle={[{ paddingHorizontal: gutter, paddingBottom: 40, gap: 20 }, column]} keyboardShouldPersistTaps="handled">
				{h ? (
					<View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', padding: 10, borderRadius: radius.md, borderWidth: 1, borderColor: color.line, backgroundColor: color.bg2 }}>
						<Photo assetId={h.coverImage?.asset?.id} w={200} h={200} style={{ width: 56, height: 56 }} />
						<View style={{ flex: 1 }}>
							<KText v="smallStrong" numberOfLines={1}>
								{h.title}
							</KText>
							<KText v="xs">
								{place(h.city, h.state)} · {naira(h.price)} {perInterval(interval)}
							</KText>
						</View>
					</View>
				) : null}

				{bootError ? (
					<>
						<Notice tone="danger">{bootError}</Notice>
						<Button title="Try again" variant="ghost" onPress={boot} />
					</>
				) : alreadyApplied ? (
					<Empty eyebrow="Already applied" title="Your application is in" body="Follow its status, message the host and pay once you’re accepted." action="See where it stands" onAction={() => router.replace(app ? `/trips/${app.id}` : '/trips')} />
				) : step === 'kyc' ? (
					<Animated.View entering={FadeIn} style={{ gap: 14 }}>
						<KText v="title">First, verify it’s you</KText>
						<KText v="small">Kushi checks every renter once. It protects hosts from fraud and puts your verified name on the agreement. About a minute.</KText>
						<IdentityCheck onVerified={() => (go('details'), boot())} />
					</Animated.View>
				) : !app ? (
					<View style={{ paddingVertical: 40, alignItems: 'center', gap: 12 }}>
						<Spinner size="large" />
						<KText v="small">Getting your application ready…</KText>
					</View>
				) : step === 'details' ? (
					<Animated.View entering={FadeIn} style={{ gap: 18 }}>
						<View style={{ gap: 6 }}>
							<KText v="title">Your details</KText>
							<KText v="small">These go on your tenancy agreement exactly as written.</KText>
						</View>
						<Field label="Full legal name" value={fullName} onChangeText={setFullName} autoComplete="name" />
						<Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
						<View style={{ gap: 8 }}>
							<KText v="label">Phone number</KText>
							<PhoneStep value={phone} onChange={setPhone} />
						</View>
						<Field label="Current address" hint="Where you live now — for the agreement and notices." value={address} onChangeText={setAddress} multiline />
						<Divider />
						<DateField label="Move-in date" value={start} onChange={setStart} />
						<View style={{ gap: 8 }}>
							<KText v="label">How long</KText>
							<Stepper value={periods} onChange={setPeriods} max={MAX[interval] ?? 12} format={(n) => duration(n, interval)} />
						</View>
					</Animated.View>
				) : step === 'about' ? (
					<Animated.View entering={FadeIn} style={{ gap: 18 }}>
						<View style={{ gap: 6 }}>
							<KText v="title">A little about you</KText>
							<KText v="small">Hosts use this to decide quickly. Shared only with this home’s host.</KText>
						</View>
						<KText v="label">What do you do?</KText>
						{EMP.map((o) => (
							<Choice key={o.v} title={o.l} detail={o.d} on={emp === o.v} onPress={() => (setEmp(o.v), NEEDS_GUARANTOR.includes(o.v) && setGuar(true))} />
						))}
						{needsIncome ? (
							<>
								<KText v="label">Monthly income</KText>
								<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
									{INC.map((o) => (
										<Chip key={o.v} label={o.l} on={inc === o.v} onPress={() => setInc(o.v)} />
									))}
								</View>
							</>
						) : null}
						{commercial ? null : (
							<>
								<KText v="label">Who’ll live here?</KText>
								<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
									{OCC.map((o) => (
										<Chip key={o.v} label={o.l} on={occ === o.v} onPress={() => setOcc(o.v)} />
									))}
								</View>
								{h?.maxOccupants ? <KText v="xs">This home allows up to {h.maxOccupants} people.</KText> : null}
							</>
						)}
						{mustGuarantee ? (
							<Notice tone="warn" title="You’ll need a guarantor">
								Students, corps members and people between jobs need a guarantor on Kushi — someone (ideally a parent or employer) who agrees to cover the rent if you can’t. Applications without one are declined automatically.
							</Notice>
						) : null}
						<Check on={guar || mustGuarantee} onPress={() => !mustGuarantee && setGuar((g) => !g)}>
							<KText v="smallStrong">{mustGuarantee ? 'Your guarantor' : 'Add a guarantor'}</KText>
							<KText v="xs">{mustGuarantee ? 'Required for your situation.' : 'Optional, but it strengthens your application. Parents and employers count most.'}</KText>
						</Check>
						{guar || mustGuarantee ? (
							<Card>
								<KText v="label">Relationship</KText>
								<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
									{REL.map((o) => (
										<Chip key={o.v} label={o.l} on={gRel === o.v} onPress={() => setGRel(o.v)} />
									))}
								</View>
								<Field label="Guarantor’s full name" value={gName} onChangeText={setGName} />
								<Field label="Guarantor’s phone" value={gPhone} onChangeText={setGPhone} keyboardType="phone-pad" textContentType="telephoneNumber" />
								<Field label="Guarantor’s address" optional value={gAddress} onChangeText={setGAddress} placeholder="e.g. 12 Admiralty Way, Lekki" />
							</Card>
						) : null}
					</Animated.View>
				) : step === 'sign' ? (
					<Animated.View entering={FadeIn} style={{ gap: 18 }}>
						<View style={{ gap: 6 }}>
							<KText v="title">Read and sign</KText>
							<KText v="small">The tenancy agreement between you and the host, prepared by Kushi. It takes effect only once the host accepts and you pay.</KText>
						</View>
						{tpl === undefined && !app.bookingAggrement ? null : !agreement ? (
							<Notice tone="warn" title="Agreement unavailable right now">
								We couldn’t load the tenancy agreement. Your progress is saved — try again shortly.
							</Notice>
						) : (
							<Agreement agreement={agreement} hosting={h as never} application={appView as never} summary={sum?.tenancyAgreementSummary ?? []} />
						)}
						<View style={{ gap: 10 }}>
							<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
								<PenLine size={14} color={color.muted} />
								<KText v="label">Your signature</KText>
							</View>
							<SignaturePad onSave={sig.upload} existingUrl={signature ?? undefined} uploading={sig.uploading} />
							{signature ? (
								<View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
									<BadgeCheck size={14} color={color.success} />
									<KText v="xs" c="success">
										Signature on file — applied to this agreement.
									</KText>
								</View>
							) : null}
						</View>
						<Check on={consent} onPress={() => setConsent((c) => !c)}>
							<KText v="small">I agree my electronic signature is legally binding and accept this tenancy agreement, effective once the host accepts and I pay.</KText>
						</Check>
						<Check on={consentData} onPress={() => setConsentData((c) => !c)}>
							<KText v="small">I consent to Kushi processing my identity data to verify this application.</KText>
						</Check>
					</Animated.View>
				) : (
					<Animated.View entering={FadeIn} style={{ gap: 16 }}>
						<View style={{ gap: 6 }}>
							<KText v="title">Review and submit</KText>
							<KText v="small">You won’t be charged now — you pay only after the host accepts.</KText>
						</View>
						<Card>
							<KV k="Name" v={fullName} />
							<KV k="Phone" v={phone} />
							<KV k="Move in" v={date(start)} />
							<KV k="Length" v={duration(periods, interval)} />
							<KV k="Work" v={`${EMP.find((e) => e.v === emp)?.l ?? '—'}${needsIncome && inc ? ` · ${INC.find((i) => i.v === inc)?.l}/mo` : ''}`} />
							<KV k="Household" v={OCC.find((o) => o.v === occ)?.l ?? '—'} />
							<KV k="Guarantor" v={guar && gName ? `${gName} (${REL.find((r) => r.v === gRel)?.l})` : 'None'} />
						</Card>
						<Card>
							<KText v="heading">Due after acceptance</KText>
							<QuoteLines quote={quote} fetching={quoting} />
						</Card>
						<Notice tone="info">
							<View style={{ flexDirection: 'row', gap: 8 }}>
								<ShieldCheck size={16} color={color.signal} />
								<KText v="small" style={{ flex: 1 }}>
									We’ll email a 6-digit code to {me?.email} to confirm it’s really you.
								</KText>
							</View>
						</Notice>
					</Animated.View>
				)}
				{error ? <Notice tone="danger">{error}</Notice> : null}
			</ScrollView>

			{app && !alreadyApplied && step !== 'kyc' ? (
				<View style={{ paddingHorizontal: gutter, paddingTop: 12, paddingBottom: Math.max(insets.bottom, 12), backgroundColor: color.bg, borderTopWidth: 1, borderTopColor: color.line }}>
				<View style={[{ flexDirection: 'row', gap: 10 }, column]}>
					{idx > 0 && STEPS[idx - 1] !== 'kyc' ? <Button title="Back" variant="ghost" onPress={() => go(STEPS[idx - 1])} /> : null}
					{step === 'review' ? (
						<Button title="Submit application" size="lg" loading={saving} style={{ flex: 1 }} onPress={sendCode} testID="apply-submit" />
					) : (
						<Button
							title={step === 'sign' ? 'Sign and continue' : 'Continue'}
							size="lg"
							style={{ flex: 1 }}
							loading={saving}
							disabled={(step === 'details' && !detailsOk) || (step === 'about' && !aboutOk) || (step === 'sign' && !signOk)}
							trailing={<ArrowRight size={18} color={color.onAmber} />}
							onPress={next}
							testID="apply-next"
						/>
					)}
				</View>
				</View>
			) : null}

			<OtpSheet
				open={otpOpen}
				onClose={() => setOtpOpen(false)}
				title="Confirm it’s you"
				body={`Enter the 6-digit code we emailed to ${me?.email}.`}
				action="Submit application"
				onResend={async () => void (app && (await initiateSubmit({ applicationId: app.id })))}
				onSubmit={async (otp) => {
					const r = await completeSubmit({ input: { applicationId: app!.id, otp } });
					if (r.error) return clean(r.error.graphQLErrors[0]?.message ?? r.error.message);
					setStep('done');
					return null;
				}}
			/>
		</KeyboardAvoidingView>
	);
}

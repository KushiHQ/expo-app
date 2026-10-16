import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { Clock, FileText, ShieldCheck } from 'lucide-react-native';
import { Button, Card, Empty, Eyebrow, Header, KText, Notice, Pill, Screen, Skeleton, Waypoint } from '@/components/k';
import { MandateFields, mandateComplete } from '@/components/k/listing-mandate';
import { color } from '@/lib/k/theme';
import { date } from '@/lib/k/format';
import { TIERS, TIER_ORDER, tierRank } from '@/lib/k/tiers';
import { cleanError } from '@/lib/k/use-listing-step';
import { toast } from '@/lib/hooks/use-toast';
import {
	HostingVerificationRequestStatus as S,
	HostingVerificationTier as T,
	useHostingQuery,
	useHostingVerificationRequestsQuery,
	useInitiateHostingVerificationMutation,
	type HostingVerificationInput
} from '@/lib/services/graphql/generated';

/** What each level asks for (mirrors the server's tier seed). */
const TIER_NEEDS: Record<T, string> = {
	[T.Unverified]: '',
	[T.IdentityVerified]: 'A clear photo of your government ID.',
	[T.AddressVerified]: 'A recent utility bill for the property.',
	[T.TitleChecked]: 'The title document (C of O, R of O or deed) and the survey plan. Kushi searches the land registry.',
	[T.KushiVetted]: 'Building plan approval, then an on-site inspection by the Kushi team.'
};

const STATUS: Record<S, { label: string; tone: 'info' | 'success' | 'danger' | 'neutral' }> = {
	[S.Pending]: { label: 'Waiting', tone: 'info' },
	[S.UnderReview]: { label: 'Being reviewed', tone: 'info' },
	[S.Verified]: { label: 'Approved', tone: 'success' },
	[S.Rejected]: { label: 'Not approved', tone: 'danger' }
};

/** Trust badges for one listing: where it stands, what each level needs, and every request so far. */
export default function VerificationOverview() {
	const { id: raw } = useLocalSearchParams<{ id?: string }>();
	const id = (Array.isArray(raw) ? raw[0] : raw) ?? '';
	const [{ data: hd, fetching: hf, error: he }, refetchHosting] = useHostingQuery({ variables: { hostingId: id }, pause: !id });
	const [{ data: rd, fetching: rf }, refetchRequests] = useHostingVerificationRequestsQuery({ variables: { hostingId: id }, pause: !id, requestPolicy: 'cache-and-network' });
	const h = hd?.hosting;
	const requests = rd?.hostingVerificationRequests ?? [];
	const tier = h?.verification?.verificationTier ?? T.Unverified;
	const rank = tierRank(tier);
	const inFlight = requests.find((r) => r.status === S.Pending || r.status === S.UnderReview);
	const refresh = () => {
		refetchHosting({ requestPolicy: 'network-only' });
		refetchRequests({ requestPolicy: 'network-only' });
	};
	const request = (t: T) => router.push(`/hostings/form/verification/request?id=${id}&tier=${t}` as Href);

	return (
		<Screen header={<Header eyebrow={h?.title ?? 'Listing'} title="Verification" />} onRefresh={refresh} refreshing={false} contentStyle={{ paddingTop: 20 }}>
			{!h ? (
				hf || rf ? (
					<View style={{ gap: 14 }}>
						<Skeleton style={{ height: 130 }} />
						<Skeleton style={{ height: 300 }} />
					</View>
				) : (
					<Empty eyebrow="Off the map" title="We couldn’t load this" body={he ? cleanError(he.message) : 'Pull down to try again.'} action="Try again" onAction={refresh} />
				)
			) : (
				<>
					<Card tone={rank >= 3 ? 'amber' : 'signal'}>
						<View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
							<ShieldCheck size={26} color={rank ? color.amber : color.muted} />
							<View style={{ flex: 1, gap: 2 }}>
								<KText v="label">Current level</KText>
								<KText v="title">{TIERS[tier].label}</KText>
							</View>
						</View>
						<KText v="small">{TIERS[tier].what}</KText>
						<KText v="xs">Higher levels show a stronger badge on your listing and rank it higher in search.</KText>
					</Card>

					{!h.verification ? <MandateFirst hostingId={id} onDone={refresh} /> : null}

					{inFlight ? (
						<Notice tone="info" title={`${TIERS[inFlight.tier].label}: ${STATUS[inFlight.status].label.toLowerCase()}`}>
							Sent {date(inFlight.createdAt)}. Kushi reviews requests within 3–5 business days and will notify you. You can ask for the next level once this one is decided.
						</Notice>
					) : null}

					<View style={{ gap: 4 }}>
						<Eyebrow>The levels</Eyebrow>
						{TIER_ORDER.filter((t) => t !== T.Unverified).map((t, i, list) => {
							const r = tierRank(t);
							const done = r <= rank;
							const last = requests.find((q) => q.tier === t);
							const canAsk = !done && !inFlight && !!h.verification;
							return (
								<View key={t} style={{ flexDirection: 'row', gap: 14 }}>
									<View style={{ alignItems: 'center', width: 18, paddingTop: 6 }}>
										<Waypoint done={done} active={!done && r === rank + 1} />
										{i < list.length - 1 ? <View style={{ flex: 1, width: 1, backgroundColor: done ? color.amberLine : color.line2, marginTop: 6 }} /> : null}
									</View>
									<View style={{ flex: 1, gap: 6, paddingBottom: 18 }}>
										<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
											<KText v="bodyStrong">{TIERS[t].label}</KText>
											{done ? <Pill tone="success">Done</Pill> : last && last.status !== S.Verified ? <Pill tone={STATUS[last.status].tone}>{STATUS[last.status].label}</Pill> : null}
										</View>
										<KText v="xs">{TIERS[t].what}</KText>
										{!done ? (
											<View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
												<FileText size={13} color={color.muted} style={{ marginTop: 2 }} />
												<KText v="xs" style={{ flex: 1, color: color.fg2 }}>
													{TIER_NEEDS[t]}
												</KText>
											</View>
										) : null}
										{canAsk ? <Button title={last?.status === S.Rejected ? 'Try again' : 'Request this level'} size="sm" variant={r === rank + 1 ? 'amber' : 'ghost'} onPress={() => request(t)} style={{ alignSelf: 'flex-start' }} testID={`request-${t}`} /> : null}
									</View>
								</View>
							);
						})}
					</View>

					<View style={{ gap: 10 }}>
						<Eyebrow>{requests.length ? `Requests · ${requests.length}` : 'Requests'}</Eyebrow>
						{!requests.length ? <KText v="small">Nothing sent yet. Each request you send shows here with Kushi’s decision.</KText> : null}
						{requests.map((q) => (
							<Card key={q.id}>
								<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
									<KText v="smallStrong" style={{ flex: 1 }}>
										{TIERS[q.tier].label}
									</KText>
									<Pill tone={STATUS[q.status].tone}>{STATUS[q.status].label}</Pill>
								</View>
								<View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
									<Clock size={12} color={color.muted} />
									<KText v="xs">Sent {date(q.createdAt)}{q.lastUpdated !== q.createdAt ? ` · updated ${date(q.lastUpdated)}` : ''}</KText>
								</View>
								{q.statusDetails ? (
									<Notice tone={q.status === S.Rejected ? 'danger' : 'info'} title="Note from Kushi">
										{q.statusDetails}
									</Notice>
								) : null}
								{q.documents.length ? <KText v="xs">Sent: {q.documents.map((d) => d.name).join(', ')}</KText> : null}
							</Card>
						))}
					</View>
				</>
			)}
		</Screen>
	);
}

function MandateFirst({ hostingId, onDone }: { hostingId: string; onDone: () => void }) {
	const [v, setV] = useState<Partial<HostingVerificationInput>>({ hostingId });
	const [tried, setTried] = useState(false);
	const [{ fetching }, initiate] = useInitiateHostingVerificationMutation();
	useEffect(() => setV((x) => ({ ...x, hostingId })), [hostingId]);
	async function save() {
		setTried(true);
		if (!mandateComplete(v)) return;
		const r = await initiate({ input: v as HostingVerificationInput });
		if (r.error) return toast.show({ type: 'error', text1: 'Couldn’t save', text2: cleanError(r.error.message) });
		toast.show({ type: 'success', text2: 'Saved. You can now request a level.' });
		onDone();
	}
	return (
		<Card tone="amber">
			<Eyebrow c="amber">First</Eyebrow>
			<KText v="bodyStrong">Confirm your right to list it</KText>
			<KText v="small">Kushi needs the owner’s details before it can verify this listing.</KText>
			<MandateFields v={v} update={(p) => setV((x) => ({ ...x, ...p }))} tried={tried} />
			<Button title="Save and continue" loading={fetching} onPress={save} />
		</Card>
	);
}

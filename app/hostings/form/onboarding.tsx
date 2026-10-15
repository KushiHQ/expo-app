import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { BarChart3, Copy, ExternalLink, Inbox, MoreHorizontal, Plus, Rocket, ShieldCheck, Trash2 } from 'lucide-react-native';
import { Button, Card, Divider, Empty, Eyebrow, Header, IconButton, KText, Notice, Photo, Pill, Row, Screen, Sheet, Skeleton } from '@/components/k';
import { HostListingRow, PUBLISH } from '@/components/k/host-bits';
import { Progress, StepRow } from '@/components/k/listing-form';
import { color } from '@/lib/k/theme';
import { naira, perInterval, place } from '@/lib/k/format';
import { TIERS } from '@/lib/k/tiers';
import { agentManaged, stepHref, stepsFor, type Hosting, type StepKey } from '@/lib/k/listing-steps';
import { cleanError } from '@/lib/k/use-listing-step';
import { useHostingForm } from '@/lib/hooks/hosting-form';
import { toast } from '@/lib/hooks/use-toast';
import { HostingKind, HostingVerificationTier, PublishStatus, useDeleteHostingMutation, useDuplicateHostingMutation } from '@/lib/services/graphql/generated';

/** The listing hub: where set-up resumes, what's left, and everything to manage once it's live. */
export default function ListingHub() {
	const params = useLocalSearchParams<{ id?: string; next?: string }>();
	const [id] = useState(() => (Array.isArray(params.id) ? params.id[0] : params.id) ?? '');
	const { hosting: stored, fetching, refetch } = useHostingForm(id);
	const h = stored && stored.id === id ? (stored as Hosting) : undefined;
	const [menu, setMenu] = useState(false);
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [{ fetching: deleting }, del] = useDeleteHostingMutation();
	const [{ fetching: duplicating }, duplicate] = useDuplicateHostingMutation();

	// A brand-new listing arrives with ?next=photos: carry straight on to that step, once.
	const jumped = useRef(false);
	useEffect(() => {
		if (jumped.current || !params.next || !id) return;
		jumped.current = true;
		router.setParams({ next: undefined });
		router.push(stepHref(params.next as StepKey, id));
	}, [params.next, id]);

	if (!h)
		return (
			<Screen header={<Header eyebrow="Listing" title="Your listing" onBack={() => (router.canGoBack() ? router.back() : router.replace('/host/listings' as Href))} />} onRefresh={refetch} refreshing={false} contentStyle={{ paddingTop: 20 }}>
				{fetching || !stored ? (
					<View style={{ gap: 14 }}>
						<Skeleton style={{ height: 110 }} />
						<Skeleton style={{ height: 60 }} />
						<Skeleton style={{ height: 300 }} />
					</View>
				) : (
					<Empty eyebrow="Off the map" title="We couldn’t load this listing" body="Check your connection and pull down to try again." action="Try again" onAction={refetch} />
				)}
			</Screen>
		);

	const steps = stepsFor(h);
	const left = steps.filter((s) => !s.done);
	const status = h.publishStatus ?? PublishStatus.Draft;
	const st = PUBLISH[status] ?? PUBLISH.DRAFT;
	const live = status === PublishStatus.Live;
	const parent = h.kind === HostingKind.Parent;
	const units = (h.children ?? []).filter((u) => u.publishStatus !== PublishStatus.Archived);
	const tier = h.verification?.verificationTier ?? HostingVerificationTier.Unverified;
	const agent = agentManaged(h);
	const nextUp = left.find((s) => s.key !== 'publish') ?? left[0];
	const go = (key: StepKey) => router.push(stepHref(key, id));

	async function onDuplicate() {
		const r = await duplicate({ sourceHostingId: id });
		setMenu(false);
		if (r.error) return toast.show({ type: 'error', text2: cleanError(r.error.message) });
		toast.show({ type: 'success', text1: 'Copied', text2: 'A draft copy is in your listings.' });
	}
	async function onDelete() {
		const r = await del({ hostingId: id });
		if (r.error) return toast.show({ type: 'error', text2: cleanError(r.error.message) });
		setConfirmDelete(false);
		toast.show({ type: 'success', text2: 'Listing deleted.' });
		if (router.canGoBack()) router.back();
		else router.replace('/host/listings' as Href);
	}

	return (
		<Screen
			header={
				<Header
					eyebrow={parent ? 'Property with units' : h.kind === HostingKind.Child ? `Unit · ${h.parent?.title ?? 'property'}` : 'Listing'}
					title={h.title || 'Untitled listing'}
					onBack={() => (router.canGoBack() ? router.back() : router.replace('/host/listings' as Href))}
					right={
						<IconButton label="More options" onPress={() => setMenu(true)}>
							<MoreHorizontal size={18} color={color.fg} />
						</IconButton>
					}
				/>
			}
			onRefresh={refetch}
			refreshing={false}
			contentStyle={{ paddingTop: 20 }}
		>
			<Card style={{ padding: 12 }}>
				<View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
					<Photo assetId={h.coverImage?.asset?.id} w={300} h={240} style={{ width: 104, height: 84 }} />
					<View style={{ flex: 1, gap: 5 }}>
						<Pill tone={st.tone}>{st.label}</Pill>
						<KText v="xs" numberOfLines={1}>
							{place(h.city, h.state) || 'No location yet'}
						</KText>
						<KText v="smallStrong">{Number(h.price) ? `${naira(Number(h.price))} ${h.listingType === 'SALE' ? '' : perInterval(h.paymentInterval)}` : 'No price yet'}</KText>
					</View>
				</View>
				<View style={{ gap: 6 }}>
					<KText v="xs">{left.length ? `${steps.length - left.length} of ${steps.length} steps done` : 'Every step is done'}</KText>
					<Progress steps={steps} inset />
				</View>
			</Card>

			{live ? (
				<Card tone="signal">
					<KText v="bodyStrong">Live on Kushi</KText>
					<KText v="small">{agent ? 'Renters can find it and contact you.' : 'Renters can find it and apply. You decide who gets it.'}</KText>
					<Button title="See it as renters do" variant="ghost" size="sm" icon={<ExternalLink size={14} color={color.fg} />} onPress={() => router.push(`/hostings/${id}` as Href)} style={{ alignSelf: 'flex-start' }} />
				</Card>
			) : status === PublishStatus.Rejected ? (
				<Notice tone="danger" title="Kushi asked for changes">Check each step, update what’s wrong, then publish again. Contact support if you’re not sure what to change.</Notice>
			) : status === PublishStatus.Inreview ? (
				<Notice tone="info" title="Being reviewed">Kushi is checking this listing. You’ll get a notification when it’s done.</Notice>
			) : nextUp && nextUp.key !== 'publish' ? (
				<Card tone="amber">
					<Eyebrow c="amber">Next up</Eyebrow>
					<KText v="bodyStrong">{nextUp.title}</KText>
					<KText v="small">{nextUp.left.join(' · ')}</KText>
					<Button title={`Continue: ${nextUp.title.toLowerCase()}`} onPress={() => go(nextUp.key)} style={{ alignSelf: 'flex-start' }} testID="hub-continue" />
				</Card>
			) : (
				<Card tone="amber">
					<Eyebrow c="amber">Almost there</Eyebrow>
					<KText v="bodyStrong">Name it and publish</KText>
					<KText v="small">Everything else is done. Add a title and description, then go live.</KText>
					<Button title="Name and publish" onPress={() => go('publish')} style={{ alignSelf: 'flex-start' }} testID="hub-continue" />
				</Card>
			)}

			<View>
				<Eyebrow>{live ? 'Listing details' : 'Set-up'}</Eyebrow>
				{steps.map((s) => (
					<StepRow key={s.key} step={s} onPress={() => go(s.key)} testID={`hub-step-${s.key}`} />
				))}
			</View>

			{parent ? (
				<View style={{ gap: 10 }}>
					<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
						<Eyebrow>{`Units · ${units.length}`}</Eyebrow>
						<Button title="Add a unit" size="sm" variant="ghost" icon={<Plus size={14} color={color.fg} />} onPress={() => router.push(`/hostings/form?parent=${id}` as Href)} />
					</View>
					{units.length ? units.map((u) => <HostListingRow key={u.id} l={u} />) : <KText v="small">No units yet. Add each flat or shop so renters can pick one.</KText>}
				</View>
			) : null}

			<View>
				<Eyebrow>Manage</Eyebrow>
				{!parent ? <Row icon={<Inbox size={17} color={color.fg} />} title="Applications" detail={h.bookingApplicationsCount ? `${h.bookingApplicationsCount} so far` : 'None yet'} onPress={() => router.push(`/hostings/${id}/booking-applications` as Href)} /> : null}
				{!agent ? (
					<>
						<Divider />
						<Row icon={<ShieldCheck size={17} color={color.fg} />} title="Verification" detail={`${TIERS[tier].label} · ${tier === HostingVerificationTier.KushiVetted ? 'top level' : 'get a higher badge'}`} onPress={() => router.push(`/hostings/form/verification/overview?id=${id}` as Href)} />
					</>
				) : null}
				<Divider />
				<Row icon={<BarChart3 size={17} color={color.fg} />} title="Insights" detail="Views, saves and messages" onPress={() => router.push(`/hostings/${id}/insights` as Href)} />
				{live ? (
					<>
						<Divider />
						<Row icon={<Rocket size={17} color={color.fg} />} title="Boost" detail="Show up higher in search for a while" onPress={() => router.push(`/hostings/${id}/boost` as Href)} />
					</>
				) : null}
			</View>

			<Sheet open={menu} onClose={() => setMenu(false)} title="Listing options">
				<Row icon={<ExternalLink size={17} color={color.fg} />} title="View as renters see it" onPress={() => { setMenu(false); router.push(`/hostings/${id}` as Href); }} />
				<Row icon={<Copy size={17} color={color.fg} />} title={duplicating ? 'Copying…' : 'Make a copy'} detail="Starts a new draft with the same details" onPress={onDuplicate} />
				<Row icon={<Trash2 size={17} color={color.danger} />} title="Delete listing" danger onPress={() => { setMenu(false); setTimeout(() => setConfirmDelete(true), 380); }} />
			</Sheet>
			<Sheet open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete this listing?">
				<KText v="small">It disappears from Kushi and your listings. This can’t be undone.</KText>
				<Button title="Delete" variant="danger" block loading={deleting} onPress={onDelete} />
				<Button title="Keep it" variant="ghost" block onPress={() => setConfirmDelete(false)} />
			</Sheet>
		</Screen>
	);
}

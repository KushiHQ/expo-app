import { useEffect, useMemo, useState } from 'react';
import { FlatList, ScrollView, Share, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Pressable } from '@/components/k/pressable';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Circle } from 'react-native-maps';
import { useVideoPlayer, VideoView } from 'expo-video';
import {
	ArrowLeft,
	BedDouble,
	Building2,
	CalendarClock,
	Check,
	ChevronRight,
	Heart,
	Landmark,
	MapPin,
	MessageCircle,
	PlayCircle,
	Share2,
	ShieldCheck,
	Star,
	Users,
	Zap
} from 'lucide-react-native';
import { Avatar, Button, Card, Divider, Empty, Eyebrow, IconButton, KText, Notice, Photo, Pill, Sheet, Skeleton, Stepper, Waypoint } from '@/components/k';
import { QuoteLines, useQuote } from '@/components/k/quote';
import { useSaveToggle } from '@/components/k/listing-card';
import { PhotoTour } from '@/components/k/photo-tour';
import { color, font, gutter, radius } from '@/lib/k/theme';
import { centered, maxWidth, useLayout } from '@/lib/k/layout';
import { date, duration, humanize, intervalAdverb, isShortLet, naira, perInterval, place } from '@/lib/k/format';
import { TIERS, TIER_ORDER, tierRank } from '@/lib/k/tiers';
import { listingMode, listingPhotos, roomLabel, shareUrl, type Listing } from '@/lib/k/listing';
import { isSignedIn, requireSignIn } from '@/lib/k/session';
import { useUserStore } from '@/lib/stores/users';
import { toast } from '@/lib/hooks/use-toast';
import { ListingEventKind, useHostingQuery, useInitiateHostingChatMutation, useRecordListingEventMutation } from '@/lib/services/graphql/generated';

const MAX: Record<string, number> = { NIGHTLY: 60, WEEKLY: 26, MONTHLY: 24, ANUALLY: 5, ONE_TIME_PAYMENT: 1 };

export default function ListingScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const [{ data, fetching, error }, refetch] = useHostingQuery({ variables: { hostingId: id, pagination: { limit: 20, offset: 0 }, childrenOnSale: true } });
	const h = data?.hosting;
	const [, record] = useRecordListingEventMutation();
	useEffect(() => {
		if (id) record({ hostingId: id, kind: ListingEventKind.View }).catch(() => {});
	}, [id, record]);

	if (!h)
		return (
			<View style={{ flex: 1, backgroundColor: color.bg }}>
				{fetching ? (
					<View style={{ gap: 16 }}>
						<Skeleton style={{ height: 340, borderRadius: 0 }} />
						<View style={{ paddingHorizontal: gutter, gap: 12 }}>
							<Skeleton style={{ height: 28, width: '80%' }} />
							<Skeleton style={{ height: 16, width: '50%' }} />
						</View>
					</View>
				) : (
					<View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: gutter }}>
						<Empty eyebrow="Off the map" title={error ? 'We couldn’t load this home' : 'This home isn’t listed anymore'} body="It may have been taken off Kushi. There are plenty more verified homes waiting." action={error ? 'Try again' : 'Explore homes'} onAction={() => (error ? refetch({ requestPolicy: 'network-only' }) : router.replace('/'))} />
					</View>
				)}
			</View>
		);
	return <Detail h={h} />;
}

function Detail({ h }: { h: Listing }) {
	const insets = useSafeAreaInsets();
	const { width } = useWindowDimensions();
	const layout = useLayout();
	const me = useUserStore((s) => s.user.user?.id);
	const mode = listingMode(h);
	const isOwner = !!me && h.host?.user?.id === me;
	const photos = useMemo(() => listingPhotos(h), [h]);
	const [page, setPage] = useState(0);
	const { saved, toggle } = useSaveToggle(h.id, h.saved);
	const [, record] = useRecordListingEventMutation();
	const [{ fetching: opening }, initiateChat] = useInitiateHostingChatMutation();
	const [more, setMore] = useState(false);
	const [quoteOpen, setQuoteOpen] = useState(false);
	const interval = h.paymentInterval ?? 'ANUALLY';
	const [periods, setPeriods] = useState(1);
	const { quote, fetching: quoting } = useQuote(h.id, periods, !quoteOpen || mode !== 'book');
	const tier = h.verification?.verificationTier ?? null;
	const rank = tierRank(tier);
	const where = place(h.city, h.state) || 'Nigeria';
	const hostName = h.host?.user?.profile?.fullName ?? 'Your host';
	const H = Math.round(width * 0.86);

	async function share() {
		record({ hostingId: h.id, kind: ListingEventKind.Share }).catch(() => {});
		await Share.share({ message: `${h.title} on Kushi — ${shareUrl(h)}`, url: shareUrl(h) }).catch(() => {});
	}
	async function message() {
		if (!isSignedIn()) return requireSignIn(`/hostings/${h.id}`);
		const r = await initiateChat({ hostingId: h.id });
		const cid = r.data?.initiateHostingChat?.id;
		if (!cid) return toast.show({ type: 'error', text1: 'Couldn’t open chat', text2: (r.error?.message ?? '').replace('[GraphQL] ', '') || 'Try again in a moment.' });
		record({ hostingId: h.id, kind: ListingEventKind.Message }).catch(() => {});
		router.push(`/chats/${cid}`);
	}
	function apply() {
		if (!isSignedIn()) return requireSignIn(`/hostings/${h.id}`);
		setQuoteOpen(false);
		router.push({ pathname: '/hostings/[id]/apply', params: { id: h.id, periods: String(periods) } });
	}

	const facts = [
		{ icon: Building2, k: 'Type', v: humanize(h.propertyType) },
		h.listingType !== 'SALE' ? { icon: CalendarClock, k: 'Stay', v: `${isShortLet(interval) ? 'Short-let' : 'Lease'} · ${intervalAdverb(interval)}` } : null,
		h.maxOccupants ? { icon: Users, k: 'Up to', v: `${h.maxOccupants} people` } : null,
		(h.childCount ?? 0) > 0 ? { icon: BedDouble, k: 'Units', v: `${h.childCount} available` } : null,
		h.electricityBilling ? { icon: Zap, k: 'Power', v: humanize(h.electricityBilling) } : null
	].filter(Boolean) as { icon: typeof Building2; k: string; v: string }[];

	const bars = h.reviewAverage
		? ([
				['Cleanliness', h.reviewAverage.cleanliness],
				['Accuracy', h.reviewAverage.accuracy],
				['Communication', h.reviewAverage.communication],
				['Location', h.reviewAverage.location],
				['Move-in', h.reviewAverage.checkIn],
				['Value', h.reviewAverage.value]
			] as [string, number | null | undefined][]).filter(([, v]) => v != null)
		: [];

	const cta =
		mode === 'book'
			? { title: 'Check price & apply', onPress: () => setQuoteOpen(true) }
			: mode === 'units'
				? { title: 'Choose a unit', onPress: () => toast.show({ type: 'info', text2: 'Scroll down to pick a unit.' }) }
				: mode === 'group-unit' && h.parent
					? { title: 'View whole property', onPress: () => router.push(`/hostings/${h.parent!.id}`) }
					: mode === 'agent'
						? { title: 'Message the agent', onPress: message }
						: mode === 'sale'
							? { title: 'Contact the seller', onPress: message }
							: { title: 'Ask about availability', onPress: message };

	// Tablets: medium = centered reading column under a wide gallery; expanded = two columns,
	// the price / CTA / facts / host card pinned on the right while the story scrolls on the left.
	const g = layout.compact ? gutter : layout.gutter;
	const inner = layout.contentWidth - g * 2;
	const sideW = Math.round(Math.min(440, Math.max(340, inner * 0.38)));
	const leftW = inner - sideW - 40;
	const photoW = layout.compact ? 1200 : 1600;
	const photoH = layout.compact ? 1100 : 1200;

	const gallery = (gw: number, gh: number, overlay: boolean, rounded?: boolean) => (
		<View style={[{ height: gh, backgroundColor: color.surface }, rounded && { borderRadius: radius.lg, overflow: 'hidden' }]}>
			{photos.length ? (
				<FlatList
					data={photos}
					horizontal
					pagingEnabled
					showsHorizontalScrollIndicator={false}
					keyExtractor={(p) => p.id}
					onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / gw))}
					renderItem={({ item, index }) => (
						<Pressable onPress={() => router.push({ pathname: '/hostings/[id]/gallery', params: { id: h.id, start: String(index) } })}>
							<Photo assetId={item.id} w={photoW} h={photoH} radius={0} priority={index === 0} style={{ width: gw, height: gh }} />
						</Pressable>
					)}
				/>
			) : (
				<Photo assetId={null} radius={0} style={{ width: gw, height: gh }} />
			)}
			{overlay ? (
				<View style={[s.galleryTop, { top: insets.top + 8 }]}>
					<IconButton label="Back" tone="glass" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}>
						<ArrowLeft size={19} color="#fff" />
					</IconButton>
					<View style={{ flexDirection: 'row', gap: 8 }}>
						<IconButton label="Share" tone="glass" onPress={share}>
							<Share2 size={18} color="#fff" />
						</IconButton>
						<IconButton label={saved ? 'Unsave' : 'Save'} tone="glass" onPress={toggle}>
							<Heart size={18} color={saved ? color.amber : '#fff'} fill={saved ? color.amber : 'transparent'} />
						</IconButton>
					</View>
				</View>
			) : null}
			{photos.length > 1 ? (
				<View style={s.counter}>
					<KText v="micro" style={{ color: '#fff' }}>
						{page + 1} / {photos.length} · {photos[page]?.group}
					</KText>
				</View>
			) : null}
		</View>
	);
	const titleBlock = (
		<View style={{ gap: 10 }}>
			{tier ? <Pill tone={TIERS[tier].tone}>{TIERS[tier].label}</Pill> : null}
			<KText v="display">{h.title}</KText>
			<View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
				<MapPin size={14} color={color.muted} />
				<KText v="small">{where}</KText>
				{h.averageRating && (h.totalRatings ?? 0) > 0 ? (
					<>
						<KText v="small"> · </KText>
						<Star size={13} color={color.amber} fill={color.amber} />
						<KText v="small" c="fg">
							{h.averageRating.toFixed(1)}
						</KText>
						<KText v="small">({h.totalRatings})</KText>
					</>
				) : null}
			</View>
		</View>
	);
	const ownerCard = isOwner ? (
		<Card tone="signal">
			<KText v="bodyStrong">This is your listing</KText>
			<KText v="small">Manage photos, price and applications from hosting.</KText>
			<Button title="Manage listing" variant="ghost" size="sm" onPress={() => router.push({ pathname: '/hostings/form/onboarding', params: { id: h.id } })} />
		</Card>
	) : null;
	const factsGrid = (
		<View style={s.facts}>
			{facts.map((f) => (
				<View key={f.k} style={s.fact}>
					<f.icon size={17} color={color.amber} />
					<KText v="micro">{f.k}</KText>
					<KText v="smallStrong" numberOfLines={2}>
						{f.v}
					</KText>
				</View>
			))}
		</View>
	);
	const hostRow = (
		<View style={s.host}>
			<Pressable onPress={() => h.host?.user?.id && router.push(`/users/${h.host.user.id}`)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
				<Avatar name={hostName} uri={h.host?.user?.profile?.image?.publicUrl} size={46} />
				<View style={{ flex: 1 }}>
					<KText v="bodyStrong" numberOfLines={1}>
						{h.managementType === 'AGENT_MANAGED' ? 'Listed by' : 'Hosted by'} {hostName}
					</KText>
					<KText v="xs">On Kushi since {date(h.host?.createdAt)}</KText>
				</View>
			</Pressable>
			{!isOwner ? (
				<Button title="Message" variant="ghost" size="sm" loading={opening} icon={<MessageCircle size={15} color={color.fg} />} onPress={message} />
			) : null}
		</View>
	);
	const story = (
		<>
			{h.description ? (
				<View style={{ gap: 10 }}>
					<KText v="heading">About this home</KText>
					<KText v="body" numberOfLines={more ? undefined : 6} style={{ color: color.fg2 }}>
						{h.description}
					</KText>
					{h.description.length > 280 ? (
						<Pressable onPress={() => setMore((m) => !m)}>
							<KText v="smallStrong" style={{ textDecorationLine: 'underline' }}>
								{more ? 'Show less' : 'Read more'}
							</KText>
						</Pressable>
					) : null}
				</View>
			) : null}

			{h.video?.asset?.publicUrl ? <VideoTour uri={h.video.asset.publicUrl} seconds={h.video.durationSeconds} /> : null}

			<PhotoTour hostingId={h.id} coverAssetId={h.coverImage?.asset?.id} />

			{(h.rooms ?? []).length ? (
				<View style={{ gap: 12 }}>
					<KText v="heading">Inside</KText>
					<FlatList
						horizontal
						data={h.rooms}
						keyExtractor={(r) => r.id}
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={{ gap: 12 }}
						renderItem={({ item: r }) => (
							<View style={{ width: 160, gap: 6 }}>
								<Photo assetId={r.images?.[0]?.asset?.id} w={400} h={300} style={{ width: 160, height: 116 }} />
								<KText v="smallStrong">
									{roomLabel(r.name)}
									{(r.count ?? 1) > 1 ? ` × ${r.count}` : ''}
								</KText>
								{r.description ? (
									<KText v="xs" numberOfLines={2}>
										{r.description}
									</KText>
								) : null}
							</View>
						)}
					/>
				</View>
			) : null}

			{(h.facilities ?? []).length ? (
				<View style={{ gap: 12 }}>
					<KText v="heading">What’s here</KText>
					<View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: 10 }}>
						{(h.facilities ?? []).map((f) => (
							<View key={f} style={{ width: '50%', flexDirection: 'row', alignItems: 'center', gap: 8, paddingRight: 8 }}>
								<Check size={15} color={color.amber} />
								<KText v="small" numberOfLines={1} style={{ flex: 1 }}>
									{humanize(f)}
								</KText>
							</View>
						))}
					</View>
				</View>
			) : null}

			{(h.children ?? []).length ? (
				<View style={{ gap: 12 }}>
					<KText v="heading">Units in this property</KText>
					{(h.children ?? []).map((u) => (
						<Pressable key={u.id} onPress={() => router.push(`/hostings/${u.id}`)} style={({ pressed }) => [s.unit, pressed && { opacity: 0.8 }]}>
							<Photo assetId={u.coverImage?.asset?.id} w={300} h={220} style={{ width: 84, height: 64 }} />
							<View style={{ flex: 1, gap: 2 }}>
								<KText v="smallStrong" numberOfLines={1}>
									{u.title}
								</KText>
								<KText v="small">
									{naira(u.price)} {perInterval(u.paymentInterval)}
								</KText>
								<KText v="xs" c={u.isBookable ? 'success' : 'muted'}>
									{u.isBookable ? 'Available' : 'Not available'}
								</KText>
							</View>
							<ChevronRight size={18} color={color.dim} />
						</Pressable>
					))}
				</View>
			) : null}

			{/* Trust */}
			<View style={{ gap: 12 }}>
				<KText v="heading">What Kushi has checked</KText>
				{TIER_ORDER.slice(1).map((t, i) => {
					const done = rank >= i + 1;
					return (
						<View key={t} style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
							<View style={{ paddingTop: 5 }}>
								<Waypoint done={done} />
							</View>
							<View style={{ flex: 1 }}>
								<KText v="smallStrong">{TIERS[t].label}</KText>
								<KText v="xs">{TIERS[t].what}</KText>
							</View>
							<KText v="micro" c={done ? 'amber' : 'dim'}>
								{done ? 'Checked' : 'Not yet'}
							</KText>
						</View>
					);
				})}
			</View>

			{mode === 'agent' ? (
				<Notice tone="warn" title="Kushi doesn’t hold payment for this listing">
					This home is advertised by an agent, and you arrange it with them directly. Inspect the property and check the paperwork before you pay anything — Kushi can’t protect or refund payments made outside the app.
				</Notice>
			) : null}

			{mode === 'book' ? (
				<Card>
					<Eyebrow>How renting on Kushi works</Eyebrow>
					{[
						[ShieldCheck, 'Apply and sign on your phone', 'Verify your identity once, then apply and sign the tenancy agreement.'],
						[Landmark, 'Pay into escrow', 'When the host accepts, you pay Kushi. The money is held — not sent to the host yet.'],
						[Check, 'Confirm once you have your keys', 'Arrange the handover with your host, confirm in the app, and the host is paid.']
					].map(([I, t, d]) => {
						const Icon = I as typeof Check;
						return (
							<View key={t as string} style={{ flexDirection: 'row', gap: 12 }}>
								<Icon size={18} color={color.amber} />
								<View style={{ flex: 1 }}>
									<KText v="smallStrong">{t as string}</KText>
									<KText v="xs">{d as string}</KText>
								</View>
							</View>
						);
					})}
				</Card>
			) : null}

			{/* Location */}
			<View style={{ gap: 10 }}>
				<KText v="heading">Where you’ll be</KText>
				<KText v="small">
					{where}
					{h.landmarks ? ` · Near ${h.landmarks}` : ''}
				</KText>
				{h.latitude && h.longitude ? (
					<View style={{ height: 200, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: color.surface }}>
						<MapView
							style={StyleSheet.absoluteFill}
							userInterfaceStyle="dark"
							scrollEnabled={false}
							zoomEnabled={false}
							pitchEnabled={false}
							rotateEnabled={false}
							initialRegion={{ latitude: Number(h.latitude), longitude: Number(h.longitude), latitudeDelta: 0.025, longitudeDelta: 0.025 }}
						>
							<Circle center={{ latitude: Number(h.latitude), longitude: Number(h.longitude) }} radius={450} strokeColor={color.amber} fillColor="rgba(245,158,11,0.18)" />
						</MapView>
					</View>
				) : null}
				<KText v="xs">The exact address is shared once your booking is paid.</KText>
			</View>

			{h.electricityBilling ? (
				<View style={{ gap: 6 }}>
					<KText v="heading">Electricity</KText>
					<KText v="small">
						{humanize(h.electricityBilling)}.{' '}
						{Number(h.electricityOutstandingBalance) > 0 && !h.electricityBalanceCleared
							? `The host declared an outstanding balance of ${naira(Number(h.electricityOutstandingBalance))} on this meter.`
							: h.electricityBalanceCleared
								? 'The host confirms there’s no outstanding balance.'
								: ''}
					</KText>
				</View>
			) : null}

			{/* Reviews */}
			<View style={{ gap: 12 }}>
				<KText v="heading">Reviews</KText>
				{bars.length ? (
					<View style={{ gap: 6 }}>
						{bars.map(([k, v]) => (
							<View key={k} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
								<KText v="xs" style={{ width: 96 }}>
									{k}
								</KText>
								<View style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: color.line2 }}>
									<View style={{ width: `${((v ?? 0) / 5) * 100}%`, height: 3, borderRadius: 2, backgroundColor: color.amber }} />
								</View>
								<KText v="xs" c="fg">
									{(v ?? 0).toFixed(1)}
								</KText>
							</View>
						))}
					</View>
				) : null}
				{(h.reviews ?? []).length ? (
					(h.reviews ?? []).slice(0, 6).map((r) => (
						<View key={r.id} style={{ gap: 6 }}>
							<View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
								<Avatar name={r.user?.profile?.fullName} uri={r.user?.profile?.image?.publicUrl} size={34} />
								<View>
									<KText v="smallStrong">{r.user?.profile?.fullName ?? 'Kushi renter'}</KText>
									<KText v="xs">
										{date(r.lastUpdated)} · ★ {r.averageRating?.toFixed(1)}
									</KText>
								</View>
							</View>
							{r.description ? <KText v="small">{r.description}</KText> : null}
						</View>
					))
				) : (
					<KText v="small">No reviews yet — renters can review a home after moving in.</KText>
				)}
			</View>
		</>
	);
	const sheet = (
		<Sheet open={quoteOpen} onClose={() => setQuoteOpen(false)} title="Your stay" footer={<Button title="Continue to apply" size="lg" block onPress={apply} testID="apply" />}>
			<KText v="label">How long</KText>
			<Stepper value={periods} onChange={setPeriods} max={MAX[interval] ?? 12} format={(n) => duration(n, interval)} />
			<QuoteLines quote={quote} fetching={quoting} />
			<KText v="xs">You won’t pay anything until the host accepts your application.</KText>
		</Sheet>
	);

	if (layout.expanded)
		return (
			<View style={{ flex: 1, backgroundColor: color.bg, paddingTop: insets.top }}>
				<View style={[{ flex: 1, paddingHorizontal: g }, centered(layout.contentWidth)]}>
					<View style={s.wideTop}>
						<IconButton label="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}>
							<ArrowLeft size={19} color={color.fg} />
						</IconButton>
						<View style={{ flexDirection: 'row', gap: 8 }}>
							<IconButton label="Share" onPress={share}>
								<Share2 size={18} color={color.fg} />
							</IconButton>
							<IconButton label={saved ? 'Unsave' : 'Save'} onPress={toggle}>
								<Heart size={18} color={saved ? color.amber : color.fg} fill={saved ? color.amber : 'transparent'} />
							</IconButton>
						</View>
					</View>
					<View style={{ flex: 1, flexDirection: 'row', gap: 40 }}>
						<FlatList
							style={{ width: leftW, flexGrow: 0 }}
							data={[0]}
							keyExtractor={() => 'x'}
							showsVerticalScrollIndicator={false}
							contentContainerStyle={{ paddingBottom: insets.bottom + 48 }}
							renderItem={() => (
								<View style={{ gap: 30 }}>
									{gallery(leftW, Math.round(leftW * 0.66), false, true)}
									{titleBlock}
									{story}
								</View>
							)}
						/>
						<ScrollView style={{ width: sideW, flexGrow: 0 }} contentContainerStyle={{ gap: 18, paddingBottom: insets.bottom + 32 }} showsVerticalScrollIndicator={false}>
							{ownerCard}
							{!isOwner ? (
								<Card>
									<Pressable onPress={() => mode === 'book' && setQuoteOpen(true)} style={{ gap: 2 }}>
										<KText v="title" numberOfLines={1} adjustsFontSizeToFit>
											{naira(mode === 'units' && h.priceFrom ? h.priceFrom : h.price)}
										</KText>
										<KText v="small">
											{mode === 'units' && h.priceFrom ? 'units from · ' : ''}
											{h.listingType === 'SALE' ? 'asking price' : perInterval(interval).replace('/ ', 'per ')}
											{mode === 'book' ? ' · see total' : ''}
										</KText>
									</Pressable>
									<Button title={cta.title} size="lg" block onPress={cta.onPress} loading={opening && mode !== 'book'} testID="listing-cta" />
									{mode === 'book' ? <KText v="xs">You won’t pay anything until the host accepts your application.</KText> : null}
								</Card>
							) : null}
							{factsGrid}
							{hostRow}
						</ScrollView>
					</View>
				</View>
				{sheet}
			</View>
		);

	return (
		<View style={{ flex: 1, backgroundColor: color.bg }}>
			<FlatList
				data={[0]}
				keyExtractor={() => 'x'}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: 130 }}
				renderItem={() => (
					<View>
						{/* Gallery */}
						{layout.compact ? gallery(width, H, true) : gallery(width, Math.round(Math.min(width * 0.62, layout.height * 0.5)), true)}

						<View style={[{ paddingHorizontal: gutter, gap: 26, paddingTop: 22 }, centered(layout.max('reading'))]}>
							{/* Title */}
							{titleBlock}

							{ownerCard}

							{/* Facts */}
							{factsGrid}

							{/* Host */}
							{hostRow}

							{story}
						</View>
					</View>
				)}
			/>

			{/* Price bar */}
			{!isOwner ? (
				<View style={[s.bar, { paddingBottom: Math.max(insets.bottom, 12) }, !layout.compact && { paddingHorizontal: Math.max(g, (width - maxWidth.reading) / 2) }]}>
					<Pressable onPress={() => mode === 'book' && setQuoteOpen(true)} style={{ flex: 1, minWidth: 0 }}>
						<KText style={{ fontFamily: font.display, fontSize: 18, color: color.fg, letterSpacing: -0.6 }} numberOfLines={1} adjustsFontSizeToFit>
							{naira(mode === 'units' && h.priceFrom ? h.priceFrom : h.price)}
						</KText>
						<KText v="xs" numberOfLines={1}>
							{mode === 'units' && h.priceFrom ? 'units from · ' : ''}
							{h.listingType === 'SALE' ? 'asking price' : perInterval(interval).replace('/ ', 'per ')}
							{mode === 'book' ? ' · see total' : ''}
						</KText>
					</Pressable>
					<Button title={cta.title} onPress={cta.onPress} loading={opening && mode !== 'book'} testID="listing-cta" />
				</View>
			) : null}

			{/* Price & apply */}
			{sheet}
		</View>
	);
}

function VideoTour({ uri, seconds }: { uri: string; seconds?: number | null }) {
	const [play, setPlay] = useState(false);
	const player = useVideoPlayer(play ? uri : null, (p) => {
		p.loop = false;
		p.play();
	});
	return (
		<View style={{ gap: 10 }}>
			<KText v="heading">Video tour</KText>
			<View style={{ height: 210, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: color.surface }}>
				{play ? (
					<VideoView player={player} style={StyleSheet.absoluteFill} nativeControls contentFit="cover" allowsFullscreen />
				) : (
					<Pressable onPress={() => setPlay(true)} style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center', gap: 8 }]}>
						<PlayCircle size={48} color={color.amber} strokeWidth={1.4} />
						<KText v="small" c="fg">
							Walk through on video{seconds ? ` · ${Math.round(seconds / 60) || 1} min` : ''}
						</KText>
						<KText v="micro">Recorded on site by the host</KText>
					</Pressable>
				)}
			</View>
		</View>
	);
}

const s = StyleSheet.create({
	galleryTop: { position: 'absolute', left: gutter, right: gutter, flexDirection: 'row', justifyContent: 'space-between' },
	counter: { position: 'absolute', right: gutter, bottom: 14, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill, backgroundColor: 'rgba(7,8,11,0.65)' },
	facts: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
	fact: { width: '48%', flexGrow: 1, gap: 4, padding: 12, borderRadius: radius.md, borderWidth: 1, borderColor: color.line, backgroundColor: color.bg2 },
	host: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: color.line2 },
	unit: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: radius.md, borderWidth: 1, borderColor: color.line, backgroundColor: color.bg2 },
	wideTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, paddingBottom: 16 },
	bar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: gutter, paddingTop: 12, backgroundColor: 'rgba(7,8,11,0.97)', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: color.line2 }
});

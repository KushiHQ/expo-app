import { useState } from 'react';
import { Platform, Share, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { BadgeCheck, Flag, Share2, Star } from 'lucide-react-native';
import { Avatar, Button, Card, Empty, Eyebrow, Field, Header, IconButton, KText, Notice, Photo, Pill, Screen, Sheet, Skeleton } from '@/components/k';
import { Pressable } from '@/components/k/pressable';
import { color, radius } from '@/lib/k/theme';
import { naira, place, relative } from '@/lib/k/format';
import { cleanError, monthOf } from '@/lib/k/account';
import { toast } from '@/lib/hooks/use-toast';
import { slugify } from '@/lib/utils/text';
import { useUserStore } from '@/lib/stores/users';
import { ManagementType, useReportAgentReviewMutation, useReviewAgentMutation, useUserProfileQuery } from '@/lib/services/graphql/generated';

/** Public profile of a host or agent: trust signals, live listings and reviews. */
export default function PublicProfile() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const myId = useUserStore((s) => s.user.user?.id);
	const [{ data, fetching, error }, refetch] = useUserProfileQuery({ variables: { userId: String(id) }, requestPolicy: 'cache-and-network' });
	const p = data?.userProfile;
	const self = !!myId && myId === id;
	const [reviewOpen, setReviewOpen] = useState(false);
	const [reportId, setReportId] = useState<string | null>(null);
	const [, report] = useReportAgentReviewMutation();

	async function share() {
		if (!p) return;
		const slug = `${slugify(p.fullName)}___${id}`;
		const base = process.env.EXPO_PUBLIC_SHARE_HOST_URL || 'https://housing.kushi.ng/host/<slug>';
		const url = base.includes('<slug>') ? base.replace('<slug>', slug) : `${base.replace(/\/$/, '')}/${slug}`;
		const link = `${url}${url.includes('?') ? '&' : '?'}shared=true`;
		const caption = `Check out ${p.fullName} on Kushi`;
		await Share.share(Platform.OS === 'ios' ? { title: p.fullName, message: caption, url: link } : { title: p.fullName, message: `${caption}\n\n${link}` }).catch(() => {});
	}

	const header = (
		<Header
			title={p?.fullName ?? 'Profile'}
			right={
				p ? (
					<IconButton label="Share profile" onPress={share}>
						<Share2 size={17} color={color.fg} />
					</IconButton>
				) : undefined
			}
		/>
	);

	if (!p)
		return (
			<Screen header={header}>
				{fetching ? (
					<View style={{ gap: 14, paddingTop: 24, alignItems: 'center' }}>
						<Skeleton style={{ width: 96, height: 96, borderRadius: 48 }} />
						<Skeleton style={{ width: 200, height: 24 }} />
						<Skeleton style={{ alignSelf: 'stretch', height: 160 }} />
					</View>
				) : (
					<Empty
						eyebrow={error ? 'Couldn’t load' : 'Not found'}
						title={error ? 'We couldn’t open this profile' : 'This profile isn’t available'}
						body={error ? cleanError(error.message) : 'The account may have been closed.'}
						action={error ? 'Try again' : undefined}
						onAction={error ? () => refetch({ requestPolicy: 'network-only' }) : undefined}
					/>
				)}
			</Screen>
		);

	const rating = p.agentRatingAvg ?? 0;
	return (
		<Screen header={header} onRefresh={() => refetch({ requestPolicy: 'network-only' })} refreshing={false}>
			<View style={{ alignItems: 'center', gap: 10, paddingTop: 24 }}>
				<Avatar name={p.fullName} uri={p.avatar} size={96} />
				<KText v="title" center>
					{p.fullName}
				</KText>
				<View style={{ alignItems: 'center' }}>{p.verified ? <Pill tone="success">Identity verified</Pill> : <Pill>Not yet verified</Pill>}</View>
				<KText v="xs">{[p.memberSince ? `On Kushi since ${monthOf(p.memberSince)}` : null, p.agentReviewCount ? `${rating.toFixed(1)} ★ · ${p.agentReviewCount} review${p.agentReviewCount === 1 ? '' : 's'}` : 'No reviews yet'].filter(Boolean).join(' · ')}</KText>
			</View>

			{self ? (
				<Notice tone="info" title="This is how others see you" action={p.verified ? 'Edit personal details' : 'Check my verification'} onAction={() => router.push(p.verified ? `/users/${id}/profile/edit` : '/verify')}>
					{p.verified ? 'Your verified badge shows on your listings and applications.' : 'The verified badge appears here once Kushi has confirmed your identity.'}
				</Notice>
			) : (
				<Button title="Leave a review" variant="ghost" block icon={<Star size={16} color={color.fg} />} onPress={() => setReviewOpen(true)} />
			)}

			{p.verified ? (
				<Card>
					<View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
						<BadgeCheck size={20} color={color.success} />
						<KText v="small" c="fg" style={{ flex: 1 }}>
							Kushi has checked {p.fullName.split(' ')[0]}’s identity against government records. Rent you pay through Kushi is held in escrow until you move in.
						</KText>
					</View>
				</Card>
			) : null}

			{p.listings.length ? (
				<View style={{ gap: 10 }}>
					<Eyebrow>Live listings · {p.listings.length}</Eyebrow>
					{p.listings.map((l) => (
						<Pressable key={l.id} accessibilityRole="button" onPress={() => router.push(`/hostings/${l.id}`)} style={({ pressed }) => [s.listing, pressed && { opacity: 0.8 }]}>
							<Photo uri={l.coverImage?.asset.publicUrl} style={{ width: 64, height: 64 }} />
							<View style={{ flex: 1, gap: 3 }}>
								<KText v="bodyStrong" numberOfLines={1}>
									{l.title ?? 'Untitled listing'}
								</KText>
								<KText v="xs">{place(l.city, l.state)}</KText>
								<View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
									{l.price != null ? <KText v="smallStrong">{naira(Number(l.price))}</KText> : null}
									{l.managementType === ManagementType.AgentManaged ? <KText v="micro">Agent managed</KText> : null}
								</View>
							</View>
						</Pressable>
					))}
				</View>
			) : null}

			<View style={{ gap: 10 }}>
				<Eyebrow>Reviews{p.reviews.length ? ` · ${p.reviews.length}` : ''}</Eyebrow>
				{p.reviews.length ? (
					p.reviews.map((r) => (
						<Card key={r.id}>
							<View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
								<Avatar name={r.reviewerName} uri={r.reviewerAvatar} size={36} />
								<View style={{ flex: 1, gap: 2 }}>
									<KText v="smallStrong">{r.reviewerName}</KText>
									<KText v="xs">
										{'★'.repeat(Math.round(r.rating))}
										{'☆'.repeat(5 - Math.round(r.rating))} · {relative(r.createdAt)}
									</KText>
								</View>
								{!self ? (
									<IconButton label={`Report review by ${r.reviewerName}`} size={34} onPress={() => setReportId(r.id)}>
										<Flag size={14} color={color.muted} />
									</IconButton>
								) : null}
							</View>
							{r.comment ? <KText v="small">{r.comment}</KText> : null}
						</Card>
					))
				) : (
					<KText v="small">{self ? 'Reviews from renters you’ve hosted will appear here.' : 'No reviews yet. Renters can review after dealing with this host.'}</KText>
				)}
			</View>

			<ReviewSheet open={reviewOpen} onClose={() => setReviewOpen(false)} agentId={String(id)} name={p.fullName} onDone={() => refetch({ requestPolicy: 'network-only' })} />
			<Sheet open={!!reportId} onClose={() => setReportId(null)} eyebrow="Report" title="Report this review?">
				<KText v="small">Our team will check it against the review rules — fake, abusive or off-topic reviews are removed. The reviewer isn’t told who reported it.</KText>
				<Button
					title="Report review"
					variant="danger"
					size="lg"
					block
					onPress={async () => {
						const rid = reportId;
						setReportId(null);
						if (!rid) return;
						const r = await report({ reviewId: rid });
						toast.show(r.error ? { type: 'error', text1: 'Couldn’t report it', text2: cleanError(r.error.message) } : { type: 'success', text2: 'Thanks — our team will take a look.' });
					}}
				/>
				<Button title="Cancel" variant="ghost" size="lg" block onPress={() => setReportId(null)} />
			</Sheet>
		</Screen>
	);
}

const LABELS = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'];

function ReviewSheet({ open, onClose, agentId, name, onDone }: { open: boolean; onClose: () => void; agentId: string; name: string; onDone: () => void }) {
	const [rating, setRating] = useState(0);
	const [comment, setComment] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [{ fetching }, review] = useReviewAgentMutation();

	async function submit() {
		setError(null);
		const r = await review({ agentId, rating, comment: comment.trim() || undefined });
		if (r.error) return setError(cleanError(r.error.graphQLErrors[0]?.message ?? r.error.message));
		toast.show({ type: 'success', text1: 'Review posted', text2: 'Thanks for helping other renters.' });
		setRating(0);
		setComment('');
		onClose();
		onDone();
	}

	return (
		<Sheet open={open} onClose={onClose} eyebrow="Review" title={`How was ${name.split(' ')[0]}?`}>
			<KText v="small">Rate how they handled viewings, communication and keeping their word.</KText>
			<View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10 }} accessibilityRole="adjustable" accessibilityLabel="Rating" accessibilityValue={{ text: rating ? `${rating} of 5` : 'Not rated' }}>
				{[1, 2, 3, 4, 5].map((n) => (
					<Pressable key={n} accessibilityRole="button" accessibilityLabel={`${n} star${n > 1 ? 's' : ''}`} onPress={() => setRating(n)} hitSlop={6} style={s.star}>
						<Star size={30} color={n <= rating ? color.amber : color.dim} fill={n <= rating ? color.amber : 'transparent'} />
					</Pressable>
				))}
			</View>
			<KText v="label" center>
				{LABELS[rating] || 'Tap a star'}
			</KText>
			<Field label="Your review" optional multiline value={comment} onChangeText={setComment} maxLength={1000} placeholder="What should other renters know?" />
			{error ? <Notice tone="danger">{error}</Notice> : null}
			<Button title="Post review" size="lg" block loading={fetching} disabled={!rating} onPress={submit} />
		</Sheet>
	);
}

const s = StyleSheet.create({
	listing: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: radius.lg, borderWidth: 1, borderColor: color.line, backgroundColor: color.bg2 },
	star: { padding: 4 }
});

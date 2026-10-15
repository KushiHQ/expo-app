import { StyleSheet, View } from 'react-native';
import { Pressable } from '@/components/k/pressable';
import { router } from 'expo-router';
import { ChevronRight, Inbox } from 'lucide-react-native';
import { color, radius } from '@/lib/k/theme';
import { date, duration, naira, perInterval, place, relative } from '@/lib/k/format';
import { Avatar, Photo, Pill } from './surface';
import { KText } from './text';

export const PUBLISH: Record<string, { label: string; tone: 'success' | 'info' | 'neutral' | 'danger' }> = {
	LIVE: { label: 'Live', tone: 'success' },
	INREVIEW: { label: 'In review', tone: 'info' },
	DRAFT: { label: 'Draft', tone: 'neutral' },
	REJECTED: { label: 'Needs changes', tone: 'danger' },
	ARCHIVED: { label: 'Archived', tone: 'neutral' }
};

export const APP_STATUS: Record<string, { label: string; tone: 'live' | 'info' | 'success' | 'danger' | 'neutral' }> = {
	IN_PROGRESS: { label: 'Draft', tone: 'neutral' },
	SUBMITED: { label: 'New', tone: 'live' },
	SYSTEM_VERIFIED: { label: 'Checked by Kushi', tone: 'live' },
	ADMIN_VERIFIED: { label: 'Approved by Kushi', tone: 'live' },
	HOST_VERIFIED: { label: 'Verified by you', tone: 'info' },
	ACCEPTED: { label: 'Accepted', tone: 'success' },
	REJECTED: { label: 'Declined', tone: 'danger' },
	CANCELLED: { label: 'Withdrawn', tone: 'neutral' }
};
export const DECIDABLE = ['SUBMITED', 'SYSTEM_VERIFIED', 'ADMIN_VERIFIED', 'HOST_VERIFIED'];

type L = {
	id: string;
	title?: string | null;
	publishStatus?: string | null;
	city?: string | null;
	state?: string | null;
	price?: number | null;
	priceFrom?: number | null;
	paymentInterval?: string | null;
	listingType?: string | null;
	kind?: string | null;
	childCount?: number | null;
	pendingBookingApplicationsCount?: number | null;
	coverImage?: { asset?: { id: string } | null } | null;
};

/** A host's listing row → listing management. */
export function HostListingRow({ l, testID }: { l: L; testID?: string }) {
	const st = PUBLISH[l.publishStatus ?? 'DRAFT'] ?? PUBLISH.DRAFT;
	return (
		<Pressable testID={testID} accessibilityRole="button" onPress={() => router.push({ pathname: '/hostings/form/onboarding', params: { id: l.id } })} style={({ pressed }) => [s.row, pressed && { opacity: 0.8 }]}>
			<Photo assetId={l.coverImage?.asset?.id} w={260} h={200} style={{ width: 88, height: 70 }} />
			<View style={{ flex: 1, gap: 4 }}>
				<KText v="smallStrong" numberOfLines={1}>
					{l.title || 'Untitled listing'}
				</KText>
				<KText v="xs" numberOfLines={1}>
					{place(l.city, l.state) || 'No location yet'}
					{l.price ? ` · ${naira(l.kind === 'PARENT' && l.priceFrom ? l.priceFrom : l.price)} ${l.listingType === 'SALE' ? '' : perInterval(l.paymentInterval)}` : ''}
				</KText>
				<View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
					<Pill tone={st.tone}>{st.label}</Pill>
					{(l.pendingBookingApplicationsCount ?? 0) > 0 ? (
						<View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
							<Inbox size={12} color={color.amber} />
							<KText v="xs" c="amber">
								{l.pendingBookingApplicationsCount} waiting
							</KText>
						</View>
					) : null}
				</View>
			</View>
			<ChevronRight size={18} color={color.dim} />
		</Pressable>
	);
}

type AppRow = {
	id: string;
	fullName?: string | null;
	status: string;
	createdAt: string;
	commencementDate?: string | null;
	intervalMultiplier?: number | null;
	hosting: { title?: string | null; paymentInterval?: string | null; price?: number | null };
	guest?: { user?: { profile?: { fullName?: string | null; image?: { publicUrl?: string | null } | null } | null } | null } | null;
};

/** An application row → host review. `onPress`/`selected` let a tablet board show it in a side pane. */
export function ApplicationRow({ a, onPress, selected }: { a: AppRow; onPress?: () => void; selected?: boolean }) {
	const st = APP_STATUS[a.status] ?? { label: a.status, tone: 'neutral' as const };
	return (
		<Pressable
			testID={`application-${a.id}`}
			accessibilityRole="button"
			accessibilityState={{ selected: !!selected }}
			accessibilityLabel={`${a.fullName ?? a.guest?.user?.profile?.fullName ?? 'Applicant'}, ${st.label}, ${a.hosting.title ?? ''}`}
			onPress={onPress ?? (() => router.push(`/applications/${a.id}`))}
			style={({ pressed }) => [s.row, selected && { borderColor: color.amberLine, backgroundColor: 'rgba(245,158,11,0.06)' }, pressed && { opacity: 0.8 }]}
		>
			<Avatar name={a.fullName ?? a.guest?.user?.profile?.fullName} uri={a.guest?.user?.profile?.image?.publicUrl} size={46} />
			<View style={{ flex: 1, gap: 3 }}>
				<View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
					<KText v="smallStrong" numberOfLines={1} style={{ flex: 1 }}>
						{a.fullName ?? a.guest?.user?.profile?.fullName}
					</KText>
					<KText v="xs">{relative(a.createdAt)}</KText>
				</View>
				<KText v="xs" numberOfLines={1}>
					{a.hosting.title}
				</KText>
				<KText v="xs" numberOfLines={1}>
					Move in {date(a.commencementDate)} · {duration(a.intervalMultiplier ?? 1, a.hosting.paymentInterval ?? 'ANUALLY')}
				</KText>
				<Pill tone={st.tone}>{st.label}</Pill>
			</View>
		</Pressable>
	);
}

const s = StyleSheet.create({
	row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: radius.lg, borderWidth: 1, borderColor: color.line, backgroundColor: color.bg2 }
});

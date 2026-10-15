import { useState } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Svg, { Rect } from 'react-native-svg';
import { Eye, Heart, MessageSquare, Phone, Rocket, Share2, Users } from 'lucide-react-native';
import { Button, Card, Empty, Header, KText, Screen, Skeleton } from '@/components/k';
import { color, font } from '@/lib/k/theme';
import { useLayout } from '@/lib/k/layout';
import { cleanError } from '@/lib/k/use-listing-step';
import { useHostingAnalyticsQuery, useHostingQuery } from '@/lib/services/graphql/generated';

const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '')}k` : String(n));

/** How a listing is doing over the last 30 days. */
export default function Insights() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const layout = useLayout();
	const [{ data, fetching, error }, refetch] = useHostingAnalyticsQuery({ variables: { hostingId: String(id) } });
	const [{ data: hd }] = useHostingQuery({ variables: { hostingId: String(id) } });
	const a = data?.hostingAnalytics;
	const live = hd?.hosting?.publishStatus === 'LIVE';
	const cols = layout.compact ? 2 : 3;
	const [w, setW] = useState(0);

	const stats = a
		? [
				{ k: 'Views', v: a.totalViews, icon: Eye, d: 'Times it was opened' },
				{ k: 'People', v: a.uniqueViews, icon: Users, d: 'Different people who looked' },
				{ k: 'Saves', v: a.saves, icon: Heart, d: 'Added to a saved list' },
				{ k: 'Messages', v: a.messages, icon: MessageSquare, d: 'Chats started with you' },
				{ k: 'Shares', v: a.shares, icon: Share2, d: 'Sent to someone else' },
				{ k: 'Number shown', v: a.contactReveals, icon: Phone, d: 'Tapped to see your contact' }
			]
		: [];
	const points = (a?.viewsSeries.dataPoints ?? []).map((p) => ({ label: p.label, v: Number(p.amount) || 0 }));
	const max = Math.max(1, ...points.map((p) => p.v));
	const gap = 3;
	const bar = points.length ? Math.max(2, (w - gap * (points.length - 1)) / points.length) : 0;

	return (
		<Screen header={<Header eyebrow={hd?.hosting?.title ?? 'Listing'} title="Insights" />} onRefresh={() => refetch({ requestPolicy: 'network-only' })} refreshing={false} contentStyle={{ paddingTop: 20 }}>
			<KText v="label">Last 30 days</KText>
			{fetching && !a ? (
				<View style={{ gap: 10 }}>
					<Skeleton style={{ height: 180 }} />
					<Skeleton style={{ height: 200 }} />
				</View>
			) : error && !a ? (
				<Empty eyebrow="Offline" title="Insights didn’t load" body={cleanError(error.message)} action="Try again" onAction={() => refetch({ requestPolicy: 'network-only' })} />
			) : a ? (
				<>
					<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
						{stats.map((s) => (
							<View key={s.k} style={{ width: `${100 / cols - 2}%`, flexGrow: 1 }}>
								<Card style={{ padding: 14, gap: 6 }}>
									<s.icon size={16} color={color.amber} />
									<KText style={{ fontFamily: font.display, fontSize: 24, color: color.fg }}>{fmt(s.v)}</KText>
									<KText v="smallStrong">{s.k}</KText>
									<KText v="xs">{s.d}</KText>
								</Card>
							</View>
						))}
					</View>
					<Card>
						<KText v="bodyStrong">Views each day</KText>
						{points.length && points.some((p) => p.v) ? (
							<View onLayout={(e) => setW(e.nativeEvent.layout.width)} accessibilityLabel={`Views per day, highest ${max}`}>
								{w ? (
									<Svg width={w} height={140}>
										{points.map((p, i) => {
											const h = Math.max(2, (p.v / max) * 132);
											return <Rect key={i} x={i * (bar + gap)} y={140 - h} width={bar} height={h} rx={2} fill={p.v === max ? color.amber : color.amberLine} />;
										})}
									</Svg>
								) : (
									<View style={{ height: 140 }} />
								)}
								<View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
									<KText v="micro">{points[0]?.label}</KText>
									<KText v="micro">{points[points.length - 1]?.label}</KText>
								</View>
							</View>
						) : (
							<KText v="small">No views yet in this period.{live ? '' : ' Publish the listing so renters can find it.'}</KText>
						)}
					</Card>
					{live ? (
						<Card tone="amber">
							<KText v="bodyStrong">Want more eyes on it?</KText>
							<KText v="small">A boost moves it up in search and the home feed for a few days.</KText>
							<Button title="Boost this listing" size="sm" icon={<Rocket size={14} color={color.onAmber} />} onPress={() => router.push(`/hostings/${id}/boost`)} style={{ alignSelf: 'flex-start' }} />
						</Card>
					) : null}
				</>
			) : null}
		</Screen>
	);
}

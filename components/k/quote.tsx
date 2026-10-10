import { View } from 'react-native';
import { color } from '@/lib/k/theme';
import { naira } from '@/lib/k/format';
import { useCalculateHostingFeesQuery } from '@/lib/services/graphql/generated';
import { KText } from './text';
import { Divider, Skeleton } from './surface';

/** Server-calculated price for N periods (rent, fees, caution, stamp duty…). */
export function useQuote(hostingId: string, periods: number, pause = false) {
	const [{ data, fetching }] = useCalculateHostingFeesQuery({ variables: { hostingId, multiplier: periods }, pause });
	return { quote: data?.calculateHostingFees ?? null, fetching };
}

type Q = NonNullable<ReturnType<typeof useQuote>['quote']>;

/** Itemised breakdown. Uses the server's labelled line items when available. */
export function QuoteLines({ quote, fetching }: { quote: Q | null; fetching?: boolean }) {
	if (!quote)
		return fetching ? (
			<View style={{ gap: 10 }}>
				{[0, 1, 2].map((i) => (
					<Skeleton key={i} style={{ height: 16 }} />
				))}
			</View>
		) : null;
	const lines =
		quote.lineItems?.length
			? quote.lineItems.filter((l) => Number(l.amount) > 0).map((l) => ({ k: l.label, v: Number(l.amount), d: l.description }))
			: [
					{ k: 'Rent', v: quote.baseRent, d: null },
					{ k: 'Service charge', v: quote.serviceCharge, d: null },
					{ k: 'Caution deposit (refundable)', v: quote.cautionFee, d: null },
					{ k: 'Legal & agreement', v: quote.legalFee, d: null },
					{ k: 'Stamp duty', v: quote.stampDuty, d: null },
					{ k: 'Kushi service fee', v: quote.guestServiceCharge, d: null }
				].filter((l) => Number(l.v) > 0);
	return (
		<View>
			{lines.map((l) => (
				<View key={l.k} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 16, paddingVertical: 7 }}>
					<View style={{ flex: 1 }}>
						<KText v="small">{l.k}</KText>
						{l.d ? <KText v="xs">{l.d}</KText> : null}
					</View>
					<KText v="smallStrong">{naira(Number(l.v))}</KText>
				</View>
			))}
			<Divider style={{ marginVertical: 8 }} />
			<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
				<KText v="bodyStrong">Total</KText>
				<KText v="money">{naira(Number(quote.totalPayableAmount))}</KText>
			</View>
			{Number(quote.cautionFee) > 0 ? (
				<KText v="xs" style={{ marginTop: 6, color: color.muted }}>
					Includes a refundable caution deposit of {naira(Number(quote.cautionFee))}, held by Kushi.
				</KText>
			) : null}
		</View>
	);
}

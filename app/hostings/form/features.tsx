import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { Check, Chip, Choice, Field, IconButton, KText } from '@/components/k';
import { Block, CountField, MoneyField, StepScreen } from '@/components/k/listing-form';
import { color } from '@/lib/k/theme';
import { useListingStep } from '@/lib/k/use-listing-step';
import { usePropertyTypeConfig } from '@/lib/hooks/use-property-type-config';
import { electricityBillingLabel, showElectricityDebt } from '@/lib/constants/hosting/step-rules';
import { ElectricityBilling, ListingType } from '@/lib/services/graphql/generated';

const BILLING_DETAIL: Record<ElectricityBilling, string> = {
	[ElectricityBilling.PrepaidMeter]: 'The tenant buys units as they go.',
	[ElectricityBilling.PostpaidMeter]: 'A monthly bill from the distribution company.',
	[ElectricityBilling.Estimated]: 'No meter — billed on an estimate.',
	[ElectricityBilling.NoSupply]: 'Not connected to the grid.'
};

/** Step 4 — amenities, electricity billing and who it suits. Skipped for land. */
export default function Features() {
	const params = useLocalSearchParams<{ id?: string }>();
	const f = useListingStep(params.id, 'features');
	const { input, updateInput, hosting } = f;
	const { facilitiesFor } = usePropertyTypeConfig();
	const [custom, setCustom] = useState('');
	const [tried, setTried] = useState(false);
	const [busy, setBusy] = useState(false);
	const selected = useMemo(() => input.facilities ?? [], [input.facilities]);
	const all = useMemo(() => {
		const base = facilitiesFor(input.propertyType);
		return [...base, ...selected.filter((x) => !base.includes(x))];
	}, [facilitiesFor, input.propertyType, selected]);

	const toggle = (x: string) => updateInput({ facilities: selected.includes(x) ? selected.filter((v) => v !== x) : [...selected, x] });
	function addCustom() {
		const v = custom.trim();
		if (!v) return;
		if (!selected.some((x) => x.toLowerCase() === v.toLowerCase())) updateInput({ facilities: [...selected, v] });
		setCustom('');
	}

	const error = !selected.length ? 'Choose at least one feature.' : null;
	async function next() {
		setTried(true);
		if (error) return;
		setBusy(true);
		const id = await f.save();
		setBusy(false);
		if (id) f.advance(id);
	}

	return (
		<StepScreen
			stepKey="features"
			hosting={hosting}
			onBack={f.leave}
			loading={!f.ready}
			intro="Renters filter by these, so tick everything that’s really there."
			primary={{ title: 'Save and continue', onPress: next, loading: busy, testID: 'step-next' }}
			footnote={tried && error ? <KText v="xs" c="danger" center>{error}</KText> : null}
		>
			<Block title="Features" sub={selected.length ? `${selected.length} selected` : undefined}>
				<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
					{all.map((x) => (
						<Chip key={x} label={x} on={selected.includes(x)} onPress={() => toggle(x)} />
					))}
				</View>
				<View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-end' }}>
					<View style={{ flex: 1 }}>
						<Field label="Something else?" value={custom} onChangeText={setCustom} placeholder="e.g. Rooftop terrace" returnKeyType="done" onSubmitEditing={addCustom} />
					</View>
					<IconButton label="Add feature" size={52} disabled={!custom.trim()} onPress={addCustom}>
						<Plus size={20} color={color.fg} />
					</IconButton>
				</View>
			</Block>

			<Block title="Electricity" sub="One of the first things renters ask.">
				{Object.values(ElectricityBilling).map((b) => (
					<Choice key={b} title={electricityBillingLabel(b)} detail={BILLING_DETAIL[b]} on={input.electricityBilling === b} onPress={() => updateInput({ electricityBilling: b })} />
				))}
				{showElectricityDebt(input.electricityBilling, input.paymentInterval) ? (
					<View style={{ gap: 12 }}>
						<MoneyField label="Unpaid electricity bill" optional value={input.electricityOutstandingBalance} onChange={(v) => updateInput({ electricityOutstandingBalance: v || null })} hint="As you declare it. Renters see this so there are no surprises at move-in." />
						<Check on={!!input.electricityBalanceCleared} onPress={() => updateInput({ electricityBalanceCleared: !input.electricityBalanceCleared })}>
							<KText v="small">There’s nothing owing, or it will be cleared before move-in.</KText>
						</Check>
					</View>
				) : null}
			</Block>

			{input.listingType !== ListingType.Sale ? (
				<Block title="Who it suits">
					<CountField label="Most people who can live here" optional value={input.maxOccupants} onChange={(maxOccupants) => updateInput({ maxOccupants })} hint="Shown on the listing and written into the tenancy agreement." />
				</Block>
			) : null}
		</StepScreen>
	);
}

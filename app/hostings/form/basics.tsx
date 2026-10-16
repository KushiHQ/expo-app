import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { Choice, KText, Notice } from '@/components/k';
import { Block, PickerSheet, SelectField, StepScreen } from '@/components/k/listing-form';
import { useListingStep } from '@/lib/k/use-listing-step';
import { usePropertyTypeConfig } from '@/lib/hooks/use-property-type-config';
import { useUserStore } from '@/lib/stores/users';
import { place } from '@/lib/k/format';
import { HostingKind, ListingType, ManagementType, PublishStatus, UnitStructure, useHostListingsQuery } from '@/lib/services/graphql/generated';

/** Step 1 — who manages it, rent or sale, what kind of property, and whether it has units. */
export default function Basics() {
	const params = useLocalSearchParams<{ id?: string; parent?: string }>();
	const f = useListingStep(params.id, 'basics');
	const { input, updateInput, hosting } = f;
	const me = useUserStore((s) => s.user.user?.id);
	const { propertyTypes } = usePropertyTypeConfig();
	const [typeOpen, setTypeOpen] = useState(false);
	const [parentOpen, setParentOpen] = useState(false);
	const [tried, setTried] = useState(false);
	const [busy, setBusy] = useState(false);

	// "Add a unit" from a property's hub arrives with ?parent=<id>.
	useEffect(() => {
		if (!f.id && params.parent) updateInput({ kind: HostingKind.Child, parentId: params.parent, publishStatus: PublishStatus.Draft });
	}, [f.id, params.parent, updateInput]);

	const kind = (input.kind as HostingKind | undefined) ?? hosting?.kind ?? HostingKind.Standalone;
	const parentId = input.parentId ?? hosting?.parentId ?? null;
	const management = (input.managementType as ManagementType | undefined) ?? hosting?.managementType ?? ManagementType.KushiManaged;
	const structure = (input.unitStructure as UnitStructure | undefined) ?? hosting?.unitStructure ?? UnitStructure.Individual;
	const kindLocked = hosting?.kind === HostingKind.Parent && (hosting?.childCount ?? 0) > 0;

	const [{ data: mine }] = useHostListingsQuery({ variables: { filters: { creatorId: me }, pagination: { limit: 200, offset: 0 } }, pause: !me, requestPolicy: 'cache-and-network' });
	const listings = useMemo(() => mine?.hostings ?? [], [mine]);
	const parents = listings.filter((h) => h.kind !== HostingKind.Child && h.id !== f.id).map((h) => ({ value: h.id, label: h.title || 'Untitled listing', detail: place(h.city, h.state) || undefined }));
	const seededTitle = useMemo(() => {
		const n = listings.filter((h) => (h.title ?? '').startsWith('Untitled listing')).length;
		return n === 0 ? 'Untitled listing' : `Untitled listing (${n + 1})`;
	}, [listings]);

	const typeLabel = propertyTypes.find((p) => p.value === input.propertyType)?.label ?? input.propertyType;
	const errors = {
		type: !input.propertyType ? 'Choose the type of property.' : null,
		offer: !input.listingType ? 'Choose rent or sale.' : null,
		parent: kind === HostingKind.Child && !parentId ? 'Choose the property this unit belongs to.' : null
	};
	const valid = !errors.type && !errors.offer && !errors.parent;

	async function next() {
		setTried(true);
		if (!valid) return;
		setBusy(true);
		const isNew = !f.id;
		const id = await f.save({ title: input.title?.trim() || seededTitle, publishStatus: input.publishStatus ?? PublishStatus.Draft });
		setBusy(false);
		if (!id) return;
		// A new listing gets its hub underneath, so "back" from any later step lands there.
		if (isNew) router.replace(`/hostings/form/onboarding?id=${id}&next=photos` as Href);
		else f.advance(id);
	}

	return (
		<StepScreen
			stepKey="basics"
			hosting={hosting}
			onBack={f.leave}
			loading={!f.ready}
			intro="Start with the essentials. You can change any of this later."
			primary={{ title: f.id ? 'Save and continue' : 'Create draft and continue', onPress: next, loading: busy || f.mutating, testID: 'step-next' }}
			footnote={tried && !valid ? <KText v="xs" c="danger" center>Fill in the highlighted fields to continue.</KText> : null}
		>
			<Block title="Who manages it?" sub="This decides how renters deal with you.">
				<Choice title="Kushi managed" detail="Kushi verifies the property, handles the agreement and signing, and holds payment safely until move-in." on={management === ManagementType.KushiManaged} onPress={() => updateInput({ managementType: ManagementType.KushiManaged })} />
				<Choice title="Advert only" detail="People contact you and you close the deal off Kushi. No agreement or payment here, and your exact address stays hidden." on={management === ManagementType.AgentManaged} onPress={() => updateInput({ managementType: ManagementType.AgentManaged })} />
			</Block>

			<Block title="Rent or sale?">
				<View style={{ gap: 10 }}>
					<Choice title="For rent" detail="Let it to a tenant, or as a short-let." on={input.listingType === ListingType.Rent} onPress={() => updateInput({ listingType: ListingType.Rent })} />
					<Choice title="For sale" detail="Sell the property outright." on={input.listingType === ListingType.Sale} onPress={() => updateInput({ listingType: ListingType.Sale })} />
				</View>
				{tried && errors.offer ? (
					<KText v="xs" c="danger">
						{errors.offer}
					</KText>
				) : null}
			</Block>

			<Block title="What kind of property?">
				<SelectField label="Property type" value={typeLabel} placeholder="Flat, shop, land…" onPress={() => setTypeOpen(true)} error={tried ? errors.type : null} testID="field-property-type" />
			</Block>

			<Block title="Is it one place, or several units?">
				<View style={{ gap: 10, opacity: kindLocked ? 0.5 : 1 }} pointerEvents={kindLocked ? 'none' : 'auto'}>
					<Choice title="One property" detail="A single flat, house, shop or plot." on={kind === HostingKind.Standalone} onPress={() => updateInput({ kind: HostingKind.Standalone, parentId: null })} />
					<Choice title="A property with units" detail="A block of flats, an estate or a plaza. You’ll add each unit after." on={kind === HostingKind.Parent} onPress={() => updateInput({ kind: HostingKind.Parent, parentId: null })} />
					<Choice title="A unit in one of my properties" detail="It shares the property’s location, owner details and terms." on={kind === HostingKind.Child} onPress={() => updateInput({ kind: HostingKind.Child })} />
				</View>
				{kindLocked ? <KText v="xs">This property already has units, so this can’t change.</KText> : null}
				{kind === HostingKind.Child ? (
					<SelectField label="Belongs to" value={parents.find((p) => p.value === parentId)?.label ?? (parentId ? 'Selected property' : null)} placeholder="Choose the property" onPress={() => setParentOpen(true)} error={tried ? errors.parent : null} hint="Location, owner details, terms and payout are copied from it. You can still change them." />
				) : null}
				{kind === HostingKind.Parent ? (
					<View style={{ gap: 10 }}>
						<KText v="label">How are the units offered?</KText>
						<Choice title="One by one" detail="Renters pick a unit." on={structure === UnitStructure.Individual} onPress={() => updateInput({ unitStructure: UnitStructure.Individual })} />
						<Choice title="All together" detail="The whole property goes to one renter or buyer." on={structure === UnitStructure.Group} onPress={() => updateInput({ unitStructure: UnitStructure.Group })} />
					</View>
				) : null}
			</Block>

			{management === ManagementType.AgentManaged ? <Notice tone="info" title="Advert-only listings">These skip the ownership and agreement step, and Kushi doesn’t verify or take payment for them.</Notice> : null}

			<PickerSheet open={typeOpen} onClose={() => setTypeOpen(false)} title="Property type" searchable value={input.propertyType} options={propertyTypes.map((p) => ({ value: p.value, label: p.label, terms: p.searchTerms }))} onPick={(o) => updateInput({ propertyType: o.value })} />
			<PickerSheet open={parentOpen} onClose={() => setParentOpen(false)} title="Which property?" searchable value={parentId} options={parents} empty="You don’t have another listing to add this unit to yet." onPick={(o) => updateInput({ parentId: o.value })} />
		</StepScreen>
	);
}

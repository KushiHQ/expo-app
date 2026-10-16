import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ChevronDown, ListChecks, Sparkles } from 'lucide-react-native';
import { Button, Card, Check, Eyebrow, Field, KText, Notice, Pill, Sheet, Skeleton } from '@/components/k';
import { Pressable } from '@/components/k/pressable';
import { Block, StepScreen } from '@/components/k/listing-form';
import { MandateFields } from '@/components/k/listing-mandate';
// The signature pad is the one legacy widget kept (also used by the redesigned apply screen).
import SignaturePad from '@/components/molecules/m-signature-pad';
import { color, font, type as T } from '@/lib/k/theme';
import { agreementVars, fillTemplate } from '@/lib/k/agreement/vars';
import { subClauseConditionMet } from '@/lib/k/agreement/reservation';
import { useListingStep, cleanError } from '@/lib/k/use-listing-step';
import { mandateMissing, type Hosting } from '@/lib/k/listing-steps';
import { useTenancyTermsForm } from '@/lib/hooks/forms/use-tenancy-terms-form';
import { cleanupAgreementTemplateInput } from '@/lib/utils/hosting/tenancyAgreement';
import { showTenancySteps } from '@/lib/constants/hosting/step-rules';
import { toast } from '@/lib/hooks/use-toast';
import { VariableType, type HostingVerificationInput, type SubClause, type TenancySection } from '@/lib/services/graphql/generated';

const varLabel = (name: string) => name.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
const filled = (c: SubClause, name: string) => !!c.providedValues.find((p) => p.key === name)?.value?.trim();

/** Step 6 — the owner mandate, the tenancy terms and the host's signature (rent, Kushi-managed only). */
export default function Agreement() {
	const params = useLocalSearchParams<{ id?: string }>();
	const f = useListingStep(params.id, 'agreement');
	const t = useTenancyTermsForm(f.id ?? '');
	const { hosting, verificationInput: v, updateVerificationInput } = f;
	const [tried, setTried] = useState(false);
	const [busy, setBusy] = useState(false);
	const [open, setOpen] = useState<Record<string, boolean>>({});
	const [editing, setEditing] = useState(false);

	const sections = (t.input.tenancyAgreementTemplate?.sections ?? []) as TenancySection[];
	const signature = t.hostQueryData?.authHost.signature?.secureUrl ?? t.hostQueryData?.authHost.signature?.publicUrl;
	const vars = useMemo(() => agreementVars(hosting, null), [hosting]);
	const blanks = sections.flatMap((s) => s.subClauses.flatMap((c) => c.requiredVariables.filter((x) => !filled(c, x.name)).map((x) => `${s.title}: ${varLabel(x.name)}`)));

	const mandate = hosting ? mandateMissing({ ...hosting, verification: { ...(hosting.verification ?? {}), ...v } } as Hosting) : [];
	const errors = {
		mandate: mandate.length ? `Still needed: ${mandate.join(', ').toLowerCase()}.` : null,
		terms: !sections.length ? 'Tenancy terms are still loading.' : blanks.length ? `Fill in ${blanks.length} blank${blanks.length === 1 ? '' : 's'} in the terms.` : null,
		signature: !signature ? 'Add your signature.' : null
	};
	const valid = !errors.mandate && !errors.terms && !errors.signature;

	async function next() {
		setTried(true);
		if (!valid || !f.id) return;
		setBusy(true);
		const m = await f.verificationMutate({ input: { ...v, hostingId: f.id } as HostingVerificationInput });
		if (m.error) {
			setBusy(false);
			return toast.show({ type: 'error', text1: 'Couldn’t save the owner details', text2: cleanError(m.error.message) });
		}
		const id = await f.save({ tenancyAgreementTemplate: cleanupAgreementTemplateInput(t.input.tenancyAgreementTemplate!) });
		setBusy(false);
		if (id) f.advance(id);
	}

	if (hosting && !showTenancySteps(hosting.listingType, hosting.propertyType, hosting.managementType))
		return (
			<StepScreen stepKey="agreement" hosting={hosting} onBack={f.toHub} primary={{ title: 'Continue', onPress: () => f.advance() }}>
				<Notice tone="info" title="Nothing to do here">
					Sales, land and advert-only listings don’t use a Kushi tenancy agreement.
				</Notice>
			</StepScreen>
		);

	return (
		<StepScreen
			stepKey="agreement"
			hosting={hosting}
			onBack={f.leave}
			loading={!f.ready}
			intro="Kushi uses this to prepare the tenancy agreement both sides sign, so renters never have to chase paperwork."
			primary={{ title: 'Save and continue', onPress: next, loading: busy || t.mutating, testID: 'step-next' }}
			footnote={tried && !valid ? <KText v="xs" c="danger" center>{errors.mandate ?? errors.terms ?? errors.signature}</KText> : null}
		>
			<Block title="Your right to let it" sub="The owner’s details go into the agreement.">
				<MandateFields v={v} update={updateVerificationInput} tried={tried} />
			</Block>

			<Block
				title="Tenancy terms"
				sub={sections.length ? `${sections.length} sections${blanks.length ? ` · ${blanks.length} blank${blanks.length === 1 ? '' : 's'} to fill` : ' · all filled'}` : undefined}
				right={sections.length ? <Button title="Choose clauses" size="sm" variant="ghost" icon={<ListChecks size={14} color={color.fg} />} onPress={() => setEditing(true)} /> : undefined}
			>
				<Card tone="amber">
					<View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
						<Sparkles size={16} color={color.amber} />
						<KText v="smallStrong" style={{ flex: 1 }}>
							{t.pendingSuggestion ? 'Suggested terms — check them, then keep or discard' : 'Let Kushi suggest terms for this property'}
						</KText>
					</View>
					{t.pendingSuggestion ? (
						<View style={{ flexDirection: 'row', gap: 10 }}>
							<Button title="Keep these" size="sm" onPress={t.acceptSuggestion} loading={t.mutating} style={{ flex: 1 }} />
							<Button title="Discard" size="sm" variant="ghost" onPress={t.rejectSuggestion} disabled={t.mutating} style={{ flex: 1 }} />
						</View>
					) : (
						<Button title="Suggest terms" size="sm" variant="ghost" loading={t.suggesting} onPress={t.suggestTenancy} style={{ alignSelf: 'flex-start' }} />
					)}
				</Card>
				{t.tenancySummary.length ? (
					<View style={{ gap: 8 }}>
						<Eyebrow>In plain English</Eyebrow>
						{t.tenancySummary.map((p, i) => (
							<View key={i} style={{ flexDirection: 'row', gap: 8 }}>
								<KText v="small" c="amber">
									•
								</KText>
								<Filled text={p} vars={vars} />
							</View>
						))}
					</View>
				) : null}
				{!sections.length ? (
					<View style={{ gap: 8 }}>
						{[0, 1, 2].map((i) => (
							<Skeleton key={i} style={{ height: 52 }} />
						))}
					</View>
				) : (
					<View style={{ borderWidth: 1, borderColor: color.line, borderRadius: 6, overflow: 'hidden' }}>
						{sections.map((s, si) => {
							const visible = s.subClauses.map((c, ci) => ({ c, ci })).filter(({ c }) => (!hosting || subClauseConditionMet(c.id, hosting)));
							const todo = visible.reduce((n, { c }) => n + c.requiredVariables.filter((x) => !filled(c, x.name)).length, 0);
							const isOpen = !!open[s.id] || (tried && todo > 0);
							return (
								<View key={s.id} style={si ? { borderTopWidth: 1, borderTopColor: color.line } : null}>
									<Pressable accessibilityRole="button" accessibilityState={{ expanded: isOpen }} onPress={() => setOpen((o) => ({ ...o, [s.id]: !isOpen }))} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 }}>
										<KText style={{ fontFamily: font.mono, fontSize: 11, color: color.amber }}>{String(si + 1).padStart(2, '0')}</KText>
										<KText v="smallStrong" style={{ flex: 1 }}>
											{s.title}
										</KText>
										{todo ? <Pill tone="warn">{`${todo} to fill`}</Pill> : null}
										<ChevronDown size={17} color={color.muted} style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }} />
									</Pressable>
									{isOpen ? (
										<View style={{ gap: 14, paddingHorizontal: 14, paddingBottom: 16 }}>
											{s.preamble ? <Filled text={s.preamble} vars={vars} /> : null}
											{visible.map(({ c, ci }) => (
												<View key={c.id} style={{ gap: 6 }}>
													<KText v="smallStrong">{c.title}</KText>
													{c.content ? <Filled text={c.content} vars={c.providedValues.length ? agreementVars(hosting, null, c.providedValues) : vars} /> : null}
													{c.requiredVariables.map((x) => (
														<Field
															key={x.name}
															label={varLabel(x.name)}
															value={c.providedValues.find((p) => p.key === x.name)?.value ?? ''}
															keyboardType={x.type === VariableType.Number ? 'number-pad' : 'default'}
															onChangeText={(value) => t.handleUpdateVariable(si, ci, { key: x.name, value })}
															error={tried && !filled(c, x.name) ? 'Fill this in.' : null}
														/>
													))}
												</View>
											))}
										</View>
									) : null}
								</View>
							);
						})}
					</View>
				)}
			</Block>

			<Block title="Your signature" sub="It’s added to every agreement for this listing. You sign once.">
				<SignaturePad existingUrl={signature ?? undefined} onSave={t.handleHostSignatureSave} uploading={t.loading} />
				{tried && errors.signature ? (
					<KText v="xs" c="danger">
						{errors.signature}
					</KText>
				) : null}
			</Block>

			<Sheet open={editing} onClose={() => setEditing(false)} title="Choose clauses">
				<KText v="xs">Required clauses can’t be removed. Untick anything that doesn’t apply to this property.</KText>
				{t.allTemplateSections.map((s) => (
					<View key={s.id} style={{ gap: 10 }}>
						<KText v="smallStrong">{s.title}</KText>
						{(s.subClauses as SubClause[])
							.filter((c) => (!hosting || subClauseConditionMet(c.id, hosting)))
							.map((c) => (
								<Check key={c.id} on={t.hasSubClause(c)} onPress={() => !c.isMandatory && t.toggleSubClause(s.id, c)}>
									<KText v="small" style={c.isMandatory ? { color: color.muted } : undefined}>
										{c.title}
										{c.isMandatory ? ' · required' : ''}
									</KText>
								</Check>
							))}
					</View>
				))}
			</Sheet>
		</StepScreen>
	);
}

function Filled({ text, vars }: { text: string; vars: Record<string, string> }) {
	return (
		<Text style={[T.small, { lineHeight: 21, flex: 1 }]}>
			{fillTemplate(text, vars).map((p, i) =>
				p.kind === 'value' ? (
					<Text key={i} style={{ color: color.fg, fontFamily: font.bodySemi }}>
						{p.text}
					</Text>
				) : p.kind === 'blank' ? (
					<Text key={i} style={{ color: color.amber }}>
						[{p.text}]
					</Text>
				) : (
					<Text key={i}>{p.text}</Text>
				)
			)}
		</Text>
	);
}

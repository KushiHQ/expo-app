import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronDown, FileText } from 'lucide-react-native';
import { color, font, radius, type as T } from '@/lib/k/theme';
import { agreementVars, fillTemplate, type AgreementApplication, type AgreementHosting } from '@/lib/k/agreement/vars';
import { subClauseConditionMet } from '@/lib/k/agreement/reservation';
import type { TenancyTemplateInput } from '@/lib/services/graphql/generated';
import { KText, Eyebrow } from './text';
import { Skeleton } from './surface';

type Vars = Record<string, string>;

function Filled({ text, vars, style }: { text: string; vars: Vars; style?: object }) {
	return (
		<Text style={[T.small, { lineHeight: 21 }, style]}>
			{fillTemplate(text, vars).map((p, i) =>
				p.kind === 'value' ? (
					<Text key={i} style={{ color: color.fg, fontFamily: font.bodySemi }}>
						{p.text}
					</Text>
				) : p.kind === 'blank' ? (
					<Text key={i} style={{ color: color.dim, fontStyle: 'italic' }}>
						[{p.text}]
					</Text>
				) : (
					<Text key={i}>{p.text}</Text>
				)
			)}
		</Text>
	);
}

/** Readable tenancy agreement: plain-English summary, then sections as accordions. */
export function Agreement({ agreement, hosting, application, summary = [] }: { agreement?: TenancyTemplateInput | null; hosting: AgreementHosting; application: AgreementApplication; summary?: string[] }) {
	const base = useMemo(() => agreementVars(hosting, application), [hosting, application]);
	const withPV = (pv?: { key: string; value: string }[] | null) => (pv?.length ? agreementVars(hosting, application, pv) : base);
	const allPV = useMemo(() => (agreement?.sections ?? []).flatMap((s) => s.subClauses.flatMap((c) => c.providedValues ?? [])), [agreement]);
	const summaryVars = useMemo(() => (allPV.length ? agreementVars(hosting, application, allPV) : base), [allPV, base, hosting, application]);
	const sections = (agreement?.sections ?? []).map((s) => ({ ...s, subClauses: s.subClauses.filter((c) => subClauseConditionMet(c.id, hosting, application ?? null)) }));
	const [open, setOpen] = useState<Record<string, boolean>>({});

	return (
		<View style={{ gap: 16 }}>
			{summary.length ? (
				<View style={s.summary}>
					<Eyebrow>The key terms, in plain English</Eyebrow>
					{summary.map((p, i) => (
						<View key={i} style={{ flexDirection: 'row', gap: 8 }}>
							<KText v="small" c="amber">
								•
							</KText>
							<Filled text={p} vars={summaryVars} style={{ flex: 1 }} />
						</View>
					))}
				</View>
			) : null}
			<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
				<FileText size={14} color={color.muted} />
				<KText v="label">Tenancy agreement · {sections.length} sections</KText>
			</View>
			<View style={s.list}>
				{sections.length === 0
					? [0, 1, 2, 3].map((i) => <Skeleton key={i} style={{ height: 52, margin: 8 }} />)
					: sections.map((sec, si) => {
							const isOpen = !!open[sec.id];
							return (
								<View key={sec.id} style={si ? s.sep : null}>
									<Pressable onPress={() => setOpen((o) => ({ ...o, [sec.id]: !o[sec.id] }))} style={s.head} accessibilityRole="button" accessibilityState={{ expanded: isOpen }}>
										<KText style={{ fontFamily: font.mono, fontSize: 11, color: color.amber }}>{String(si + 1).padStart(2, '0')}</KText>
										<KText v="smallStrong" style={{ flex: 1 }}>
											{sec.title}
										</KText>
										<ChevronDown size={17} color={color.muted} style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }} />
									</Pressable>
									{isOpen ? (
										<View style={s.body}>
											{sec.preamble ? <Filled text={sec.preamble} vars={base} /> : null}
											{sec.subClauses.map((c) => (
												<View key={c.id} style={{ gap: 4 }}>
													<KText v="smallStrong">{c.title}</KText>
													{c.content ? <Filled text={c.content} vars={withPV(c.providedValues)} /> : null}
												</View>
											))}
										</View>
									) : null}
								</View>
							);
						})}
			</View>
		</View>
	);
}

const s = StyleSheet.create({
	summary: { gap: 10, padding: 16, borderRadius: radius.md, borderWidth: 1, borderColor: color.amberLine, backgroundColor: 'rgba(245,158,11,0.05)' },
	list: { borderRadius: radius.md, borderWidth: 1, borderColor: color.line, overflow: 'hidden' },
	sep: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: color.line2 },
	head: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
	body: { gap: 14, paddingHorizontal: 14, paddingBottom: 16 }
});

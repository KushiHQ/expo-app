/**
 * Building blocks for the listing set-up flow (app/hostings/form/*): the step
 * shell with progress, pickers, money input, photo tiles and hub rows.
 */
import { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { AlertTriangle, Check, ChevronDown, ChevronRight, RotateCcw, Search, Star } from 'lucide-react-native';
import { Pressable } from '@/components/k/pressable';
import { Button, Choice, Field, Header, KText, Screen, Sheet, Skeleton, Waypoint } from '@/components/k';
import { color, font, radius } from '@/lib/k/theme';
import { stepsFor, type Hosting, type StepKey, type StepState } from '@/lib/k/listing-steps';

// ── Step shell ─────────────────────────────────────────────────

type Primary = { title: string; onPress: () => void; loading?: boolean; disabled?: boolean; testID?: string };

/** A set-up step: header with "Step n of N", a progress strip, the form, and a pinned primary action. */
export function StepScreen({
	stepKey,
	hosting,
	onBack,
	intro,
	primary,
	footnote,
	loading,
	refreshing,
	onRefresh,
	children
}: {
	stepKey: StepKey;
	hosting?: Hosting | null;
	onBack: () => void;
	intro?: string;
	primary: Primary;
	footnote?: React.ReactNode;
	loading?: boolean;
	refreshing?: boolean;
	onRefresh?: () => void;
	children: React.ReactNode;
}) {
	const steps = stepsFor(hosting);
	const me = steps.find((s) => s.key === stepKey);
	return (
		<Screen
			keyboard
			width="form"
			refreshing={refreshing}
			onRefresh={onRefresh}
			header={
				<View>
					<Header eyebrow={me ? `Step ${me.index + 1} of ${me.total}` : 'Your listing'} title={me?.title ?? 'Your listing'} onBack={onBack} />
					<Progress steps={steps} current={stepKey} />
				</View>
			}
			footer={
				<View style={{ gap: 8 }}>
					{footnote}
					<Button title={primary.title} size="lg" block onPress={primary.onPress} loading={primary.loading} disabled={primary.disabled} testID={primary.testID} />
				</View>
			}
			contentStyle={{ paddingTop: 20 }}
		>
			{intro ? <KText v="small">{intro}</KText> : null}
			{loading ? (
				<View style={{ gap: 14 }}>
					<Skeleton style={{ height: 22, width: '60%' }} />
					<Skeleton style={{ height: 120 }} />
					<Skeleton style={{ height: 52 }} />
					<Skeleton style={{ height: 52 }} />
				</View>
			) : (
				children
			)}
		</Screen>
	);
}

/** Segmented progress strip: done steps amber, current outlined. */
export function Progress({ steps, current }: { steps: StepState[]; current?: StepKey }) {
	return (
		<View style={s.progress} accessibilityRole="progressbar" accessibilityLabel={`${steps.filter((x) => x.done).length} of ${steps.length} steps done`}>
			{steps.map((st) => (
				<View key={st.key} style={[s.seg, st.done && { backgroundColor: color.amber }, st.key === current && !st.done && { backgroundColor: color.amberLine }]} />
			))}
		</View>
	);
}

// ── Blocks ─────────────────────────────────────────────────────

/** A titled group inside a step. */
export function Block({ title, sub, children, right }: { title: string; sub?: string; children: React.ReactNode; right?: React.ReactNode }) {
	return (
		<View style={{ gap: 12 }}>
			<View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 12 }}>
				<View style={{ flex: 1, gap: 4 }}>
					<KText v="heading">{title}</KText>
					{sub ? <KText v="xs">{sub}</KText> : null}
				</View>
				{right}
			</View>
			{children}
		</View>
	);
}

// ── Pickers ────────────────────────────────────────────────────

export type Option = { value: string; label: string; detail?: string; terms?: string[] };

/** Looks like a field; opens a picker sheet. */
export function SelectField({ label, value, placeholder = 'Choose', onPress, error, hint, optional, testID, disabled }: { label: string; value?: string | null; placeholder?: string; onPress: () => void; error?: string | null; hint?: string; optional?: boolean; testID?: string; disabled?: boolean }) {
	return (
		<View style={{ gap: 8, opacity: disabled ? 0.5 : 1 }}>
			<KText v="label">
				{label}
				{optional ? <KText v="xs"> · optional</KText> : null}
			</KText>
			<Pressable accessibilityRole="button" accessibilityLabel={`${label}: ${value || placeholder}`} disabled={disabled} onPress={onPress} testID={testID} style={[s.select, !!error && { borderColor: color.danger }]}>
				<KText v="body" style={{ flex: 1, color: value ? color.fg : color.dim }} numberOfLines={1}>
					{value || placeholder}
				</KText>
				<ChevronDown size={18} color={color.muted} />
			</Pressable>
			{error ? (
				<KText v="xs" c="danger">
					{error}
				</KText>
			) : hint ? (
				<KText v="xs">{hint}</KText>
			) : null}
		</View>
	);
}

/** Bottom sheet list of choices, searchable when long. */
export function PickerSheet({ open, onClose, title, options, value, onPick, searchable, empty }: { open: boolean; onClose: () => void; title: string; options: Option[]; value?: string | null; onPick: (o: Option) => void; searchable?: boolean; empty?: string }) {
	const [q, setQ] = useState('');
	const list = useMemo(() => {
		const t = q.trim().toLowerCase();
		if (!t) return options;
		return options.filter((o) => [o.label, o.detail ?? '', ...(o.terms ?? [])].some((x) => x.toLowerCase().includes(t)));
	}, [options, q]);
	return (
		<Sheet
			open={open}
			onClose={() => {
				setQ('');
				onClose();
			}}
			title={title}
		>
			{searchable ? <Field placeholder="Search" value={q} onChangeText={setQ} autoCorrect={false} prefix={<Search size={16} color={color.muted} />} /> : null}
			{list.length === 0 ? <KText v="small">{empty ?? 'Nothing matches that.'}</KText> : null}
			{list.map((o) => (
				<Choice
					key={o.value}
					title={o.label}
					detail={o.detail}
					on={o.value === value}
					onPress={() => {
						setQ('');
						onPick(o);
						onClose();
					}}
				/>
			))}
		</Sheet>
	);
}

// ── Money ──────────────────────────────────────────────────────

const digits = (v: string) => v.replace(/[^\d]/g, '').replace(/^0+(?=\d)/, '');
const grouped = (v: string) => v.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/** Naira amount input: digits only, grouped as you type. `value` / `onChange` carry plain digits. */
export function MoneyField({ label, value, onChange, hint, error, optional, testID, placeholder = '0' }: { label: string; value?: string | number | null; onChange: (digits: string) => void; hint?: string; error?: string | null; optional?: boolean; testID?: string; placeholder?: string }) {
	const raw = value == null || value === '' ? '' : digits(String(value).split('.')[0]);
	return (
		<Field
			label={label}
			optional={optional}
			hint={hint}
			error={error}
			value={raw ? grouped(raw) : ''}
			onChangeText={(t) => onChange(digits(t))}
			keyboardType="number-pad"
			placeholder={placeholder}
			testID={testID}
			prefix={<KText style={{ fontFamily: font.bodySemi, fontSize: 16, color: color.fg2 }}>₦</KText>}
		/>
	);
}

/** Small number input for counts (bedrooms, occupants). */
export function CountField({ label, value, onChange, hint, optional }: { label: string; value?: number | null; onChange: (n: number | null) => void; hint?: string; optional?: boolean }) {
	return <Field label={label} optional={optional} hint={hint} keyboardType="number-pad" value={value ? String(value) : ''} onChangeText={(t) => onChange(t ? Number(digits(t)) || null : null)} placeholder="0" maxLength={4} />;
}

// ── Photos ─────────────────────────────────────────────────────

export type TileStatus = 'queued' | 'uploading' | 'error' | 'dead' | undefined;

/** One photo in a grid: shows upload state, cover badge, selection and a retry control. */
export function PhotoTile({ uri, size, status, cover, selected, onPress, onRetry, label }: { uri: string; size: number; status?: TileStatus; cover?: boolean; selected?: boolean; onPress?: () => void; onRetry?: () => void; label?: string }) {
	const failed = status === 'error' || status === 'dead';
	return (
		<Pressable accessibilityRole="imagebutton" accessibilityLabel={label ?? 'Photo'} onPress={onPress} style={[s.tile, { width: size, height: size }, selected && { borderColor: color.amber, borderWidth: 2 }]}>
			<Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" cachePolicy="memory-disk" recyclingKey={uri} transition={150} />
			{status === 'queued' || status === 'uploading' ? (
				<View style={[StyleSheet.absoluteFill, s.veil]}>
					<ActivityIndicator color={color.fg} />
					<KText v="micro" style={{ color: color.fg }}>
						{status === 'queued' ? 'Waiting' : 'Uploading'}
					</KText>
				</View>
			) : null}
			{failed ? (
				<Pressable accessibilityRole="button" accessibilityLabel="Retry upload" onPress={onRetry} style={[StyleSheet.absoluteFill, s.veil, { backgroundColor: 'rgba(240,82,79,0.45)' }]}>
					{status === 'dead' ? <AlertTriangle size={18} color="#fff" /> : <RotateCcw size={18} color="#fff" />}
					<KText v="micro" style={{ color: '#fff' }}>
						{status === 'dead' ? 'Lost' : 'Retry'}
					</KText>
				</Pressable>
			) : null}
			{cover ? (
				<View style={s.cover}>
					<Star size={10} color={color.onAmber} fill={color.onAmber} />
					<KText v="micro" style={{ color: color.onAmber }}>
						Cover
					</KText>
				</View>
			) : null}
			{selected ? (
				<View style={s.tick}>
					<Check size={13} color={color.onAmber} strokeWidth={3} />
				</View>
			) : null}
		</Pressable>
	);
}

// ── Hub ────────────────────────────────────────────────────────

/** A checklist row on the listing hub. */
export function StepRow({ step, onPress, locked, testID }: { step: StepState; onPress: () => void; locked?: boolean; testID?: string }) {
	return (
		<Pressable accessibilityRole="button" accessibilityLabel={`${step.title}. ${step.done ? 'Done' : step.left.join(', ')}`} onPress={onPress} disabled={locked} testID={testID} style={({ pressed }) => [s.stepRow, pressed && { opacity: 0.75 }, locked && { opacity: 0.45 }]}>
			<View style={{ width: 22, alignItems: 'center', paddingTop: 4 }}>
				<Waypoint done={step.done} active={!step.done} size={12} />
			</View>
			<View style={{ flex: 1, gap: 3 }}>
				<KText v="bodyStrong">{step.title}</KText>
				<KText v="xs" style={step.done ? undefined : { color: color.fg2 }} numberOfLines={2}>
					{step.done ? step.blurb : `To do: ${step.left.join(' · ')}`}
				</KText>
			</View>
			{step.done ? <Check size={17} color={color.success} /> : <ChevronRight size={18} color={color.dim} />}
		</Pressable>
	);
}


const s = StyleSheet.create({
	progress: { flexDirection: 'row', gap: 4, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: color.bg },
	seg: { flex: 1, height: 4, borderRadius: 2, backgroundColor: color.line2 },
	select: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 52, paddingHorizontal: 14, borderRadius: radius.md, borderWidth: 1, borderColor: color.line2, backgroundColor: color.bg2 },
	tile: { borderRadius: radius.md, overflow: 'hidden', backgroundColor: color.surface, borderWidth: 1, borderColor: color.line },
	veil: { alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: 'rgba(7,8,11,0.55)' },
	cover: { position: 'absolute', left: 6, bottom: 6, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6, paddingVertical: 3, borderRadius: radius.pill, backgroundColor: color.amber },
	tick: { position: 'absolute', right: 6, top: 6, width: 22, height: 22, borderRadius: 11, backgroundColor: color.amber, alignItems: 'center', justifyContent: 'center' },
	stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 14 }
});

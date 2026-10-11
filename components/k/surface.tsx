import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Pressable } from '@/components/k/pressable';
import { Image } from 'expo-image';
import { color, font, radius } from '@/lib/k/theme';
import { getAssetResizeUrl } from '@/lib/utils/urls';
import { KText } from './text';

/** Content card: bg-2 surface, hairline border, crisp radius. */
export function Card({ children, style, onPress, tone }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; tone?: 'amber' | 'signal' | 'danger' }) {
	const border = tone === 'amber' ? color.amberLine : tone === 'signal' ? 'rgba(76,143,240,0.4)' : tone === 'danger' ? 'rgba(240,82,79,0.4)' : color.line;
	const bg = tone === 'amber' ? 'rgba(245,158,11,0.06)' : tone === 'signal' ? 'rgba(76,143,240,0.07)' : color.bg2;
	const body = <View style={[s.card, { borderColor: border, backgroundColor: bg }, style]}>{children}</View>;
	if (!onPress) return body;
	return (
		<Pressable onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.85 }}>
			{body}
		</Pressable>
	);
}

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
	return <View style={[{ height: StyleSheet.hairlineWidth, backgroundColor: color.line2 }, style]} />;
}

type Tone = 'live' | 'info' | 'success' | 'danger' | 'neutral' | 'warn';
const TONE: Record<Tone, { fg: string; bd: string; bg: string }> = {
	live: { fg: color.amber, bd: color.amberLine, bg: color.amberSoft },
	warn: { fg: color.amber, bd: color.amberLine, bg: 'transparent' },
	info: { fg: color.signal, bd: 'rgba(76,143,240,0.45)', bg: color.signalSoft },
	success: { fg: color.success, bd: 'rgba(60,203,142,0.45)', bg: color.successSoft },
	danger: { fg: color.danger, bd: 'rgba(240,82,79,0.45)', bg: color.dangerSoft },
	neutral: { fg: color.muted, bd: color.line2, bg: 'transparent' }
};

/** Status pill (mono, uppercase). */
export function Pill({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: Tone }) {
	const t = TONE[tone];
	return (
		<View style={[s.pill, { borderColor: t.bd, backgroundColor: t.bg }]}>
			<View style={[s.dot, { backgroundColor: t.fg }]} />
			<KText v="micro" style={{ color: t.fg }}>
				{children}
			</KText>
		</View>
	);
}

/** Waypoint diamond — steps, timelines, bullets. */
export function Waypoint({ done, active, size = 11 }: { done?: boolean; active?: boolean; size?: number }) {
	return (
		<View
			style={{
				width: size,
				height: size,
				transform: [{ rotate: '45deg' }],
				borderWidth: 1,
				borderColor: done || active ? color.amber : color.line2,
				backgroundColor: done ? color.amber : color.bg
			}}
		/>
	);
}

/** Chip — filters and quick choices. */
export function Chip({ label, on, onPress, icon }: { label: string; on?: boolean; onPress?: () => void; icon?: React.ReactNode }) {
	return (
		<Pressable
			accessibilityRole="button"
			accessibilityState={{ selected: !!on }}
			onPress={onPress}
			style={({ pressed }) => [s.chip, on && s.chipOn, pressed && { opacity: 0.75 }]}
		>
			{icon}
			<KText v="small" style={{ color: on ? color.fg : color.fg2, fontFamily: on ? font.bodySemi : font.body }}>
				{label}
			</KText>
		</Pressable>
	);
}

/** Segmented control (2–4 options). */
export function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
	return (
		<View style={s.seg}>
			{options.map((o) => {
				const on = o.value === value;
				return (
					<Pressable key={o.value} accessibilityRole="tab" accessibilityState={{ selected: on }} onPress={() => onChange(o.value)} style={[s.segItem, on && s.segOn]}>
						<KText v="smallStrong" style={{ color: on ? color.bg : color.fg2 }}>
							{o.label}
						</KText>
					</Pressable>
				);
			})}
		</View>
	);
}

/** Avatar from a URL or initials. */
export function Avatar({ name, uri, size = 40 }: { name?: string | null; uri?: string | null; size?: number }) {
	const [failed, setFailed] = useState(false);
	const initials = (name ?? '?')
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((w) => w[0]?.toUpperCase())
		.join('');
	return (
		<View style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden', backgroundColor: color.surface2, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: color.line2 }}>
			{uri && !failed ? (
				<Image source={{ uri }} style={{ width: size, height: size }} contentFit="cover" onError={() => setFailed(true)} />
			) : (
				<KText style={{ fontFamily: font.display, fontSize: size * 0.36, color: color.fg2 }}>{initials}</KText>
			)}
		</View>
	);
}

/** Property photo through the server's resizing proxy, with the night-field fallback. */
export function Photo({ assetId, uri, w = 800, h = 600, style, radius: r = radius.md, priority }: { assetId?: string | null; uri?: string | null; w?: number; h?: number; style?: StyleProp<ViewStyle>; radius?: number; priority?: boolean }) {
	const src = uri ?? (assetId ? getAssetResizeUrl(assetId, w, h, 80) : null);
	return (
		<View style={[{ borderRadius: r, overflow: 'hidden', backgroundColor: color.surface }, style]}>
			{src ? (
				<Image
					source={{ uri: src }}
					style={StyleSheet.absoluteFill}
					contentFit="cover"
					transition={250}
					cachePolicy="memory-disk"
					priority={priority ? 'high' : 'normal'}
					placeholder={{ blurhash: 'L03S=]of00ay00j[%Mj[00ay~qj[' }}
				/>
			) : (
				<View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
					<KText v="micro" c="dim">
						No photo yet
					</KText>
				</View>
			)}
		</View>
	);
}

/** Loading shimmer block. */
export function Skeleton({ style }: { style?: StyleProp<ViewStyle> }) {
	return <View style={[{ backgroundColor: color.surface, borderRadius: radius.md }, style]} />;
}

export function Spinner({ size = 'small' }: { size?: 'small' | 'large' }) {
	return <ActivityIndicator color={color.amber} size={size} />;
}

const s = StyleSheet.create({
	card: { borderWidth: 1, borderRadius: radius.lg, padding: 18, gap: 12 },
	pill: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill, borderWidth: 1 },
	dot: { width: 5, height: 5, borderRadius: 3 },
	chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, height: 38, borderRadius: radius.pill, borderWidth: 1, borderColor: color.line2, backgroundColor: color.bg2 },
	chipOn: { borderColor: color.amber, backgroundColor: color.amberSoft },
	seg: { flexDirection: 'row', padding: 4, gap: 2, borderRadius: radius.pill, borderWidth: 1, borderColor: color.line2, backgroundColor: color.bg2, alignSelf: 'flex-start' },
	segItem: { paddingHorizontal: 16, height: 36, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
	segOn: { backgroundColor: color.fg }
});

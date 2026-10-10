import { Pressable, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { ChevronRight } from 'lucide-react-native';
import { color, radius } from '@/lib/k/theme';
import { Button } from './button';
import { KText, Eyebrow } from './text';

/** Empty / uncharted state with the radar motif. */
export function Empty({ eyebrow = 'Uncharted', title, body, action, onAction }: { eyebrow?: string; title: string; body?: string; action?: string; onAction?: () => void }) {
	return (
		<View style={{ alignItems: 'center', gap: 12, paddingVertical: 40, paddingHorizontal: 12 }}>
			<Svg width={96} height={96} viewBox="-60 -60 120 120">
				<Circle r={56} stroke={color.line2} strokeWidth={0.8} fill="none" />
				<Circle r={38} stroke={color.line2} strokeWidth={0.8} fill="none" />
				<Circle r={20} stroke={color.line2} strokeWidth={0.8} fill="none" />
				<Path d="M-56 0H56M0-56V56" stroke={color.line2} strokeWidth={0.8} />
				<Path d="M0 0 L0 -56 A56 56 0 0 1 36 -43 Z" fill="rgba(245,158,11,0.16)" />
				<Path d="M-5 0 L0 -5 L5 0 L0 5 Z" fill={color.amber} />
			</Svg>
			<Eyebrow>{eyebrow}</Eyebrow>
			<KText v="title" center>
				{title}
			</KText>
			{body ? (
				<KText v="small" center style={{ maxWidth: 320 }}>
					{body}
				</KText>
			) : null}
			{action && onAction ? <Button title={action} onPress={onAction} style={{ marginTop: 8 }} /> : null}
		</View>
	);
}

/** Inline notice (info / warning / error). */
export function Notice({ tone = 'info', title, children, action, onAction }: { tone?: 'info' | 'warn' | 'danger' | 'success'; title?: string; children?: React.ReactNode; action?: string; onAction?: () => void }) {
	const map = {
		info: { bd: 'rgba(76,143,240,0.4)', bg: 'rgba(76,143,240,0.08)', fg: color.signal },
		warn: { bd: color.amberLine, bg: 'rgba(245,158,11,0.07)', fg: color.amber },
		danger: { bd: 'rgba(240,82,79,0.4)', bg: 'rgba(240,82,79,0.08)', fg: color.danger },
		success: { bd: 'rgba(60,203,142,0.4)', bg: 'rgba(60,203,142,0.08)', fg: color.success }
	}[tone];
	return (
		<View style={{ borderWidth: 1, borderColor: map.bd, backgroundColor: map.bg, borderRadius: radius.md, padding: 14, gap: 6 }}>
			{title ? <KText v="smallStrong" style={{ color: map.fg }}>{title}</KText> : null}
			{typeof children === 'string' ? <KText v="small">{children}</KText> : children}
			{action && onAction ? (
				<Pressable onPress={onAction} style={{ marginTop: 4 }}>
					<KText v="smallStrong" style={{ color: map.fg, textDecorationLine: 'underline' }}>
						{action}
					</KText>
				</Pressable>
			) : null}
		</View>
	);
}

/** Tappable list row with icon, title, detail and chevron. */
export function Row({ icon, title, detail, right, onPress, danger }: { icon?: React.ReactNode; title: string; detail?: string; right?: React.ReactNode; onPress?: () => void; danger?: boolean }) {
	return (
		<Pressable accessibilityRole={onPress ? 'button' : undefined} onPress={onPress} style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 }, pressed && onPress && { opacity: 0.7 }]}>
			{icon ? <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: color.surface, alignItems: 'center', justifyContent: 'center' }}>{icon}</View> : null}
			<View style={{ flex: 1, gap: 2 }}>
				<KText v="bodyStrong" c={danger ? 'danger' : undefined}>
					{title}
				</KText>
				{detail ? <KText v="xs">{detail}</KText> : null}
			</View>
			{right ?? (onPress ? <ChevronRight size={18} color={color.dim} /> : null)}
		</Pressable>
	);
}

/** key — value line (fees, details). */
export function KV({ k, v, strong }: { k: string; v: React.ReactNode; strong?: boolean }) {
	return (
		<View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 16, paddingVertical: 8 }}>
			<KText v="small" style={{ flexShrink: 1 }}>
				{k}
			</KText>
			{typeof v === 'string' || typeof v === 'number' ? (
				<KText v={strong ? 'bodyStrong' : 'smallStrong'} style={{ textAlign: 'right', flexShrink: 1 }}>
					{v}
				</KText>
			) : (
				v
			)}
		</View>
	);
}

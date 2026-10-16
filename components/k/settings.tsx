/**
 * Settings building blocks for the You area: grouped lists, toggles, external
 * links and the money-state banner used on receipts.
 */
import { Children, Fragment, isValidElement } from 'react';
import { Linking, StyleSheet, Switch, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { ExternalLink } from 'lucide-react-native';
import { color, radius } from '@/lib/k/theme';
import type { MoneyState } from '@/lib/k/account';
import { Eyebrow, KText } from './text';
import { Divider, Pill } from './surface';
import { Row } from './feedback';

/** A titled group of rows on one card, with hairlines between them. */
export function Group({ title, note, children }: { title?: string; note?: string; children: React.ReactNode }) {
	const rows = Children.toArray(children).filter(isValidElement);
	return (
		<View style={{ gap: 10 }}>
			{title ? <Eyebrow>{title}</Eyebrow> : null}
			<View style={s.card}>
				{rows.map((r, i) => (
					<Fragment key={i}>
						{i ? <Divider /> : null}
						{r}
					</Fragment>
				))}
			</View>
			{note ? <KText v="xs" style={{ paddingHorizontal: 4 }}>{note}</KText> : null}
		</View>
	);
}

/** On/off setting. The whole row is the switch for screen readers. */
export function ToggleRow({ title, detail, value, onChange, disabled, testID }: { title: string; detail?: string; value: boolean; onChange: (v: boolean) => void; disabled?: boolean; testID?: string }) {
	return (
		<View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, opacity: disabled ? 0.5 : 1 }}>
			<View style={{ flex: 1, gap: 2 }}>
				<KText v="bodyStrong">{title}</KText>
				{detail ? <KText v="xs">{detail}</KText> : null}
			</View>
			<Switch
				testID={testID}
				accessibilityLabel={title}
				accessibilityHint={detail}
				value={value}
				disabled={disabled}
				onValueChange={onChange}
				trackColor={{ false: color.surface2, true: color.amber }}
				thumbColor={value ? color.onAmber : color.fg2}
				ios_backgroundColor={color.surface2}
			/>
		</View>
	);
}

/** Opens a web page in the in-app browser (falls back to the system browser). */
export async function openLink(url: string) {
	try {
		if (url.startsWith('mailto:')) return await Linking.openURL(url);
		await WebBrowser.openBrowserAsync(url, { controlsColor: color.amber, toolbarColor: color.bg });
	} catch {
		Linking.openURL(url).catch(() => {});
	}
}

/** Row that leaves the app (web page or email). */
export function LinkRow({ icon, title, detail, url, testID }: { icon?: React.ReactNode; title: string; detail?: string; url: string; testID?: string }) {
	return <Row icon={icon} title={title} detail={detail} onPress={() => openLink(url)} right={<ExternalLink size={16} color={color.dim} />} testID={testID} />;
}

/** "Where is the money" banner for receipts. */
export function MoneyBanner({ state }: { state: MoneyState }) {
	const tint = state.tone === 'danger' ? color.danger : state.tone === 'success' ? color.success : state.tone === 'live' ? color.amber : state.tone === 'info' ? color.signal : color.muted;
	return (
		<View style={[s.banner, { borderColor: tint }]} accessibilityRole="summary">
			<Pill tone={state.tone}>{state.label}</Pill>
			<KText v="small" c="fg">
				{state.body}
			</KText>
		</View>
	);
}

/** Small status line under a heading: label + coloured value. */
export function StatusLine({ label, value, tone = 'neutral' }: { label: string; value: string; tone?: 'neutral' | 'success' | 'live' | 'danger' | 'info' }) {
	return (
		<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
			<KText v="small">{label}</KText>
			<Pill tone={tone}>{value}</Pill>
		</View>
	);
}

const s = StyleSheet.create({
	card: { borderRadius: radius.lg, borderWidth: 1, borderColor: color.line, backgroundColor: color.bg2, paddingHorizontal: 16 },
	banner: { gap: 10, padding: 16, borderRadius: radius.lg, borderWidth: 1, borderLeftWidth: 3, backgroundColor: color.bg2 }
});

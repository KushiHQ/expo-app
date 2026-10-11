import { KeyboardAvoidingView, Platform, RefreshControl, ScrollView, StyleSheet, View, type ScrollViewProps, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { color, gutter } from '@/lib/k/theme';
import { IconButton } from './button';
import { KText, Eyebrow } from './text';

type ScreenProps = {
	children: React.ReactNode;
	/** Wrap content in a ScrollView (default true). */
	scroll?: boolean;
	header?: React.ReactNode;
	/** Fixed bar pinned to the bottom (primary action). */
	footer?: React.ReactNode;
	padded?: boolean;
	refreshing?: boolean;
	onRefresh?: () => void;
	contentStyle?: StyleProp<ViewStyle>;
	scrollProps?: ScrollViewProps;
	/** Screen sits inside a tab navigator (no bottom safe-area padding needed). */
	tabbed?: boolean;
	keyboard?: boolean;
};

/** Night canvas with safe areas, optional header, scroll and pinned footer. */
export function Screen({ children, scroll = true, header, footer, padded = true, refreshing, onRefresh, contentStyle, scrollProps, tabbed, keyboard }: ScreenProps) {
	const insets = useSafeAreaInsets();
	const pad = padded ? { paddingHorizontal: gutter } : null;
	const bottom = footer ? 24 : tabbed ? 28 : insets.bottom + 28;
	const body = scroll ? (
		<ScrollView
			style={{ flex: 1 }}
			contentContainerStyle={[pad, { paddingBottom: bottom, gap: 20 }, contentStyle]}
			keyboardShouldPersistTaps="handled"
			showsVerticalScrollIndicator={false}
			refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={color.amber} colors={[color.amber]} progressBackgroundColor={color.surface} /> : undefined}
			{...scrollProps}
		>
			{children}
		</ScrollView>
	) : (
		<View style={[{ flex: 1 }, pad, contentStyle]}>{children}</View>
	);
	const inner = (
		<>
			{header}
			{body}
			{footer ? <View style={[s.footer, { paddingBottom: tabbed ? 12 : Math.max(insets.bottom, 12) }]}>{footer}</View> : null}
		</>
	);
	return (
		<View style={[s.screen, { paddingTop: header ? 0 : insets.top }]}>
			{keyboard ? (
				<KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
					{inner}
				</KeyboardAvoidingView>
			) : (
				inner
			)}
		</View>
	);
}

/** Top bar: back, title (or eyebrow + title), right-side actions. */
export function Header({ title, eyebrow, back = true, right, onBack, transparent }: { title?: string; eyebrow?: string; back?: boolean; right?: React.ReactNode; onBack?: () => void; transparent?: boolean }) {
	const insets = useSafeAreaInsets();
	return (
		<View style={[s.header, { paddingTop: insets.top + 8 }, transparent && { backgroundColor: 'transparent', borderBottomWidth: 0 }]}>
			{back ? (
				<IconButton label="Back" onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/')))}>
					<ArrowLeft size={19} color={color.fg} />
				</IconButton>
			) : null}
			<View style={{ flex: 1, minWidth: 0, gap: 2 }}>
				{eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
				{title ? (
					<KText v="heading" numberOfLines={1}>
						{title}
					</KText>
				) : null}
			</View>
			{right ? <View style={{ flexDirection: 'row', gap: 8 }}>{right}</View> : null}
		</View>
	);
}

/** Large page title block used at the top of tab screens. */
export function PageTitle({ eyebrow, title, sub, right }: { eyebrow?: string; title: string; sub?: string; right?: React.ReactNode }) {
	return (
		<View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 12, paddingTop: 12 }}>
			<View style={{ flex: 1, gap: 8 }}>
				{eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
				<KText v="display">{title}</KText>
				{sub ? <KText v="small">{sub}</KText> : null}
			</View>
			{right}
		</View>
	);
}

/** Section with a heading row. */
export function Section({ title, action, children, style }: { title?: string; action?: React.ReactNode; children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
	return (
		<View style={[{ gap: 12 }, style]}>
			{title || action ? (
				<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
					{title ? <KText v="heading">{title}</KText> : <View />}
					{action}
				</View>
			) : null}
			{children}
		</View>
	);
}

const s = StyleSheet.create({
	screen: { flex: 1, backgroundColor: color.bg },
	header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: gutter, paddingBottom: 12, backgroundColor: color.bg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: color.line },
	footer: { paddingHorizontal: gutter, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: color.line, backgroundColor: color.bg }
});

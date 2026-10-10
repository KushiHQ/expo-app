import { Pressable, StyleSheet, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { color, font } from '@/lib/k/theme';
import { EventEmitter } from '@/lib/utils/event-emitter';
import { KText } from './text';

/** Kushi tab bar: night glass, amber marker on the current tab. */
export function KTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
	const insets = useSafeAreaInsets();
	return (
		<View style={[s.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
			{state.routes.map((route, index) => {
				const { options } = descriptors[route.key];
				if ((options as { href?: unknown }).href === null) return null;
				const focused = state.index === index;
				const tint = focused ? color.fg : color.muted;
				const badge = options.tabBarBadge;
				return (
					<Pressable
						key={route.key}
						accessibilityRole="tab"
						accessibilityState={{ selected: focused }}
						accessibilityLabel={options.tabBarAccessibilityLabel ?? String(options.title ?? route.name)}
						testID={`tab-${route.name}`}
						onPress={() => {
							const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
							if (focused) EventEmitter.emit(`scrollToTop:${route.name}`);
							if (!focused && !event.defaultPrevented) {
								Haptics.selectionAsync().catch(() => {});
								navigation.navigate(route.name, route.params);
							}
						}}
						style={s.item}
					>
						<View style={[s.marker, focused && s.markerOn]} />
						<View>
							{options.tabBarIcon?.({ focused, color: tint, size: 22 })}
							{badge != null ? (
								<View style={s.badge}>
									<KText style={s.badgeText}>{String(badge)}</KText>
								</View>
							) : null}
						</View>
						<KText style={[s.label, { color: tint, fontFamily: focused ? font.bodySemi : font.body }]}>{String(options.title ?? route.name)}</KText>
					</Pressable>
				);
			})}
		</View>
	);
}

const s = StyleSheet.create({
	bar: { flexDirection: 'row', backgroundColor: 'rgba(7,8,11,0.97)', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: color.line2, paddingTop: 6 },
	item: { flex: 1, alignItems: 'center', gap: 3, paddingTop: 4, minHeight: 50 },
	marker: { width: 18, height: 2, borderRadius: 1, backgroundColor: 'transparent', marginBottom: 3 },
	markerOn: { backgroundColor: color.amber },
	label: { fontSize: 11, lineHeight: 14 },
	badge: { position: 'absolute', top: -4, right: -10, minWidth: 17, height: 17, borderRadius: 9, paddingHorizontal: 4, backgroundColor: color.amber, alignItems: 'center', justifyContent: 'center' },
	badgeText: { fontSize: 10, lineHeight: 12, color: color.onAmber, fontFamily: font.bodyBold }
});

import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { X } from 'lucide-react-native';
import { color, gutter } from '@/lib/k/theme';
import { centered, useLayout } from '@/lib/k/layout';
import { Contours } from './contours';
import { IconButton } from './button';
import { Logo } from './brand';
import { KText, Eyebrow } from './text';

/** Shared frame for sign in / sign up / reset: contour field, logo, close. */
export function AuthShell({ eyebrow, title, sub, children }: { eyebrow: string; title: string; sub?: string; children: React.ReactNode }) {
	const insets = useSafeAreaInsets();
	const layout = useLayout();
	return (
		<View style={{ flex: 1, backgroundColor: color.bg }}>
			<Contours seed={11} opacity={0.35} />
			<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: layout.compact ? gutter : layout.gutter, paddingTop: insets.top + 8 }}>
				<Logo height={18} />
				<IconButton label="Close" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}>
					<X size={18} color={color.fg} />
				</IconButton>
			</View>
			<KeyboardAwareScrollView bottomOffset={24} keyboardShouldPersistTaps="handled" contentContainerStyle={[{ paddingHorizontal: gutter, paddingTop: 36, paddingBottom: insets.bottom + 32, gap: 22 }, centered(layout.max('form')), !layout.compact && { flexGrow: 1, justifyContent: 'center', paddingBottom: insets.bottom + 72 }]}>
				<View style={{ gap: 10 }}>
					<Eyebrow>{eyebrow}</Eyebrow>
					<KText v="display">{title}</KText>
					{sub ? <KText v="lead">{sub}</KText> : null}
				</View>
				{children}
			</KeyboardAwareScrollView>
		</View>
	);
}

export { ScrollView };

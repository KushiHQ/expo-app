import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { color, gutter, radius, shadow } from '@/lib/k/theme';
import { useDialogStore, type DialogButton } from '@/lib/k/dialog';
import { Button } from './button';
import { KText } from './text';

const ORIENTATIONS = ['portrait', 'portrait-upside-down', 'landscape', 'landscape-left', 'landscape-right'] as const;

/**
 * Shows the dialog at the front of the queue (lib/k/dialog.ts). A real Modal,
 * so it appears above native modal screens such as the camera.
 */
export function DialogHost() {
	const dialog = useDialogStore((s) => s.queue[0]);
	const close = useDialogStore((s) => s.close);
	if (!dialog) return null;

	const cancel = dialog.buttons.find((b) => b.style === 'cancel');
	const dismiss = () => {
		if (dialog.cancelable) close(dialog.id, cancel ?? (dialog.buttons.length === 1 ? dialog.buttons[0] : undefined));
	};
	// Two buttons sit side by side (cancel left); three or more stack, primary first.
	const row = dialog.buttons.length === 2;
	const ordered = row ? [...dialog.buttons].sort((a, b) => Number(b.style === 'cancel') - Number(a.style === 'cancel')) : [...dialog.buttons].sort((a, b) => Number(a.style === 'cancel') - Number(b.style === 'cancel'));

	return (
		<Modal visible transparent animationType="none" statusBarTranslucent onRequestClose={dismiss} supportedOrientations={[...ORIENTATIONS]}>
			<Animated.View entering={FadeIn.duration(160)} style={s.scrim}>
				<Pressable style={StyleSheet.absoluteFill} onPress={dismiss} accessibilityLabel="Close" />
				<Animated.View entering={ZoomIn.duration(180).springify().damping(18)} style={[s.card, shadow]} accessibilityRole="alert">
					<View style={{ gap: 8 }}>
						<KText v="heading">{dialog.title}</KText>
						{dialog.message ? <KText v="small">{dialog.message}</KText> : null}
					</View>
					<View style={row ? s.row : s.stack}>
						{ordered.map((b, i) => (
							<Button key={`${b.text}-${i}`} title={b.text} size="sm" variant={variantFor(b, dialog.buttons)} block={!row} style={row ? { flex: 1 } : undefined} onPress={() => close(dialog.id, b)} />
						))}
					</View>
				</Animated.View>
			</Animated.View>
		</Modal>
	);
}

/** Destructive → danger, cancel → ghost, the one main choice → amber, others → ghost. */
function variantFor(b: DialogButton, all: DialogButton[]) {
	if (b.style === 'destructive') return 'danger' as const;
	if (b.style === 'cancel') return 'ghost' as const;
	const main = all.filter((x) => x.style !== 'cancel' && x.style !== 'destructive');
	return main.length && main[main.length - 1] === b ? ('amber' as const) : ('ghost' as const);
}

const s = StyleSheet.create({
	scrim: { flex: 1, backgroundColor: color.scrim, alignItems: 'center', justifyContent: 'center', paddingHorizontal: gutter },
	card: { width: '100%', maxWidth: 380, backgroundColor: color.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: color.line2, padding: 20, gap: 20 },
	row: { flexDirection: 'row', gap: 10 },
	stack: { gap: 10 }
});

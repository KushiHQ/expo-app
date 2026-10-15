import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { color, gutter, radius } from '@/lib/k/theme';
import { useLayout } from '@/lib/k/layout';
import { IconButton, Button } from './button';
import { KText, Eyebrow } from './text';
import { OtpField } from './form';

const ORIENTATIONS = ['portrait', 'portrait-upside-down', 'landscape', 'landscape-left', 'landscape-right'] as const;

/**
 * Bottom sheet (Modal-based so it works everywhere, including web previews).
 * On tablet-sized windows it is presented as a centered panel instead.
 */
export function Sheet({ open, onClose, title, eyebrow, children, footer, scroll = true, dismissible = true }: { open: boolean; onClose: () => void; title?: string; eyebrow?: string; children: React.ReactNode; footer?: React.ReactNode; scroll?: boolean; dismissible?: boolean }) {
	const insets = useSafeAreaInsets();
	const { compact, isTablet } = useLayout();
	return (
		<Modal
			visible={open}
			transparent
			animationType={compact ? 'slide' : 'fade'}
			onRequestClose={() => dismissible && onClose()}
			statusBarTranslucent
			supportedOrientations={isTablet ? [...ORIENTATIONS] : undefined}
		>
			<Pressable style={s.scrim} onPress={() => dismissible && onClose()} accessibilityLabel="Close" />
			<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={compact ? s.wrap : [s.wrapPanel, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]} pointerEvents="box-none">
				<View style={compact ? [s.sheet, { paddingBottom: Math.max(insets.bottom, 16) }] : s.panel}>
					{compact ? <View style={s.grab} /> : null}
					{title || eyebrow ? (
						<View style={s.head}>
							<View style={{ flex: 1, gap: 4 }}>
								{eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
								{title ? <KText v="title">{title}</KText> : null}
							</View>
							{dismissible ? (
								<IconButton label="Close" onPress={onClose} size={36}>
									<X size={17} color={color.fg} />
								</IconButton>
							) : null}
						</View>
					) : null}
					{scroll ? (
						<ScrollView style={{ flexGrow: 0 }} contentContainerStyle={{ paddingHorizontal: gutter, gap: 16, paddingBottom: 8 }} keyboardShouldPersistTaps="handled">
							{children}
						</ScrollView>
					) : (
						<View style={{ paddingHorizontal: gutter, gap: 16 }}>{children}</View>
					)}
					{footer ? <View style={{ paddingHorizontal: gutter, paddingTop: 12 }}>{footer}</View> : null}
				</View>
			</KeyboardAvoidingView>
		</Modal>
	);
}

/**
 * Confirm a sensitive action with the 6-digit code Kushi emails.
 * `onSubmit` returns an error message, or null on success (sheet closes).
 */
export function OtpSheet({ open, onClose, title, body, action = 'Confirm', danger, onSubmit, onResend }: { open: boolean; onClose: () => void; title: string; body: string; action?: string; danger?: boolean; onSubmit: (code: string) => Promise<string | null>; onResend?: () => Promise<void> }) {
	const [code, setCode] = useState('');
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);
	useEffect(() => {
		if (open) {
			setCode('');
			setError(null);
		}
	}, [open]);
	async function go(c = code) {
		if (c.length !== 6 || busy) return;
		setBusy(true);
		const err = await onSubmit(c);
		setBusy(false);
		if (err) {
			setError(err);
			setCode('');
		} else onClose();
	}
	return (
		<Sheet open={open} onClose={onClose} title={title} eyebrow="Confirm with code">
			<KText v="small">{body}</KText>
			<OtpField value={code} onChange={setCode} onComplete={go} invalid={!!error} />
			{error ? (
				<KText v="small" c="danger" center>
					{error}
				</KText>
			) : null}
			<Button title={action} variant={danger ? 'danger' : 'amber'} size="lg" block loading={busy} disabled={code.length !== 6} onPress={() => go()} />
			{onResend ? <Button title="Send a new code" variant="quiet" size="sm" onPress={() => onResend()} /> : null}
		</Sheet>
	);
}

const s = StyleSheet.create({
	scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: color.scrim },
	wrap: { flex: 1, justifyContent: 'flex-end' },
	wrapPanel: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
	panel: { width: '100%', maxWidth: 600, maxHeight: '100%', backgroundColor: color.bg2, borderRadius: radius.xl, borderWidth: 1, borderColor: color.line2, gap: 12, paddingTop: 18, paddingBottom: 20 },
	sheet: { maxHeight: '92%', backgroundColor: color.bg2, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, borderWidth: 1, borderColor: color.line2, borderBottomWidth: 0, gap: 12 },
	grab: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: color.line2, marginTop: 10 },
	head: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: gutter, paddingTop: 4 }
});

import { ActivityIndicator, Platform, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { color, font, radius } from '@/lib/k/theme';
import { useSocialAuth } from '@/lib/k/social-auth';
import { KText } from './text';
import { Notice } from './feedback';

export function SocialButtons({ mode }: { mode: 'login' | 'signup' }) {
	const { google, apple, busy, error } = useSocialAuth(mode);
	return (
		<View style={{ gap: 10 }}>
			<View style={{ flexDirection: 'row', gap: 10 }}>
				<Pressable style={({ pressed }) => [s.btn, pressed && { opacity: 0.8 }]} onPress={google} disabled={!!busy} accessibilityLabel="Continue with Google">
					{busy === 'google' ? (
						<ActivityIndicator color={color.fg} />
					) : (
						<Svg width={18} height={18} viewBox="0 0 24 24">
							<Path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
							<Path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
							<Path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z" />
							<Path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
						</Svg>
					)}
					<KText style={s.label}>Google</KText>
				</Pressable>
				<Pressable style={({ pressed }) => [s.btn, pressed && { opacity: 0.8 }]} onPress={apple} disabled={!!busy || Platform.OS === 'web'} accessibilityLabel="Continue with Apple">
					{busy === 'apple' ? (
						<ActivityIndicator color={color.fg} />
					) : (
						<Svg width={18} height={18} viewBox="0 0 24 24">
							<Path fill={color.fg} d="M16.37 12.6c-.02-2.27 1.86-3.37 1.94-3.42-1.06-1.55-2.7-1.76-3.28-1.78-1.4-.14-2.73.82-3.44.82-.71 0-1.8-.8-2.96-.78-1.52.02-2.93.89-3.71 2.25-1.59 2.75-.41 6.81 1.13 9.04.76 1.09 1.66 2.31 2.84 2.27 1.14-.05 1.57-.73 2.95-.73 1.37 0 1.76.73 2.96.71 1.23-.02 2-1.11 2.74-2.21.87-1.26 1.22-2.49 1.24-2.55-.03-.01-2.38-.91-2.41-3.62zM14.1 5.94c.63-.76 1.05-1.82.93-2.88-.9.04-2 .6-2.65 1.36-.58.67-1.09 1.75-.95 2.78 1 .08 2.03-.51 2.67-1.26z" />
						</Svg>
					)}
					<KText style={s.label}>Apple</KText>
				</Pressable>
			</View>
			{error ? <Notice tone="danger">{error}</Notice> : null}
		</View>
	);
}

/** "or with email" divider. */
export function OrDivider({ label = 'or with email' }: { label?: string }) {
	return (
		<View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
			<View style={{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: color.line2 }} />
			<KText v="micro">{label}</KText>
			<View style={{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: color.line2 }} />
		</View>
	);
}

const s = StyleSheet.create({
	btn: { flex: 1, height: 50, borderRadius: radius.pill, borderWidth: 1, borderColor: color.line2, backgroundColor: color.bg2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
	label: { fontFamily: font.bodySemi, fontSize: 15, color: color.fg }
});

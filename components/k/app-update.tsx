/**
 * App update UI, mounted once in the root layout:
 *  - hard gate: full-screen, non-dismissible "Update Kushi to continue"
 *    (rendered in a Modal so it sits above every screen, native modals
 *    included, and swallows the Android back button);
 *  - soft prompt: a dismissible sheet when a newer version is out.
 * Decision logic lives in lib/k/app-version.ts (unit-tested).
 */
import { useState } from 'react';
import { Linking, Modal, ScrollView, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { color, gutter, radius } from '@/lib/k/theme';
import { useAppUpdate, useAppVersionStore } from '@/lib/k/app-version-store';
import { openAppStore } from '@/lib/utils/urls';
import { Button } from './button';
import { Mark } from './brand';
import { Sheet } from './sheet';
import { Eyebrow, KText } from './text';
import { Contours } from './contours';

const FORCE_COPY = 'This version of Kushi is no longer supported. Update to the latest version to keep finding, booking and managing homes.';
const SOFT_COPY = 'Update for the latest fixes and improvements. It only takes a moment.';

async function openStore(storeUrl: string | null) {
	if (storeUrl && /^(https?|itms-apps|market):/i.test(storeUrl)) {
		try {
			await Linking.openURL(storeUrl);
			return;
		} catch {
			// fall through to the platform store
		}
	}
	await openAppStore();
}

export function AppUpdate() {
	const decision = useAppUpdate();
	if (decision.kind === 'force') return <UpdateGate current={decision.current} required={decision.required} storeUrl={decision.storeUrl} message={decision.message} />;
	if (decision.kind === 'soft') return <UpdatePrompt latest={decision.latest} storeUrl={decision.storeUrl} message={decision.message} />;
	return null;
}

function UpdateGate({ current, required, storeUrl, message }: { current: string | null; required: string | null; storeUrl: string | null; message: string | null }) {
	const checking = useAppVersionStore((s) => s.checking);
	const refresh = useAppVersionStore((s) => s.refresh);
	return (
		<Modal visible animationType="fade" onRequestClose={() => {}} statusBarTranslucent navigationBarTranslucent supportedOrientations={['portrait', 'landscape']}>
			<SafeAreaProvider>
				<SafeAreaView style={{ flex: 1, backgroundColor: color.bg }} edges={['top', 'bottom', 'left', 'right']} accessibilityViewIsModal>
					<Contours opacity={0.5} />
					<ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: gutter, paddingVertical: 32, gap: 28 }}>
						<View style={{ alignItems: 'center', gap: 22 }}>
							<View style={{ width: 84, height: 84, borderRadius: radius.xl, backgroundColor: color.surface, borderWidth: 1, borderColor: color.line2, alignItems: 'center', justifyContent: 'center' }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
								<Mark size={44} />
							</View>
							<View style={{ gap: 12, alignItems: 'center', maxWidth: 420 }}>
								<Eyebrow>Update required</Eyebrow>
								<KText v="display" center accessibilityRole="header">
									Update Kushi to continue
								</KText>
								<KText v="lead" center>
									{message || FORCE_COPY}
								</KText>
							</View>
						</View>
						<View style={{ gap: 12, alignSelf: 'stretch', maxWidth: 420, width: '100%', marginHorizontal: 'auto' }}>
							<Button title="Update now" size="lg" block onPress={() => openStore(storeUrl)} accessibilityLabel="Update now" accessibilityHint="Opens the app store to update Kushi" />
							<Button title={checking ? 'Checking…' : 'Check again'} variant="quiet" block loading={checking} onPress={() => refresh({ force: true })} accessibilityLabel="Check again" accessibilityHint="Checks whether this version can be used again" />
						</View>
						{current || required ? (
							<KText v="xs" center accessibilityLabel={`You have version ${current ?? 'unknown'}${required ? `. Version ${required} or newer is required.` : ''}`}>
								{`You have ${current ?? 'unknown'}${required ? ` · Requires ${required}` : ''}`}
							</KText>
						) : null}
					</ScrollView>
				</SafeAreaView>
			</SafeAreaProvider>
		</Modal>
	);
}

function UpdatePrompt({ latest, storeUrl, message }: { latest: string; storeUrl: string | null; message: string | null }) {
	const dismiss = useAppVersionStore((s) => s.dismiss);
	// Open on mount; closing (Later / scrim / back) remembers this version.
	const [open, setOpen] = useState(true);
	const later = () => {
		setOpen(false);
		dismiss(latest);
	};
	return (
		<Sheet
			open={open}
			onClose={later}
			eyebrow={`Version ${latest}`}
			title="A new version of Kushi is available"
			footer={
				<View style={{ gap: 10 }}>
					<Button
						title="Update"
						block
						onPress={() => {
							openStore(storeUrl);
							later();
						}}
						accessibilityHint="Opens the app store to update Kushi"
					/>
					<Button title="Later" variant="quiet" block onPress={later} accessibilityHint="Hides this until the next version" />
				</View>
			}
		>
			<KText v="body" c="fg2">
				{message || SOFT_COPY}
			</KText>
		</Sheet>
	);
}

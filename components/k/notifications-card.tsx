import { useState } from 'react';
import { View } from 'react-native';
import { Bell, Check } from 'lucide-react-native';
import { Button } from './button';
import { KText } from './text';
import { color, radius } from '@/lib/k/theme';
import { askForNotifications } from '@/lib/k/push';

/**
 * The in-context ask for push notifications: one card, one button. Not a
 * pop-up and no "Not now" (Apple: a screen right before the system prompt may
 * only lead to it); ignoring it is the way to say no.
 */
export function NotificationsCard({ body, testID = 'notifications-card' }: { body: string; testID?: string }) {
	const [on, setOn] = useState(false);
	const [busy, setBusy] = useState(false);
	return (
		<View testID={testID} style={{ borderWidth: 1, borderColor: color.line, backgroundColor: color.bg2, borderRadius: radius.md, padding: 14, gap: 10 }}>
			<View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
				<Bell size={18} color={color.amber} />
				<KText v="bodyStrong" style={{ flex: 1 }}>
					Notifications
				</KText>
				{on ? (
					<View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
						<Check size={14} color={color.success} />
						<KText v="xs" style={{ color: color.success }}>
							On
						</KText>
					</View>
				) : null}
			</View>
			<KText v="small">{body}</KText>
			{!on ? (
				<Button
					title="Turn on"
					size="sm"
					block
					loading={busy}
					testID={`${testID}-on`}
					onPress={async () => {
						setBusy(true);
						const ok = await askForNotifications();
						setBusy(false);
						if (ok) setOn(true);
					}}
				/>
			) : null}
		</View>
	);
}

import { useCallback, useEffect, useState } from 'react';
import { AppState, Linking, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import notifee, { AuthorizationStatus } from '@notifee/react-native';
import { Button, Eyebrow, Header, KText, Notice, Screen, Skeleton } from '@/components/k';
import { Group, ToggleRow } from '@/components/k/settings';
import { cleanError } from '@/lib/k/account';
import { toast } from '@/lib/hooks/use-toast';
import { useUserStore } from '@/lib/stores/users';
import { useMeQuery, useUpdateUserNotificationSettingsMutation, type NotificationSettingsInput, type User } from '@/lib/services/graphql/generated';

type Key = keyof NotificationSettingsInput;

const ROWS: { key: Key; title: string; detail: string }[] = [
	{ key: 'pushNotifications', title: 'Push notifications', detail: 'Messages, applications, payments and calls on this phone' },
	{ key: 'email', title: 'Email', detail: 'Receipts, agreements and important account updates' },
	{ key: 'appUpdates', title: 'App updates', detail: 'New features and fixes worth knowing about' },
	{ key: 'specialOffers', title: 'Offers and news', detail: 'Occasional deals and homes we think you’ll like' }
];

/** Notification preferences. Each switch saves straight away and reverts if the save fails. */
export default function NotificationPreferences() {
	const stored = useUserStore((s) => s.user.user?.notificationSettings);
	const [{ data, fetching, error }, refetch] = useMeQuery({ requestPolicy: 'cache-and-network' });
	const server = data?.me?.notificationSettings ?? stored;
	const [values, setValues] = useState<NotificationSettingsInput | null>(null);
	const [saving, setSaving] = useState<Key | null>(null);
	const [osBlocked, setOsBlocked] = useState(false);
	const [, update] = useUpdateUserNotificationSettingsMutation();

	useEffect(() => {
		if (server && !saving) setValues({ email: !!server.email, pushNotifications: !!server.pushNotifications, specialOffers: !!server.specialOffers, appUpdates: !!server.appUpdates });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [server?.email, server?.pushNotifications, server?.specialOffers, server?.appUpdates]);

	const checkOs = useCallback(() => {
		notifee
			.getNotificationSettings()
			.then((s) => setOsBlocked(s.authorizationStatus === AuthorizationStatus.DENIED))
			.catch(() => {});
	}, []);
	useFocusEffect(checkOs);
	useEffect(() => {
		const sub = AppState.addEventListener('change', (s) => s === 'active' && checkOs());
		return () => sub.remove();
	}, [checkOs]);

	async function toggle(key: Key, on: boolean) {
		if (!values) return;
		const prev = values;
		const nextValues = { ...values, [key]: on };
		setValues(nextValues);
		setSaving(key);
		const r = await update({ input: nextValues });
		setSaving(null);
		const saved = r.data?.updateUserNotificationSettings.data;
		if (r.error || !saved) {
			setValues(prev);
			return toast.show({ type: 'error', text1: 'Couldn’t save that', text2: cleanError(r.error?.message) || 'Check your connection and try again.' });
		}
		const st = useUserStore.getState();
		const u = st.user.user ?? ({} as User);
		st.updateUser({ user: { ...u, notificationSettings: { ...u.notificationSettings, ...saved } } as User });
	}

	return (
		<Screen header={<Header eyebrow="You" title="Notifications" />} width="form" onRefresh={() => refetch({ requestPolicy: 'network-only' })} refreshing={false}>
			<View style={{ gap: 8, paddingTop: 20 }}>
				<Eyebrow>Choose what Kushi sends</Eyebrow>
				<KText v="small">Changes save straight away. Sign-in and security codes always go to your email, whatever you choose here.</KText>
			</View>

			{osBlocked ? (
				<Notice tone="warn" title="Notifications are off for Kushi on this phone" action="Open phone settings" onAction={() => Linking.openSettings()}>
					You won’t see new messages or application updates until you allow them in your phone’s Settings.
				</Notice>
			) : null}
			{error && !values ? <Notice tone="danger" title="Couldn’t load your preferences" action="Try again" onAction={() => refetch({ requestPolicy: 'network-only' })}>{cleanError(error.message)}</Notice> : null}

			{!values ? (
				fetching ? (
					<Skeleton style={{ height: 280 }} />
				) : null
			) : (
				<Group>
					{ROWS.map((r) => (
						<ToggleRow key={r.key} title={r.title} detail={r.detail} value={values[r.key]} disabled={saving === r.key} onChange={(on) => toggle(r.key, on)} testID={`notif-${r.key}`} />
					))}
				</Group>
			)}

			<Button title="See your notifications" variant="ghost" block onPress={() => router.push('/notifications')} />
		</Screen>
	);
}

import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Camera, KeyRound, Mail, Phone, ShieldCheck } from 'lucide-react-native';
import { Avatar, Button, Card, Divider, Field, Header, KText, Row, Screen } from '@/components/k';
import { color } from '@/lib/k/theme';
import { useUser } from '@/lib/hooks/user';
import { toast } from '@/lib/hooks/use-toast';
import { formMutation, generateRNFile } from '@/lib/services/graphql/utils/fetch';
import { UPDATE_USER_PROFILE } from '@/lib/services/graphql/requests/mutations/users';
import { useMeQuery, type User } from '@/lib/services/graphql/generated';

export default function ProfileEdit() {
	const { user, updateUser } = useUser();
	const me = user.user;
	const [{ data }] = useMeQuery({ requestPolicy: 'cache-and-network' });
	const phone = data?.me?.phoneNumbers?.find((p) => p.verificationStatus === 'VERIFIED')?.number ?? data?.me?.phoneNumbers?.[0]?.number;
	const [name, setName] = useState(me?.profile?.fullName ?? '');
	const [photo, setPhoto] = useState<string | null>(null);
	const [saving, setSaving] = useState(false);
	const changed = name.trim() !== (me?.profile?.fullName ?? '') || !!photo;

	async function pick() {
		const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.85 });
		if (!r.canceled) setPhoto(r.assets[0].uri);
	}

	async function save() {
		if (name.trim().length < 2) return toast.show({ type: 'error', text1: 'Add your full name' });
		setSaving(true);
		const res = await formMutation<{ updateProfile: { message: string; data: User['profile'] } }, unknown>(UPDATE_USER_PROFILE, {
			input: { fullName: name.trim(), gender: me?.profile?.gender, profilePicture: photo ? generateRNFile(photo) : undefined }
		}).catch((e: Error) => ({ error: e, data: undefined }));
		setSaving(false);
		const saved = res.data?.updateProfile.data;
		if (res.error || !saved) return toast.show({ type: 'error', text1: 'Couldn’t save', text2: String(res.error?.message ?? '').replace('[GraphQL] ', '') });
		updateUser({ user: { ...(me ?? ({} as User)), profile: saved } });
		toast.show({ type: 'success', text2: 'Profile updated' });
		router.back();
	}

	return (
		<Screen keyboard header={<Header eyebrow="You" title="Personal details" />} footer={<Button title="Save changes" size="lg" block loading={saving} disabled={!changed} onPress={save} />}>
			<View style={{ alignItems: 'center', gap: 10, paddingTop: 20 }}>
				<Pressable onPress={pick} accessibilityRole="button" accessibilityLabel="Change photo">
					<Avatar name={name || me?.profile?.fullName} uri={photo ?? me?.profile?.image?.publicUrl} size={104} />
					<View style={{ position: 'absolute', right: 0, bottom: 0, width: 34, height: 34, borderRadius: 17, backgroundColor: color.amber, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: color.bg }}>
						<Camera size={15} color={color.onAmber} />
					</View>
				</Pressable>
				<KText v="xs">Hosts see this photo when you apply. Use a clear photo of your face.</KText>
			</View>
			<Field label="Full name" value={name} onChangeText={setName} autoComplete="name" textContentType="name" autoCapitalize="words" hint="Use the name on your ID — it goes on your tenancy agreements." />
			<Card>
				<Row icon={<Mail size={17} color={color.fg2} />} title="Email" detail={me?.email ?? '—'} />
				<Divider />
				<Row icon={<Phone size={17} color={color.fg2} />} title="Phone" detail={phone ?? 'Add a phone number'} onPress={() => router.push('/verify')} />
				<Divider />
				<Row icon={<ShieldCheck size={17} color={color.fg2} />} title="Verification" detail="Selfie, NIN and BVN" onPress={() => router.push('/verify')} />
				<Divider />
				<Row icon={<KeyRound size={17} color={color.fg2} />} title="Password" detail="Reset it with a code sent to your email" onPress={() => router.push({ pathname: '/auth/forgot-password', params: { email: me?.email ?? '' } })} />
			</Card>
		</Screen>
	);
}

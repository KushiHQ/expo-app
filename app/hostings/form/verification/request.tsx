import { useState } from 'react';
import { ActionSheetIOS, Platform, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Check, FileText, Lock, Upload, X } from 'lucide-react-native';
import { Button, Card, Empty, Header, IconButton, KText, Notice, Screen, Skeleton } from '@/components/k';
import { Pressable } from '@/components/k/pressable';
import { color, radius } from '@/lib/k/theme';
import { TIERS } from '@/lib/k/tiers';
import { cleanError } from '@/lib/k/use-listing-step';
import { toast } from '@/lib/hooks/use-toast';
import { formMutation, generateRNFile } from '@/lib/services/graphql/utils/fetch';
import { REQUEST_HOSTING_VERIFICATION_TIER } from '@/lib/services/graphql/requests/mutations/hostings';
import { enumKeyByValue } from '@/lib/utils/enums';
import { HostingVerificationTier as T, useHostingVerificationTierQuery, type RequestHostingVerificationTierMutation, type RequestHostingVerificationTierMutationVariables } from '@/lib/services/graphql/generated';

type Picked = { uri: string; name: string; type: string; size?: number };
const DOC_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/webp'];
const bytes = (n?: number) => (!n ? '' : n < 1048576 ? `${Math.round(n / 1024)} KB` : `${(n / 1048576).toFixed(1)} MB`);

/** Send documents for one verification level. */
export default function RequestVerification() {
	const params = useLocalSearchParams<{ id?: string; tier?: T }>();
	const id = (Array.isArray(params.id) ? params.id[0] : params.id) ?? '';
	const tier = (Array.isArray(params.tier) ? params.tier[0] : params.tier) as T | undefined;
	const photosOnly = tier === T.IdentityVerified; // the server rejects PDFs for ID
	const [{ data, fetching, error }, refetch] = useHostingVerificationTierQuery({ variables: { tier: enumKeyByValue(T, tier ?? '') ?? '' }, pause: !tier });
	const docs = data?.hostingVerificationTier?.documentRequirements ?? [];
	const [picked, setPicked] = useState<Record<string, Picked | null>>({});
	const [sending, setSending] = useState(false);
	const count = docs.filter((d) => picked[d.title]).length;
	const ready = docs.length > 0 ? count === docs.length : !!data;

	async function fromLibrary(title: string) {
		const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.9 });
		const a = r.assets?.[0];
		if (!r.canceled && a) setPicked((p) => ({ ...p, [title]: { uri: a.uri, name: a.fileName ?? 'photo.jpg', type: (a.mimeType ?? 'image/jpeg').toLowerCase(), size: a.fileSize } }));
	}
	async function fromCamera(title: string) {
		const perm = await ImagePicker.requestCameraPermissionsAsync();
		if (!perm.granted) return toast.show({ type: 'error', text1: 'Camera is off for Kushi', text2: 'Allow it in Settings, or choose a photo instead.' });
		const r = await ImagePicker.launchCameraAsync({ quality: 0.9 });
		const a = r.assets?.[0];
		if (!r.canceled && a) setPicked((p) => ({ ...p, [title]: { uri: a.uri, name: a.fileName ?? 'photo.jpg', type: (a.mimeType ?? 'image/jpeg').toLowerCase(), size: a.fileSize } }));
	}
	async function fromFiles(title: string) {
		const r = await DocumentPicker.getDocumentAsync({ type: DOC_TYPES, copyToCacheDirectory: true });
		const a = r.assets?.[0];
		if (!r.canceled && a) setPicked((p) => ({ ...p, [title]: { uri: a.uri, name: a.name ?? 'document', type: (a.mimeType ?? 'application/octet-stream').toLowerCase(), size: a.size } }));
	}
	function choose(title: string) {
		const options = photosOnly ? ['Take a photo', 'Choose a photo', 'Cancel'] : ['Take a photo', 'Choose a photo', 'Browse files', 'Cancel'];
		const handlers = [fromCamera, fromLibrary, ...(photosOnly ? [] : [fromFiles])];
		if (Platform.OS === 'ios') {
			ActionSheetIOS.showActionSheetWithOptions({ options, cancelButtonIndex: options.length - 1, title }, (i) => handlers[i]?.(title));
		} else if (photosOnly) {
			fromLibrary(title);
		} else {
			fromFiles(title); // Android's picker already includes the gallery
		}
	}

	async function submit() {
		if (!tier || !ready || sending) return;
		setSending(true);
		try {
			const res = await formMutation<RequestHostingVerificationTierMutation, RequestHostingVerificationTierMutationVariables>(REQUEST_HOSTING_VERIFICATION_TIER, {
				input: { hostingId: id, targetTier: tier, documentNames: docs.map((d) => d.title), uploads: docs.map((d) => generateRNFile(picked[d.title]!.uri)) }
			});
			if (res.error || !res.data?.requestHostingVerificationTier?.data) {
				toast.show({ type: 'error', text1: 'Not sent', text2: cleanError(res.error?.message) });
				return;
			}
			Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
			toast.show({ type: 'success', text1: 'Request sent', text2: 'Kushi will review it within 3–5 business days.' });
			router.back();
		} catch (e) {
			toast.show({ type: 'error', text1: 'Not sent', text2: e instanceof Error ? e.message : 'Check your connection and try again.' });
		} finally {
			setSending(false);
		}
	}

	return (
		<Screen
			width="form"
			header={<Header eyebrow="Verification" title={tier ? TIERS[tier].label : 'Request'} />}
			contentStyle={{ paddingTop: 20 }}
			footer={
				<View style={{ gap: 8 }}>
					{docs.length ? (
						<KText v="xs" center>
							{count} of {docs.length} document{docs.length === 1 ? '' : 's'} added
						</KText>
					) : null}
					<Button title={sending ? 'Sending…' : 'Send for review'} size="lg" block loading={sending} disabled={!ready} onPress={submit} testID="verification-send" />
				</View>
			}
		>
			{!tier ? (
				<Empty title="Choose a level first" action="Go back" onAction={() => router.back()} />
			) : (
				<>
					<KText v="small">{TIERS[tier].what}</KText>
					{fetching && !data ? (
						<View style={{ gap: 10 }}>
							<Skeleton style={{ height: 76 }} />
							<Skeleton style={{ height: 76 }} />
						</View>
					) : error ? (
						<Notice tone="danger" title="We couldn’t load what’s needed" action="Try again" onAction={() => refetch({ requestPolicy: 'network-only' })}>
							{cleanError(error.message)}
						</Notice>
					) : docs.length === 0 ? (
						<Notice tone="success" title="No documents needed">Send the request and Kushi will take it from there.</Notice>
					) : (
						docs.map((d) => {
							const f = picked[d.title];
							return (
								<Card key={d.title} style={{ padding: 14 }}>
									<View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
										<View style={{ width: 40, height: 40, borderRadius: radius.md, backgroundColor: f ? color.successSoft : color.surface, alignItems: 'center', justifyContent: 'center' }}>{f ? <Check size={18} color={color.success} /> : <FileText size={18} color={color.muted} />}</View>
										<View style={{ flex: 1, gap: 2 }}>
											<KText v="smallStrong">{d.title}</KText>
											<KText v="xs" numberOfLines={2}>
												{f ? `${f.name}${f.size ? ` · ${bytes(f.size)}` : ''}` : d.description || (photosOnly ? 'A clear photo, all four corners showing' : 'PDF or photo')}
											</KText>
										</View>
										{f ? (
											<IconButton label={`Remove ${d.title}`} size={36} onPress={() => setPicked((p) => ({ ...p, [d.title]: null }))}>
												<X size={16} color={color.fg} />
											</IconButton>
										) : null}
									</View>
									<Pressable accessibilityRole="button" accessibilityLabel={`${f ? 'Replace' : 'Add'} ${d.title}`} onPress={() => choose(d.title)} disabled={sending} style={{ flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', height: 42, borderRadius: radius.pill, borderWidth: 1, borderColor: color.line2 }}>
										<Upload size={15} color={color.fg} />
										<KText v="smallStrong">{f ? 'Replace' : photosOnly ? 'Add a photo' : 'Add file'}</KText>
									</Pressable>
								</Card>
							);
						})
					)}
					<View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
						<Lock size={14} color={color.muted} style={{ marginTop: 2 }} />
						<KText v="xs" style={{ flex: 1 }}>
							Documents are stored encrypted and only Kushi’s verification team can see them. Reviews take 3–5 business days; you’ll be notified of the decision.
						</KText>
					</View>
				</>
			)}
		</Screen>
	);
}

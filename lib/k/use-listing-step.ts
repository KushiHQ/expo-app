/**
 * One listing set-up step: the shared form store (useHostingForm) plus what
 * every step needs on top — a stable id, unsaved-change tracking, a save that
 * never drops the publish status, and navigation back to the hub.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { useHostingForm } from '@/lib/hooks/hosting-form';
import { PublishStatus, type HostingInput } from '@/lib/services/graphql/generated';
import { toast } from '@/lib/hooks/use-toast';
import { hubHref, nextStep, stepHref, type Hosting, type StepKey } from './listing-steps';

export const cleanError = (m?: string | null) => (m ?? '').replace(/\[(GraphQL|Network)\]\s*/g, '').trim() || 'Something went wrong. Try again.';

export function useListingStep(rawId: string | string[] | undefined, key: StepKey) {
	// The camera hand-back re-enters this screen with new params; keep the id we opened with.
	const [id] = useState(() => (Array.isArray(rawId) ? rawId[0] : rawId) || undefined);
	const form = useHostingForm(id);
	const hosting = (form.hosting && form.hosting.id === id ? form.hosting : undefined) as Hosting | undefined;
	const ready = !id || (!!hosting && form.input.id === id);

	// Unsaved-change tracking: snapshot the input once the store holds this listing.
	const base = useRef<string | null>(null);
	useEffect(() => {
		if (base.current === null && ready && (id ? form.input.id === id : true)) base.current = JSON.stringify(form.input);
	}, [ready, id, form.input]);
	const dirty = base.current !== null && JSON.stringify(form.input) !== base.current;

	/** Save the listing. Always sends a publish status — the server nulls it otherwise. Returns the id, or null on failure. */
	const save = useCallback(
		async (patch?: Partial<HostingInput>): Promise<string | null> => {
			const input = { ...form.input, ...patch };
			input.publishStatus = input.publishStatus ?? form.hosting?.publishStatus ?? PublishStatus.Draft;
			const res = await form.mutate({ input });
			if (res.error || !res.data?.createOrUpdateHosting?.data?.id) {
				toast.show({ type: 'error', text1: 'Couldn’t save', text2: cleanError(res.error?.message) });
				return null;
			}
			if (patch) form.updateInput(patch);
			base.current = JSON.stringify({ ...input });
			if (id) form.refetch();
			return res.data.createOrUpdateHosting.data.id;
		},
		[form, id]
	);

	const toHub = useCallback(
		(hostingId = id) => {
			if (router.canGoBack()) router.back();
			else if (hostingId) router.replace(hubHref(hostingId));
			else router.replace('/host');
		},
		[id]
	);

	/** Header back: keep what was typed. */
	const leave = useCallback(async () => {
		if (!dirty || !id) return toHub();
		const saved = await save();
		if (saved) return toHub();
		Alert.alert('Leave without saving?', 'Your latest changes on this step weren’t saved.', [
			{ text: 'Stay', style: 'cancel' },
			{ text: 'Leave', style: 'destructive', onPress: () => toHub() }
		]);
	}, [dirty, id, save, toHub]);

	/** Move on to the next step that applies (or back to the hub when this was the last). */
	const advance = useCallback(
		(hostingId = id, h: Hosting | undefined = hosting ? ({ ...hosting, ...form.input } as Hosting) : undefined) => {
			if (!hostingId) return;
			const next = nextStep(h, key);
			if (next) router.replace(stepHref(next, hostingId));
			else toHub(hostingId);
		},
		[hosting, form.input, id, key, toHub]
	);

	return { ...form, id, hosting, ready, dirty, save, leave, toHub, advance };
}

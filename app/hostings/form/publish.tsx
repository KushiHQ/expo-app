import { useEffect, useMemo, useState } from 'react';
import { Linking, View } from 'react-native';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { Check as CheckIcon, Eye, ShieldCheck, Sparkles } from 'lucide-react-native';
import { Button, Card, Check, Eyebrow, Field, KText, Notice, Photo, Pill, Sheet, Spinner } from '@/components/k';
import { Block, StepRow, StepScreen } from '@/components/k/listing-form';
import { PUBLISH } from '@/components/k/host-bits';
import { color } from '@/lib/k/theme';
import { naira, perInterval, place } from '@/lib/k/format';
import { useListingStep, cleanError } from '@/lib/k/use-listing-step';
import { MIN_DESCRIPTION, PLACEHOLDER_TITLE, stepHref, stepsFor, type Hosting } from '@/lib/k/listing-steps';
import { isAgentManaged } from '@/lib/constants/hosting/step-rules';
import { useUploadStore } from '@/lib/stores/uploads';
import { PublishStatus, useAiHostingContentSuggestionQuery } from '@/lib/services/graphql/generated';

const TITLE_MAX = 80;
const DESCRIPTION_MAX = 1500;

/** Step 7 — name it, describe it, check everything, then publish (or unpublish). */
export default function Publish() {
	const params = useLocalSearchParams<{ id?: string }>();
	const f = useListingStep(params.id, 'publish');
	const { input, updateInput, hosting } = f;
	const [tried, setTried] = useState(false);
	const [busy, setBusy] = useState(false);
	const [agree, setAgree] = useState({ truth: false, terms: false });
	const [done, setDone] = useState(false);
	const [unpublish, setUnpublish] = useState(false);
	const uploading = useUploadStore((s) => Object.keys(s.tasks).length > 0);
	const [{ data: ai, fetching: drafting, error: aiError }, draft] = useAiHostingContentSuggestionQuery({ variables: { hostingId: f.id ?? '' }, pause: true });
	const [aiOpen, setAiOpen] = useState(false);

	const status = hosting?.publishStatus ?? PublishStatus.Draft;
	const live = status === PublishStatus.Live;
	useEffect(() => {
		if (live) setAgree({ truth: true, terms: true });
	}, [live]);

	const merged = useMemo(() => (hosting ? ({ ...hosting, title: input.title, description: input.description } as Hosting) : undefined), [hosting, input.title, input.description]);
	const steps = stepsFor(merged);
	const others = steps.filter((s) => s.key !== 'publish');
	const blocking = others.filter((s) => !s.done);
	const titleOk = !!input.title?.trim() && !PLACEHOLDER_TITLE.test(input.title);
	const descOk = (input.description?.trim().length ?? 0) >= MIN_DESCRIPTION;
	const ready = !blocking.length && titleOk && descOk && !uploading;
	const agent = isAgentManaged(hosting?.managementType);

	async function publish() {
		setTried(true);
		if (!ready || !agree.truth || !agree.terms) return;
		setBusy(true);
		const id = await f.save({ title: input.title?.trim(), description: input.description?.trim(), publishStatus: PublishStatus.Live });
		setBusy(false);
		if (id) setDone(true);
	}

	async function saveOnly() {
		setTried(true);
		setBusy(true);
		const id = await f.save({ title: input.title?.trim(), description: input.description?.trim() });
		setBusy(false);
		if (id) f.toHub(id);
	}

	async function takeDown() {
		setBusy(true);
		const id = await f.save({ publishStatus: PublishStatus.Draft });
		setBusy(false);
		setUnpublish(false);
		if (id) f.toHub(id);
	}

	const primary = live ? { title: 'Save changes', onPress: saveOnly } : ready ? { title: 'Publish listing', onPress: publish, disabled: tried && (!agree.truth || !agree.terms) } : { title: 'Save draft', onPress: saveOnly };
	const st = PUBLISH[status] ?? PUBLISH.DRAFT;

	return (
		<StepScreen
			stepKey="publish"
			hosting={merged}
			onBack={f.leave}
			loading={!f.ready}
			primary={{ ...primary, loading: busy, testID: 'step-next' }}
			footnote={
				!live && !ready ? (
					<KText v="xs" center style={{ color: color.fg2 }}>
						{uploading ? 'Wait for your photos to finish uploading.' : blocking.length ? `Finish ${blocking.length} more step${blocking.length === 1 ? '' : 's'} to publish.` : 'Add a title and description to publish.'}
					</KText>
				) : tried && !live && (!agree.truth || !agree.terms) ? (
					<KText v="xs" c="danger" center>
						Tick both boxes to publish.
					</KText>
				) : null
			}
		>
			{hosting ? (
				<Card style={{ flexDirection: 'row', gap: 14, alignItems: 'center', padding: 12 }}>
					<Photo assetId={hosting.coverImage?.asset?.id} w={300} h={240} style={{ width: 96, height: 76 }} />
					<View style={{ flex: 1, gap: 4 }}>
						<KText v="smallStrong" numberOfLines={2}>
							{input.title?.trim() || 'Your title goes here'}
						</KText>
						<KText v="xs" numberOfLines={1}>
							{place(hosting.city, hosting.state) || 'No location yet'}
							{Number(hosting.price) ? ` · ${naira(Number(hosting.price))} ${hosting.listingType === 'SALE' ? '' : perInterval(hosting.paymentInterval)}` : ''}
						</KText>
						<Pill tone={st.tone}>{st.label}</Pill>
					</View>
				</Card>
			) : null}

			<Block title="Name and describe it" sub="Say what makes it worth a visit: size, condition, the street, what’s nearby.">
				<Button title={drafting ? 'Writing…' : 'Draft it for me'} variant="ghost" size="sm" icon={<Sparkles size={15} color={color.amber} />} loading={drafting} onPress={() => { setAiOpen(true); draft({ requestPolicy: 'network-only' }); }} style={{ alignSelf: 'flex-start' }} />
				{aiOpen && !drafting && (ai?.aiHostingContentSuggestion || aiError) ? (
					aiError ? (
						<Notice tone="danger" title="Couldn’t write a draft">{cleanError(aiError.message)}</Notice>
					) : (
						<Card tone="amber">
							<Eyebrow c="amber">Suggestion</Eyebrow>
							<KText v="bodyStrong">{ai!.aiHostingContentSuggestion.title}</KText>
							<KText v="small" numberOfLines={6}>
								{ai!.aiHostingContentSuggestion.description}
							</KText>
							<View style={{ flexDirection: 'row', gap: 10 }}>
								<Button title="Use this" size="sm" onPress={() => { updateInput({ title: ai!.aiHostingContentSuggestion.title.slice(0, TITLE_MAX), description: ai!.aiHostingContentSuggestion.description.slice(0, DESCRIPTION_MAX) }); setAiOpen(false); }} />
								<Button title="No thanks" size="sm" variant="quiet" onPress={() => setAiOpen(false)} />
							</View>
						</Card>
					)
				) : null}
				<Field label="Title" value={input.title ?? ''} onChangeText={(title) => updateInput({ title })} maxLength={TITLE_MAX} placeholder="3-bedroom flat with a garden in Lekki Phase 1" error={tried && !titleOk ? 'Give it a real title — “Untitled listing” won’t do.' : null} hint={`${(input.title ?? '').length}/${TITLE_MAX}`} testID="field-title" />
				<Field label="Description" multiline value={input.description ?? ''} onChangeText={(description) => updateInput({ description })} maxLength={DESCRIPTION_MAX} placeholder="Bright 3-bedroom flat on a quiet, gated street. 24-hour power from a shared inverter, borehole water, and parking for two cars…" error={tried && !descOk ? `Write at least ${MIN_DESCRIPTION} characters.` : null} hint={`${(input.description ?? '').length}/${DESCRIPTION_MAX}`} style={{ minHeight: 140 }} testID="field-description" />
			</Block>

			<Block title="Final check" sub={blocking.length ? 'Tap a step to finish it.' : 'Everything’s in place.'}>
				<View>
					{others.map((s) => (
						<StepRow key={s.key} step={s} onPress={() => f.id && router.push(stepHref(s.key, f.id))} />
					))}
				</View>
				{uploading ? <Notice tone="info" title="Photos still uploading">You can publish once they’re done, so the listing never goes out with missing pictures.</Notice> : null}
			</Block>

			{!live ? (
				<Block title="What happens when you publish">
					<Next icon={<Eye size={16} color={color.amber} />} title="It goes live straight away" body="Renters can find it in search and on the map." />
					<Next icon={<CheckIcon size={16} color={color.amber} />} title={agent ? 'People contact you directly' : 'Renters apply through Kushi'} body={agent ? 'Enquiries come to your contact number and Kushi inbox.' : 'You’ll be notified of each application. Nothing is agreed until you accept it.'} />
					{!agent ? <Next icon={<ShieldCheck size={16} color={color.amber} />} title="Get verified to stand out" body="Send documents for trust badges. Kushi reviews each request within 3–5 business days." /> : null}
				</Block>
			) : null}

			{!live ? (
				<View style={{ gap: 14 }}>
					<Check on={agree.truth} onPress={() => setAgree((a) => ({ ...a, truth: !a.truth }))}>
						<KText v="small">Everything in this listing is true and accurate, to the best of my knowledge.</KText>
					</Check>
					<Check on={agree.terms} onPress={() => setAgree((a) => ({ ...a, terms: !a.terms }))}>
						<KText v="small">
							I agree to Kushi’s{' '}
							<KText v="small" c="amber" style={{ textDecorationLine: 'underline' }} onPress={() => Linking.openURL('https://housing.kushi.ng/legal/terms-of-service')}>
								hosting terms
							</KText>
							.
						</KText>
					</Check>
				</View>
			) : (
				<Card>
					<KText v="bodyStrong">Take it off Kushi for now?</KText>
					<KText v="small">Unpublishing hides it from renters until you publish it again.</KText>
					<Button title="Unpublish" variant="ghost" size="sm" onPress={() => setUnpublish(true)} style={{ alignSelf: 'flex-start' }} />
				</Card>
			)}

			<Sheet open={unpublish} onClose={() => setUnpublish(false)} title="Unpublish this listing?">
				<KText v="small">It moves back to drafts. You can publish it again any time.</KText>
				<Button title="Unpublish" variant="danger" block loading={busy} onPress={takeDown} />
				<Button title="Keep it live" variant="ghost" block onPress={() => setUnpublish(false)} />
			</Sheet>

			<Sheet open={done} onClose={() => f.toHub()} title="You’re live" eyebrow="Published" dismissible={false}>
				{busy ? <Spinner /> : null}
				<KText v="small">{input.title?.trim()} is now on Kushi. We’ll let you know when someone {agent ? 'gets in touch' : 'applies'}.</KText>
				{!agent ? (
					<Notice tone="info" title="Next: get verified">
						Verified listings show a trust badge and rank higher. Upload the documents for each level and Kushi reviews them within 3–5 business days.
					</Notice>
				) : null}
				{!agent ? <Button title="Get verified" block onPress={() => { setDone(false); router.replace(`/hostings/form/verification/overview?id=${f.id}` as Href); }} /> : null}
				<Button title="See my listing" variant="ghost" block onPress={() => { setDone(false); router.replace(`/hostings/${f.id}` as Href); }} />
				<Button title="Done" variant="quiet" block onPress={() => { setDone(false); f.toHub(); }} />
			</Sheet>
		</StepScreen>
	);
}

function Next({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
	return (
		<View style={{ flexDirection: 'row', gap: 12 }}>
			<View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: color.amberSoft, alignItems: 'center', justifyContent: 'center' }}>{icon}</View>
			<View style={{ flex: 1, gap: 2 }}>
				<KText v="smallStrong">{title}</KText>
				<KText v="xs">{body}</KText>
			</View>
		</View>
	);
}

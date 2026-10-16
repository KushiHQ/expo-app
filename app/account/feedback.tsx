import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MessageSquareHeart } from 'lucide-react-native';
import { Button, Check, Choice, Eyebrow, Field, Header, KText, Notice, Screen } from '@/components/k';
import { color } from '@/lib/k/theme';
import { cleanError } from '@/lib/k/account';
import { FeedbackType, useSubmitFeedbackMutation } from '@/lib/services/graphql/generated';

const TYPES: { value: FeedbackType; title: string; detail: string }[] = [
	{ value: FeedbackType.BugReport, title: 'Something isn’t working', detail: 'A screen, button or payment that went wrong' },
	{ value: FeedbackType.FeatureRequest, title: 'An idea', detail: 'Something Kushi should do or do better' },
	{ value: FeedbackType.Complaint, title: 'A complaint', detail: 'About a host, renter, home or our service' },
	{ value: FeedbackType.General, title: 'Something else', detail: 'Anything you want us to know' }
];

/** Feedback to the Kushi team (not a support conversation). */
export default function Feedback() {
	const [type, setType] = useState<FeedbackType>(FeedbackType.General);
	const [title, setTitle] = useState('');
	const [body, setBody] = useState('');
	const [consent, setConsent] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [done, setDone] = useState(false);
	const [{ fetching }, submit] = useSubmitFeedbackMutation();

	async function send() {
		setError(null);
		const r = await submit({ input: { feedbackType: type, title: title.trim() || undefined, body: body.trim(), contactConsent: consent } });
		if (r.error || !r.data?.submitFeedback) return setError(cleanError(r.error?.message) || 'It didn’t send. Check your connection and try again.');
		Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
		setDone(true);
	}

	if (done)
		return (
			<Screen header={<Header eyebrow="Help" title="Feedback" />} width="form" footer={<Button title="Back to You" size="lg" block onPress={() => (router.canGoBack() ? router.back() : router.replace('/you'))} />}>
				<View style={{ alignItems: 'center', gap: 12, paddingTop: 48 }}>
					<MessageSquareHeart size={40} color={color.amber} strokeWidth={1.5} />
					<KText v="title" center>
						Thank you — we read every one.
					</KText>
					<KText v="small" center style={{ maxWidth: 340 }}>
						{consent ? 'If we need more detail, someone from the team will email you.' : 'You asked us not to contact you, so we won’t reply — but it still counts.'}
					</KText>
					<KText v="xs" center style={{ maxWidth: 340 }}>
						Need an answer about a booking or payment? Use Kushi Support instead — it goes straight to a person.
					</KText>
				</View>
			</Screen>
		);

	const tooShort = body.trim().length > 0 && body.trim().length < 10;
	return (
		<Screen
			header={<Header eyebrow="Help" title="Share feedback" />}
			width="form"
			keyboard
			footer={<Button title="Send feedback" size="lg" block loading={fetching} disabled={body.trim().length < 10} onPress={send} testID="feedback-send" />}
		>
			<View style={{ gap: 8, paddingTop: 20 }}>
				<Eyebrow>Help us improve Kushi</Eyebrow>
				<KText v="small">This goes to the product team. For help with a booking or payment, message Kushi Support — they’ll reply in the app.</KText>
				<Button title="Message Kushi Support instead" variant="quiet" size="sm" onPress={() => router.push('/support')} style={{ alignSelf: 'flex-start', paddingHorizontal: 0 }} />
			</View>
			<View style={{ gap: 10 }} accessibilityRole="radiogroup">
				<KText v="label">What’s it about?</KText>
				{TYPES.map((t) => (
					<Choice key={t.value} title={t.title} detail={t.detail} on={type === t.value} onPress={() => setType(t.value)} />
				))}
			</View>
			<Field label="Short summary" optional value={title} onChangeText={setTitle} maxLength={120} placeholder="e.g. Payment page froze" />
			<Field
				label="Tell us more"
				value={body}
				onChangeText={setBody}
				multiline
				maxLength={2000}
				placeholder="What happened, what you expected, and where in the app"
				hint={`${body.trim().length}/2000`}
				error={tooShort ? 'A little more detail helps us act on it (10 characters or more).' : null}
				testID="feedback-body"
			/>
			<Check on={consent} onPress={() => setConsent((c) => !c)}>
				<KText v="small" c="fg">
					Kushi can email me about this feedback
				</KText>
			</Check>
			{error ? <Notice tone="danger">{error}</Notice> : null}
		</Screen>
	);
}

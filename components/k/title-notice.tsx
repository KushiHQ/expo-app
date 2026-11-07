/**
 * Calm heads-up for renters when Kushi hasn't checked the property's title yet
 * (any level below "Title checked"), with an extra line when an agent listed
 * it. Hidden once the title is checked.
 */
import { Notice } from '@/components/k';
import { HostingVerificationTier as T } from '@/lib/services/graphql/generated';
import { TIERS, TIER_ORDER, tierRank } from '@/lib/k/tiers';

export function TitleNotice({
	verification
}: {
	verification?: { verificationTier?: T | null; listedByAgent?: boolean | null; landlordConfirmationStatus?: string | null } | null;
}) {
	const tier = verification?.verificationTier ?? T.Unverified;
	if (tierRank(tier) >= TIER_ORDER.indexOf(T.TitleChecked)) return null;
	const agent = !!verification?.listedByAgent;
	const confirmed = verification?.landlordConfirmationStatus === 'CONFIRMED';
	return (
		<Notice tone="info" title="Kushi hasn’t checked the property title yet">
			This listing is {TIERS[tier].label.toLowerCase()}.{agent ? ` It’s listed by an agent for the owner${confirmed ? ', and Kushi has spoken to the owner' : ''}.` : ''} Before you pay, view the home and ask for proof that{' '}
			{agent ? 'the owner has authorised the agent to let it' : 'it’s theirs to let'}. Your payment stays with Kushi until you confirm you have the keys.
		</Notice>
	);
}

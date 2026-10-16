import { useLocalSearchParams } from 'expo-router';
import { ApplicationsBoard } from '@/components/k/applications-board';
import { useHostingQuery } from '@/lib/services/graphql/generated';

/** One listing's applications (opened from the listing hub). Same board as the Applications tab. */
export default function ListingApplications() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const [{ data }] = useHostingQuery({ variables: { hostingId: String(id), pagination: { limit: 1, offset: 0 } } });
	return <ApplicationsBoard listingId={String(id)} listingTitle={data?.hosting?.title ?? undefined} />;
}

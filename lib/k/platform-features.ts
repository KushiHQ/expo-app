/**
 * Platform-wide switches staff set in the admin (Settings → Features). The
 * server enforces each one; the app reads them only to hide what is off.
 * Until the answer arrives everything counts as on.
 */
import { gql, useQuery } from 'urql';

const PLATFORM_FEATURES = gql`
	query KPlatformFeatures {
		platformFeatures { agentListings }
	}
`;

export type PlatformFeatures = { agentListings: boolean };

export function usePlatformFeatures(): PlatformFeatures {
	const [{ data }] = useQuery<{ platformFeatures: PlatformFeatures }>({ query: PLATFORM_FEATURES, requestPolicy: 'cache-and-network' });
	return { agentListings: data?.platformFeatures?.agentListings ?? true };
}

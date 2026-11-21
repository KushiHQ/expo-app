/**
 * The two answers from New listing (role, and whether the host is at the
 * property), kept on this phone until the listing exists and then by listing id.
 *
 * Role can't be saved to the listing's verification record up front: that
 * record needs the owner's name, address and the declarations, and the server
 * only accepts it from a host who has verified their identity. So it is kept
 * here and pre-fills the Ownership step.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HostingPropertyRelationship } from '@/lib/services/graphql/generated';

export type Whereabouts = 'here' | 'away';
type Intent = { role: HostingPropertyRelationship; where: Whereabouts };

type Store = {
	/** Answers for the listing being started (no id yet). */
	pending: Intent | null;
	byListing: Record<string, Intent>;
	setPending: (i: Intent | null) => void;
	/** Called once the first step has created the listing. */
	attach: (hostingId: string) => void;
};

export const useListingIntent = create<Store>()(
	persist(
		(set, get) => ({
			pending: null,
			byListing: {},
			setPending: (pending) => set({ pending }),
			attach: (hostingId) => {
				const p = get().pending;
				if (!p) return;
				set({ pending: null, byListing: { ...get().byListing, [hostingId]: p } });
			}
		}),
		{ name: 'k.listing-intent.v1', storage: createJSONStorage(() => AsyncStorage) }
	)
);

export const intentFor = (hostingId?: string | null) => (hostingId ? useListingIntent.getState().byListing[hostingId] : undefined);

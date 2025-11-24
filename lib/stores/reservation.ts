import { create } from "zustand";
import { InitiateBookingInput } from "../services/graphql/generated";
import { cast } from "../types/utils";

type PaymentMethodStore = {
	input: InitiateBookingInput;
	updateInput: (data: Partial<InitiateBookingInput>) => void;
	clear: () => void;
};

export const useReservationStore = create<PaymentMethodStore>((set) => ({
	input: {} as InitiateBookingInput,
	updateInput: (data) =>
		set((state) => ({
			input: { ...state.input, ...cast<InitiateBookingInput>(data) },
		})),
	clear() {
		set({ input: {} as InitiateBookingInput });
	},
}));

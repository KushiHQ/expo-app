import { create } from 'zustand';
import { BookingApplicationUpdateInput, GuestFormDataInput } from '../services/graphql/generated';

interface BookingApplicationStore {
  input: BookingApplicationUpdateInput;
  setInput: (input: BookingApplicationUpdateInput) => void;
  updateInput: (data: Partial<BookingApplicationUpdateInput>) => void;
  updateGuestFormData: (data: Partial<GuestFormDataInput>) => void;
  clear: () => void;
}

export const useBookingApplicationStore = create<BookingApplicationStore>((set) => ({
  input: {} as BookingApplicationUpdateInput,
  setInput: (input) => set({ input }),
  updateInput: (data) =>
    set((state) => ({
      input: { ...state.input, ...data },
    })),
  updateGuestFormData: (data) =>
    set((state) => {
      const guestFormData = state.input.guestFormData ?? ({} as GuestFormDataInput);
      return {
        input: {
          ...state.input,
          guestFormData: { ...guestFormData, ...data },
        },
      };
    }),
  clear: () => set({ input: {} as BookingApplicationUpdateInput }),
}));

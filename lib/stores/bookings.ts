import ATOM_KEYS from "../constants/atom-keys";
import { Booking } from "../constants/mocks/bookings";
import atomWithStorageStorage from "./utils";

const DEFAULT_BOOKINGS: Booking[] = [];

export const bookingsAtom = atomWithStorageStorage(
  ATOM_KEYS.BOOKINGS,
  DEFAULT_BOOKINGS,
);

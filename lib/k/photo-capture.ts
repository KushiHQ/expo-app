/**
 * Where each listing photo was taken, as the Kushi camera saw it.
 *
 * The server refuses a room photo with no location. EXIF GPS isn't reliable
 * on its own — an in-app crop or rotate writes a fresh file without it — so
 * the camera records the coordinates for every shot here, keyed by file uri,
 * and the upload queue sends them alongside the photo (`capture` on
 * `createHostingRoomImage`). Edits carry the original's location over.
 */
import type { PhotoCaptureInput } from '@/lib/services/graphql/generated';

export type PhotoCapture = PhotoCaptureInput;

// Module scope on purpose: a shot only needs this between the camera and the
// upload queue, which persists it on the queued task from then on.
const captures = new Map<string, PhotoCapture>();

export function rememberCapture(uri: string, capture: PhotoCapture) {
	captures.set(uri, capture);
}

export function captureFor(uri: string): PhotoCapture | undefined {
	return captures.get(uri);
}

/** An edited copy was taken where the original was. */
export function carryCapture(from: string, to: string) {
	const c = captures.get(from);
	if (c) captures.set(to, c);
}

export function forgetCapture(uri: string) {
	captures.delete(uri);
}

/** The server's message when a room photo arrives without a location. */
export const NEEDS_LOCATION = 'Room photos must be taken with location on — use the in-app camera or turn on location for your camera';

export const isLocationError = (message?: string | null) => !!message && /taken with location on|PHOTO_LOCATION_REQUIRED/i.test(message);

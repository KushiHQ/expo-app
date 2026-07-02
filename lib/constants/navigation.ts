/**
 * Shared Expo Router / native-stack screen options (WS-10). One source of truth so
 * navigation feels consistent and intentional instead of the directionless `fade`
 * that was on every stack (which also disabled the iOS edge-back swipe).
 *
 * - Card stacks slide horizontally and keep the back-swipe gesture.
 * - Modals (camera, photo viewer) present full-screen from the bottom.
 * - Tab roots keep their own `fade` (a swap, not a push) — don't use these there.
 */
export const STACK_SCREEN_OPTIONS = {
  headerShown: false,
  animation: 'slide_from_right',
  gestureEnabled: true,
} as const;

export const MODAL_SCREEN_OPTIONS = {
  headerShown: false,
  presentation: 'fullScreenModal',
  animation: 'slide_from_bottom',
  gestureEnabled: true,
} as const;

import { useRouter as useExpoRouter, Href } from 'expo-router';

/**
 * Drop-in replacement for expo-router's `useRouter`.
 *
 * Problem: `router.push()` always adds to the navigation stack, so navigating
 * to the same screen multiple times (tapping a listing twice, returning from
 * the camera flow, etc.) creates duplicate entries that the user has to back
 * through.
 *
 * Solution: this hook overrides `push` to call `router.navigate()` instead.
 * In React Navigation (which Expo Router is built on), `navigate` checks whether
 * the destination already exists anywhere in the current stack:
 *   - If it does → pops back to that existing instance (no duplicate).
 *   - If it doesn't → pushes a new instance, identical to `push`.
 *
 * Use `forcePush()` when you intentionally want a new stack entry even if the
 * route already exists (e.g. opening a fresh camera session).
 *
 * Usage — just change the import:
 *   // Before
 *   import { useRouter } from 'expo-router';
 *   // After
 *   import { useRouter } from '@/lib/hooks/use-router';
 */
export const useRouter = () => {
  const router = useExpoRouter();

  return {
    ...router,
    /** Navigate without stacking: pops to existing route or pushes if new. */
    push: (href: Href) => router.navigate(href),
    /** Intentionally push a fresh screen even if the route already exists. */
    forcePush: (href: Href) => router.push(href),
  };
};

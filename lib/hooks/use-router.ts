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

  /**
   * A destination that carries params (a `?id=` query or an object `params`) is a
   * DISTINCT screen per value — a different unit / wizard step / detail page — so
   * it must `push` a fresh instance. `navigate()` matches by route NAME only and
   * would pop back to a stale instance showing the wrong unit's data (the cause
   * of "routes to unexpected pages"). Paramless routes (tab roots, simple pages)
   * keep `navigate()`'s dedupe so we don't stack duplicates.
   */
  const isParamful = (href: Href): boolean => {
    if (typeof href === 'string') return href.includes('?');
    return !!(
      href &&
      typeof href === 'object' &&
      'params' in href &&
      (href as { params?: object }).params &&
      Object.keys((href as { params?: object }).params as object).length > 0
    );
  };

  return {
    ...router,
    /** Params-aware: new instance for param-bearing routes, dedupe for the rest. */
    push: (href: Href) => (isParamful(href) ? router.push(href) : router.navigate(href)),
    /** Intentionally push a fresh screen even if the route already exists. */
    forcePush: (href: Href) => router.push(href),
  };
};

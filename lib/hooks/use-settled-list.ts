import { useEffect, useRef, useState } from 'react';

/**
 * Keeps the last successfully-loaded list on screen while a new fetch is in
 * flight.
 *
 * Why this exists: paginated/filtered queries (e.g. `useInfiniteQuery`) clear
 * their `items` to `[]` the instant the variables change — before the network
 * `fetching` flag flips true. Rendering directly off those `items` causes a
 * one-frame flicker where the list blanks and the empty state flashes while
 * the user is still searching.
 *
 * This hook only swaps in the new `items` on the *falling edge* of `fetching`
 * (i.e. when a fetch genuinely completes), or when data arrives straight from
 * cache without ever toggling `fetching`. During the transient clear it keeps
 * showing the previous results, so the list never blanks mid-search. The empty
 * state therefore only appears once a fetch has actually settled with no rows.
 *
 * @returns `displayed` — the rows to render — and `showInitialSkeleton`, true
 * only during the very first load (never on subsequent searches/refreshes).
 */
export function useSettledList<T>(items: T[], fetching: boolean) {
  const [displayed, setDisplayed] = useState<T[]>(items);
  const hasLoadedRef = useRef(false);
  const prevFetchingRef = useRef(fetching);

  useEffect(() => {
    const justFinished = prevFetchingRef.current && !fetching;
    // Data that resolved from cache without `fetching` ever flipping true.
    const cacheArrived = !fetching && items.length > 0 && displayed.length === 0;

    if (justFinished || cacheArrived) {
      setDisplayed(items);
      if (items.length) hasLoadedRef.current = true;
    }
    prevFetchingRef.current = fetching;
  }, [fetching, items, displayed.length]);

  return {
    displayed,
    showInitialSkeleton: fetching && displayed.length === 0 && !hasLoadedRef.current,
  };
}

import React from 'react';
import { useFocusEffect } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import {
  ListingType,
  PaymentInterval,
  useCreateOrUpdateHostingMutation,
  useHostingQuery,
  useInitiateHostingVerificationMutation,
} from '../services/graphql/generated';
import { useShallow } from 'zustand/react/shallow';

import { useActiveFormHosingStore } from '../stores/hostings';
import { cast } from '../types/utils';
import { removeTypenames } from '../utils/graphql/cleanup';

export const useHostingForm = (id?: string | string[]) => {
  const [{ fetching: mutating }, mutate] = useCreateOrUpdateHostingMutation();
  const [{ fetching: verificationMutating }, verificationMutate] =
    useInitiateHostingVerificationMutation();
  // useShallow: this hook is mounted by every wizard screen kept alive in the
  // router stack — a selector-less subscription made ONE store write re-render
  // ALL of them (the upload-drain freeze amplifier). Actions are stable refs,
  // so shallow-compare only fails when data fields actually change.
  const {
    input,
    verificationInput,
    initiate,
    refreshHosting,
    updateVerificationInput,
    updateInput,
    hosting,
    clear,
  } = useActiveFormHosingStore(
    useShallow((s) => ({
      input: s.input,
      verificationInput: s.verificationInput,
      initiate: s.initiate,
      refreshHosting: s.refreshHosting,
      updateVerificationInput: s.updateVerificationInput,
      updateInput: s.updateInput,
      hosting: s.hosting,
      clear: s.clear,
    })),
  );

  const isFocused = useIsFocused();

  const [{ data, fetching }, refetch] = useHostingQuery({
    pause: !id,
    variables: { hostingId: cast(id) },
  });

  React.useEffect(() => {
    if (id) return;
    clear();
  }, [id, clear]);

  // Only the FOCUSED screen that owns this id may write the shared store.
  //
  // Every wizard screen kept alive in the stack mounts this hook, and hosting
  // mutations invalidate the hosting queries — so a backgrounded parent's
  // onboarding screen would refetch, see the store holding the child, and call
  // initiate(parent), stealing the slot from the listing the user is actually
  // editing. Downstream that made step-8 render AND PUBLISH the parent.
  //
  // The ownership check also prevents the half-write that left
  // `{ input: parent, hosting: child }`: a screen whose data isn't its own
  // route id never touches the store at all.
  React.useEffect(() => {
    if (!data) return;
    if (!isFocused) return;
    if (cast<string>(id) !== data.hosting.id) return;
    if (!input.id || input.id !== data.hosting.id) {
      initiate(data.hosting);
    } else {
      refreshHosting(data.hosting);
    }
  }, [data, isFocused, id]);

  // Re-sync the shared form store to THIS screen's hosting whenever it regains
  // focus. The shared store holds one hosting at a time, so after editing a unit
  // and backing out to its parent's onboarding, the store would still hold the
  // unit — the data-keyed effect above doesn't re-fire on a plain refocus when the
  // (cached) query data is unchanged. This restores the focused screen's hosting.
  useFocusEffect(
    React.useCallback(() => {
      if (!data) return;
      if (useActiveFormHosingStore.getState().input.id !== data.hosting.id) {
        initiate(data.hosting);
      }
    }, [data, initiate]),
  );

  const safeMutate = React.useCallback(
    (variables: Parameters<typeof mutate>[0]) => {
      if (variables.input.listingType === ListingType.Sale) {
        variables.input.paymentInterval = PaymentInterval.OneTimePayment;
      }
      return mutate({
        ...variables,
        input: removeTypenames(variables.input) as typeof variables.input,
      });
    },
    [mutate],
  );

  // Stable identity (urql's reexecute is memoized) so consumers can safely use
  // it in effect deps without the effect re-running on every render.
  const refetchNetwork = React.useCallback(
    () => refetch({ requestPolicy: 'network-only' }),
    [refetch],
  );

  return {
    input,
    verificationInput,
    updateVerificationInput,
    updateInput,
    clearInput: clear,
    mutate: safeMutate,
    verificationMutating,
    verificationMutate,
    mutating,
    fetching,
    hosting,
    refetch: refetchNetwork,
  };
};

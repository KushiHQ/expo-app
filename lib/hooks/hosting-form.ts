import React from "react";
import { useFocusEffect } from "expo-router";
import {
  ListingType,
  PaymentInterval,
  useCreateOrUpdateHostingMutation,
  useHostingQuery,
  useInitiateHostingVerificationMutation,
} from "../services/graphql/generated";
import { useActiveFormHosingStore } from "../stores/hostings";
import { cast } from "../types/utils";
import { removeTypenames } from "../utils/graphql/cleanup";

export const useHostingForm = (id?: string | string[]) => {
  const [{ fetching: mutating }, mutate] = useCreateOrUpdateHostingMutation();
  const [{ fetching: verificationMutating }, verificationMutate] =
    useInitiateHostingVerificationMutation();
  const {
    input,
    verificationInput,
    initiate,
    refreshHosting,
    updateVerificationInput,
    updateInput,
    hosting,
    clear,
  } = useActiveFormHosingStore();

  const [{ data, fetching }, refetch] = useHostingQuery({
    pause: !id,
    variables: { hostingId: cast(id) },
  });

  React.useEffect(() => {
    if (id) return;
    clear();
  }, [id, clear]);

  React.useEffect(() => {
    if (!data) return;
    if (!input.id || input.id !== data.hosting.id) {
      initiate(data.hosting);
    } else {
      refreshHosting(data.hosting);
    }
  }, [data]);

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
    refetch: () => refetch({ requestPolicy: "network-only" }),
  };
};

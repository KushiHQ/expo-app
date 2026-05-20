import React from "react";
import {
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
    if (!data) return;
    if (!input.id || input.id !== data.hosting.id) {
      initiate(data.hosting);
    } else {
      refreshHosting(data.hosting);
    }
  }, [data]);

  const safeMutate = React.useCallback(
    (variables: Parameters<typeof mutate>[0]) =>
      mutate({
        ...variables,
        input: removeTypenames(variables.input) as typeof variables.input,
      }),
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

import {
  SubClause,
  TenancyTemplate,
  TenancyTemplateInput,
} from "@/lib/services/graphql/generated";
import { cast } from "@/lib/types/utils";

export function cleanupAgreementTemplateInput(
  agreement: TenancyTemplate | TenancyTemplateInput,
): TenancyTemplateInput {
  const toUpdate = { sections: [...agreement.sections] };
  const secs = toUpdate.sections.map((sec) => {
    let updated = { ...sec };
    if (cast<TenancyTemplate["sections"][number]>(sec)["__typename"]) {
      const { __typename, ...rest } =
        cast<TenancyTemplate["sections"][number]>(sec);
      updated = rest;
    }
    const refinedSubClauses = updated.subClauses.map((clause) => {
      if (cast<SubClause>(clause)["__typename"]) {
        const { __typename, ...rest } = cast<SubClause>(clause);
        const { requiredVariables, providedValues, ...restVals } = rest;

        return {
          ...restVals,
          requiredVariables: requiredVariables.map(({ __typename, ...v }) => v),
          providedValues: providedValues.map(({ __typename, ...v }) => v),
        };
      } else {
        return clause;
      }
    });

    updated["subClauses"] = refinedSubClauses;
    return updated;
  });

  return { sections: secs };
}

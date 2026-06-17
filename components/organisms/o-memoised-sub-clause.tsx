import { HostingQuery, SubClause, SubClauseValueInput } from '@/lib/services/graphql/generated';
import React from 'react';
import Collapsible from '../molecules/m-collapsible';
import { View } from 'react-native';
import TenancyAgreementVariableText from '../molecules/m-tenancy-aggreement-variable-text';
import MemoizedVariableInput from '../molecules/m-momoised-variable-input';

const MemoizedSubClause = React.memo(
  ({
    clause,
    sectionIndex,
    clauseIndex,
    hosting,
    onUpdateVariable,
  }: {
    clause: SubClause;
    sectionIndex: number;
    clauseIndex: number;
    hosting: HostingQuery['hosting'];
    onUpdateVariable: (
      sectionIndex: number,
      subClauseIndex: number,
      variable: SubClauseValueInput,
    ) => void;
  }) => {
    // Clauses with variable fields go RED until every field is filled, then
    // GREEN — so unfinished entries are obvious at a glance. Non-variable
    // removable clauses keep the neutral accent; fixed ones render muted.
    const hasVariables = clause.requiredVariables.length > 0;
    const allVariablesFilled =
      hasVariables &&
      clause.requiredVariables.every((variable) => {
        const value = clause.providedValues.find((pv) => pv.key === variable.name)?.value;
        return !!value && value.trim().length > 0;
      });
    const tint = hasVariables
      ? allVariablesFilled
        ? 'success'
        : 'error'
      : !clause.isMandatory
        ? 'primary'
        : 'shade';
    return (
      <Collapsible
        title={clause.title}
        description={clause.description}
        key={clause.id}
        tint={tint}
      >
        <View className="mt-4">
          {clause.content && (
            <TenancyAgreementVariableText
              hosting={hosting}
              providedValues={clause.providedValues}
              text={clause.content}
            />
          )}
        </View>
        {clause.requiredVariables.length > 0 && (
          <View className="mt-6">
            {clause.requiredVariables.map((variable, vIdx) => (
              <MemoizedVariableInput
                key={variable.name}
                variable={variable}
                index={vIdx}
                providedValue={clause.providedValues.find((v) => v.key === variable.name)?.value}
                onUpdate={(v) =>
                  onUpdateVariable(sectionIndex, clauseIndex, {
                    key: variable.name,
                    value: v,
                  })
                }
              />
            ))}
          </View>
        )}
      </Collapsible>
    );
  },
);

MemoizedSubClause.displayName = 'MemoizedSubClause';

export default MemoizedSubClause;

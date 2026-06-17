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
    // Clauses with variable fields to fill (or non-mandatory, removable ones)
    // are the actionable ones — tint them so the user can tell them apart from
    // the fixed, non-editable clauses (which render muted). Clause text itself
    // is never editable and there are no custom clauses by design.
    const isEditable = clause.requiredVariables.length > 0 || !clause.isMandatory;
    return (
      <Collapsible
        title={clause.title}
        description={clause.description}
        key={clause.id}
        tint={isEditable ? 'primary' : 'shade'}
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

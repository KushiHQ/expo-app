import React from 'react';
import FloatingLabelInput from '../atoms/a-floating-label-input';
import { VariableType } from '@/lib/services/graphql/generated';
import { capitalize } from '@/lib/utils/text';

const MemoizedVariableInput = React.memo(
  ({
    variable,
    providedValue,
    onUpdate,
  }: {
    variable: any;
    index: number;
    providedValue: string | undefined;
    onUpdate: (v: string) => void;
  }) => {
    return (
      <FloatingLabelInput
        focused
        value={
          providedValue
            ? variable.type === VariableType.Number
              ? Number(providedValue.replaceAll(',', '')).toLocaleString()
              : providedValue
            : undefined
        }
        onChangeText={onUpdate}
        placeholder={variable.type === VariableType.Number ? '0.00' : 'Enter value'}
        keyboardType={variable.type === VariableType.Number ? 'numeric' : 'default'}
        label={capitalize(variable.name.replaceAll('_', ' ').toLowerCase(), true)}
      />
    );
  },
);

MemoizedVariableInput.displayName = 'MemoizedVariableInput';

export default MemoizedVariableInput;

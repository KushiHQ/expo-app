import React from 'react';
import { Empty } from '../k';
import { capitalize } from '@/lib/utils/text';

type Props = {
  message: string;
  buttonTitle?: string;
  onButtonPress?: () => void;
};

const EmptyList: React.FC<Props> = ({ message, buttonTitle, onButtonPress }) => (
  <Empty eyebrow="Nothing yet" title={capitalize(message)} body="When there’s something here, you’ll see it straight away." action={buttonTitle} onAction={onButtonPress} />
);

export default EmptyList;

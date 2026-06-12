import { CustomSvgProps } from '@/lib/types/svgType';
import React from 'react';
import Svg, { Path } from 'react-native-svg';

export const FluentDelete24Regular: React.FC<CustomSvgProps> = (props) => {
  return (
    <Svg
      width={props.width ?? props.size ?? 24}
      height={props.height ?? props.size ?? 24}
      viewBox="0 0 24 24"
      {...props}
    >
      <Path
        fill="currentColor"
        d="M10 5h4a2 2 0 1 0-4 0M8.5 5a3.5 3.5 0 1 1 7 0h5.75a.75.75 0 0 1 0 1.5h-1.32l-1.17 12.111A3.75 3.75 0 0 1 15.026 22H8.974a3.75 3.75 0 0 1-3.733-3.389L4.07 6.5H2.75a.75.75 0 0 1 0-1.5zm2 4.75a.75.75 0 0 0-1.5 0v7.5a.75.75 0 0 0 1.5 0zM14.25 9a.75.75 0 0 1 .75.75v7.5a.75.75 0 0 1-1.5 0v-7.5a.75.75 0 0 1 .75-.75m-7.516 9.467a2.25 2.25 0 0 0 2.24 2.033h6.052a2.25 2.25 0 0 0 2.24-2.033L18.424 6.5H5.576z"
      ></Path>
    </Svg>
  );
};

export const ClearAllRounded: React.FC<CustomSvgProps> = (props) => {
  return (
    <Svg
      width={props.width ?? props.size ?? 24}
      height={props.height ?? props.size ?? 24}
      viewBox="0 0 24 24"
      {...props}
    >
      <Path
        fill="currentColor"
        d="M4 17q-.425 0-.712-.288T3 16t.288-.712T4 15h12q.425 0 .713.288T17 16t-.288.713T16 17zm2-4q-.425 0-.712-.288T5 12t.288-.712T6 11h12q.425 0 .713.288T19 12t-.288.713T18 13zm2-4q-.425 0-.712-.288T7 8t.288-.712T8 7h12q.425 0 .713.288T21 8t-.288.713T20 9z"
      ></Path>
    </Svg>
  );
};

export const Reset: React.FC<CustomSvgProps> = (props) => {
  return (
    <Svg
      width={props.width ?? props.size ?? 24}
      height={props.height ?? props.size ?? 24}
      viewBox="0 0 2048 2048"
      {...props}
    >
      <Path
        fill="currentColor"
        d="M1920 1216q0 115-30 221t-84 198t-130 169t-168 130t-199 84t-221 30q-115 0-221-30t-198-84t-169-130t-130-168t-84-199t-30-221v-64h128v64q0 97 25 187t71 168t110 142t143 111t168 71t187 25q97 0 187-25t168-71t142-110t111-143t71-168t25-187q0-97-25-187t-71-168t-110-142t-143-111t-168-71t-187-25H250l291 291l-90 90L6 448L451 3l90 90l-291 291h838q115 0 221 30t198 84t169 130t130 168t84 199t30 221"
      ></Path>
    </Svg>
  );
};

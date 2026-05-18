import React from 'react';
import { View } from 'react-native';
import { BarcodeCreatorView, BarcodeFormat } from 'react-native-barcode-creator';

type Props = {
  value: string;
  format?: keyof typeof BarcodeFormat;
  width?: number;
  height?: number;
  maxWidth?: number;
};

const ThemedBarcode: React.FC<Props> = ({
  value,
  format = 'CODE128',
  width = 300,
  height = 85,
}) => {
  return (
    <View
      className="items-center justify-center bg-white p-4"
      style={{ borderRadius: 12, overflow: 'hidden' }}
    >
      <BarcodeCreatorView
        value={value}
        background={'#FFFFFF'}
        foregroundColor={'#000000'}
        format={BarcodeFormat[format]}
        style={{
          height,
          width,
        }}
      />
    </View>
  );
};

export default ThemedBarcode;

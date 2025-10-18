import React from "react";
import { Pressable } from "react-native";
import * as Clipboard from "expo-clipboard";
import { TablerCopyCheckFilled } from "../icons/i-copy";
import { CustomSvgProps } from "@/lib/types/svgType";

type Props = CustomSvgProps & {
  text: string;
};

const CopyButton: React.FC<Props> = ({ text, ...props }) => {
  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(text);
  };

  return (
    <Pressable onPress={copyToClipboard}>
      <TablerCopyCheckFilled {...props} />
    </Pressable>
  );
};

export default CopyButton;

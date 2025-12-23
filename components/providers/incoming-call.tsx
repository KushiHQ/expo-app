import { useIncomingCallListener } from "@/lib/hooks/call";
import React from "react";

interface Props {
  children: React.ReactNode;
}

const IncomingCallProvider: React.FC<Props> = ({ children }) => {
  useIncomingCallListener();

  return children;
};

export default IncomingCallProvider;

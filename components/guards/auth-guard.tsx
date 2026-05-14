import React from "react";
import { useUser } from "@/lib/hooks/user";
import { Redirect, usePathname, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import LoadingModal from "../atoms/a-loading-modal";

interface Props {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<Props> = ({ children }) => {
  const { user, setReturnUrl } = useUser();
  const pathname = usePathname();
  const params = useLocalSearchParams();

  if (user?.user?.id) {
    return <>{children}</>;
  }

  // Construct the full URL to return to
  const queryString = Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join("&");

  const fullUrl = queryString ? `${pathname}?${queryString}` : pathname;

  return (
    <AuthRedirector returnUrl={fullUrl} setReturnUrl={setReturnUrl}>
      <View className="flex-1 items-center justify-center">
        <LoadingModal visible={true} />
      </View>
    </AuthRedirector>
  );
};

const AuthRedirector: React.FC<{
  returnUrl: string;
  setReturnUrl: (url: string | null) => void;
  children: React.ReactNode;
}> = ({ returnUrl, setReturnUrl, children }) => {
  React.useEffect(() => {
    setReturnUrl(returnUrl);
  }, [returnUrl, setReturnUrl]);

  return <Redirect href="/auth" />;
};

export default AuthGuard;

import React from 'react';
import { useUser } from '@/lib/hooks/user';
import { useUserStore } from '@/lib/stores/users';
import { Redirect, usePathname, useLocalSearchParams } from 'expo-router';
import SplashLoading from '../atoms/a-splash-loading';

interface Props {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<Props> = ({ children }) => {
  const { user, setReturnUrl } = useUser();
  const pathname = usePathname();
  const params = useLocalSearchParams();

  // The persisted user store hydrates from AsyncStorage asynchronously. Until it
  // has, `user` is the empty default — so we must NOT decide auth yet, or we'd
  // wrongly bounce a logged-in user to /auth (and on Android the timing made it
  // paint a blank screen). Show the branded splash until hydration resolves,
  // then decide. The redirect is declarative (<Redirect>) so it fires reliably
  // on both platforms.
  const [hydrated, setHydrated] = React.useState(() => useUserStore.persist.hasHydrated());
  React.useEffect(() => {
    if (hydrated) return;
    const unsub = useUserStore.persist.onFinishHydration(() => setHydrated(true));
    if (useUserStore.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, [hydrated]);

  if (!hydrated) {
    return <SplashLoading />;
  }

  if (user?.user?.id) {
    return <>{children}</>;
  }

  // Construct the full URL to return to
  const queryString = Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join('&');

  const fullUrl = queryString ? `${pathname}?${queryString}` : pathname;

  return (
    <AuthRedirector returnUrl={fullUrl} setReturnUrl={setReturnUrl}>
      <SplashLoading />
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

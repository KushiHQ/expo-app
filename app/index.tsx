import ThemedView from '@/components/atoms/a-themed-view';
import Logo from '../assets/vectors/logo.svg';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LoadingDots from '@/components/atoms/a-loading-dots';
import React from 'react';
import { useRouter } from 'expo-router';
import { useRefreshTokenMutation } from '@/lib/services/graphql/generated';
import { getAuthTokens, saveAuthTokens } from '@/lib/utils/auth';
import { useUser } from '@/lib/hooks/user';
import { useUserStore } from '@/lib/stores/users';
import { UserType } from '@/lib/types/users';

export default function HomeScreen() {
  const { user, updateUser } = useUser();
  const [, refreshToken] = useRefreshTokenMutation();
  const router = useRouter();

  // Zustand AsyncStorage hydration is async — on first render the store is empty.
  // We must wait for rehydration before making any navigation decisions, otherwise
  // user.email is always undefined on mount and the app redirects to onboarding.
  const [hydrated, setHydrated] = React.useState(() => useUserStore.persist.hasHydrated());

  React.useEffect(() => {
    if (hydrated) return;
    const unsub = useUserStore.persist.onFinishHydration(() => setHydrated(true));
    // Guard against the case where hydration completed between the useState init and this effect
    if (useUserStore.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, [hydrated]);

  React.useEffect(() => {
    if (!hydrated) return;

    const timeoutId = setTimeout(() => {
      router.replace('/auth/sign-in');
    }, 30000);

    const handleRefreshToken = async () => {
      const tokens = await getAuthTokens();
      if (!tokens?.refresh) {
        return null;
      }
      return refreshToken({ input: { refreshToken: tokens.refresh } });
    };

    const initializeApp = async () => {
      try {
        if (!user?.email) {
          clearTimeout(timeoutId);
          router.replace('/onboarding');
          return;
        }

        const res = await handleRefreshToken();
        clearTimeout(timeoutId);

        if (!res || res?.error) {
          router.replace('/auth/sign-in');
          return;
        }

        if (res?.data?.refreshToken.data) {
          const data = res.data.refreshToken.data;
          await saveAuthTokens({
            access: data.token,
            refresh: data.refreshToken,
          });

          updateUser({
            user: data.user,
            email: data.user.email,
          });

          if (user.userType === UserType.Host) {
            router.replace('/host/analytics');
          } else {
            router.replace('/guest/home');
          }
        }
      } catch (error) {
        console.error('Initialization failed:', error);
        clearTimeout(timeoutId);
        router.replace('/auth/sign-in');
      }
    };

    initializeApp();

    return () => clearTimeout(timeoutId);
  }, [hydrated, user?.email, user?.userType, refreshToken, router, updateUser]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThemedView style={styles.container}>
        <Logo />
        <LoadingDots styles={styles.loader} />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  loader: {
    position: 'absolute',
    bottom: 40,
  },
});

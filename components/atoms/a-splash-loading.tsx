import React from 'react';
import { View } from 'react-native';
import Logo from '@/assets/vectors/logo.svg';
import LoadingDots from './a-loading-dots';

/**
 * Full-screen branded loading view that mirrors the native splash (logo on the
 * near-black brand background). Used as the AuthGuard's loading/redirect state
 * so guarded routes never flash a blank screen while auth state resolves.
 *
 * Note: the *native* splash can't be re-shown once hidden, so this JS view is
 * the in-app equivalent for post-launch transitions.
 */
export default function SplashLoading() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#050505',
      }}
    >
      <Logo width={180} height={64} />
      <View style={{ marginTop: 28 }}>
        <LoadingDots size={8} gap={10} />
      </View>
    </View>
  );
}

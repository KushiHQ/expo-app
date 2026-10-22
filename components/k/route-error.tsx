import { useEffect } from 'react';
import { View } from 'react-native';
import { router, type ErrorBoundaryProps } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Sentry from '@sentry/react-native';
import { TriangleAlert } from 'lucide-react-native';
import { color, gutter } from '@/lib/k/theme';
import { Button } from './button';
import { KText } from './text';

/**
 * Shown by expo-router when a screen throws while rendering. Without it React
 * unmounts the whole app: a blank grey screen on Android and a hard crash on
 * iOS. Export it from a route or layout as `ErrorBoundary`.
 */
export function RouteError({ error, retry, title = 'Something went wrong on this screen', home = '/' }: ErrorBoundaryProps & { title?: string; home?: string }) {
	const insets = useSafeAreaInsets();
	useEffect(() => {
		Sentry.captureException(error, { tags: { area: 'route-error-boundary' } });
	}, [error]);

	return (
		<View style={{ flex: 1, backgroundColor: color.bg, justifyContent: 'center', paddingHorizontal: gutter, paddingTop: insets.top, paddingBottom: insets.bottom, gap: 18 }}>
			<View style={{ alignItems: 'center', gap: 10 }}>
				<TriangleAlert size={30} color={color.amber} />
				<KText v="title" center>
					{title}
				</KText>
				<KText v="small" center style={{ maxWidth: 340 }}>
					Your work is saved. Try again, and if it keeps happening, go back and reopen it.
				</KText>
			</View>
			<View style={{ gap: 10, alignSelf: 'stretch', maxWidth: 380, width: '100%', marginHorizontal: 'auto' } as object}>
				<Button title="Try again" block onPress={retry} />
				<Button title="Go back" variant="ghost" block onPress={() => (router.canGoBack() ? router.back() : router.replace(home as never))} />
			</View>
		</View>
	);
}

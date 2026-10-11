import { useEffect } from 'react';
import { Tabs, router } from 'expo-router';
import { Compass, Heart, Home, MessageCircle, UserRound } from 'lucide-react-native';
import { KTabBar } from '@/components/k/tab-bar';
import { hasSeenWelcome } from '@/lib/k/session';
import { useUserStore } from '@/lib/stores/users';
import { UserType } from '@/lib/types/users';

// Hosts who left the app in hosting mode reopen it there (once per launch).
let routedOnLaunch = false;

/** Guest mode: Explore · Saved · Homes · Inbox · You. Signed-out tabs show a sign-in prompt in place. */
export default function GuestTabs() {
	useEffect(() => {
		if (!routedOnLaunch) {
			routedOnLaunch = true;
			const st = useUserStore.getState().user;
			if (st.user?.id && st.userType === UserType.Host) {
				router.replace('/host');
				return;
			}
		}
		hasSeenWelcome().then((seen) => {
			if (!seen) router.push('/welcome');
		});
	}, []);

	return (
		<Tabs screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: '#07080B' } }} tabBar={(p) => <KTabBar {...p} />}>
			<Tabs.Screen name="index" options={{ title: 'Explore', tabBarIcon: ({ color }) => <Compass size={22} color={color} /> }} />
			<Tabs.Screen name="saved" options={{ title: 'Saved', tabBarIcon: ({ color }) => <Heart size={22} color={color} /> }} />
			<Tabs.Screen name="trips" options={{ title: 'Homes', tabBarIcon: ({ color }) => <Home size={22} color={color} /> }} />
			<Tabs.Screen name="inbox" options={{ title: 'Inbox', tabBarIcon: ({ color }) => <MessageCircle size={22} color={color} /> }} />
			<Tabs.Screen name="you" options={{ title: 'You', tabBarIcon: ({ color }) => <UserRound size={22} color={color} /> }} />
		</Tabs>
	);
}

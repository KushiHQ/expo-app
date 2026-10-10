import { Tabs } from 'expo-router';
import { Building2, Inbox as InboxIcon, LayoutDashboard, MessageCircle, UserRound } from 'lucide-react-native';
import AuthGuard from '@/components/guards/auth-guard';
import { KTabBar } from '@/components/k/tab-bar';

/** Hosting mode: Today · Listings · Applications · Inbox · You. */
export default function HostTabs() {
	return (
		<AuthGuard>
			<Tabs screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: '#07080B' } }} tabBar={(p) => <KTabBar {...p} />}>
				<Tabs.Screen name="index" options={{ title: 'Today', tabBarIcon: ({ color }) => <LayoutDashboard size={22} color={color} /> }} />
				<Tabs.Screen name="listings" options={{ title: 'Listings', tabBarIcon: ({ color }) => <Building2 size={22} color={color} /> }} />
				<Tabs.Screen name="applications" options={{ title: 'Applications', tabBarIcon: ({ color }) => <InboxIcon size={22} color={color} /> }} />
				<Tabs.Screen name="inbox" options={{ title: 'Inbox', tabBarIcon: ({ color }) => <MessageCircle size={22} color={color} /> }} />
				<Tabs.Screen name="you" options={{ title: 'You', tabBarIcon: ({ color }) => <UserRound size={22} color={color} /> }} />
			</Tabs>
		</AuthGuard>
	);
}

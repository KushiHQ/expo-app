import { usePathname } from 'expo-router';
import { requireSignIn } from '@/lib/k/session';
import { Empty } from './feedback';

/** Shown in place of a signed-in-only tab when nobody is signed in. */
export function SignedOut({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
	const path = usePathname();
	return <Empty eyebrow={eyebrow} title={title} body={body} action="Sign in or create an account" onAction={() => requireSignIn(path)} />;
}

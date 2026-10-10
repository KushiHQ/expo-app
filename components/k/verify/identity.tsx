import { useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { color } from '@/lib/k/theme';
import { useUserStore } from '@/lib/stores/users';
import { KText } from '../text';
import { Waypoint } from '../surface';
import { Selfie } from './selfie';
import { NinStep } from './nin-phone';

/** Selfie → NIN, skipping whatever is already done. Calls onVerified when NIN passes. */
export function IdentityCheck({ onVerified }: { onVerified: () => void }) {
	const kyc = useUserStore((s) => s.user.user?.kyc);
	const [step, setStep] = useState<'selfie' | 'nin'>(kyc?.image ? 'nin' : 'selfie');
	const steps = [
		{ key: 'selfie', label: 'Selfie' },
		{ key: 'nin', label: 'NIN' }
	] as const;
	return (
		<View style={{ gap: 18 }}>
			<View style={{ flexDirection: 'row', gap: 18 }}>
				{steps.map((s, i) => {
					const done = steps.findIndex((x) => x.key === step) > i;
					const on = s.key === step;
					return (
						<View key={s.key} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
							<Waypoint done={done} active={on} />
							<KText v="label" style={{ color: on || done ? color.fg : color.muted }}>
								{i + 1} · {s.label}
							</KText>
						</View>
					);
				})}
			</View>
			<Animated.View key={step} entering={FadeIn.duration(250)}>
				{step === 'selfie' ? <Selfie onDone={() => setStep('nin')} /> : <NinStep onDone={onVerified} />}
			</Animated.View>
		</View>
	);
}

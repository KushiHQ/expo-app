import { forwardRef, useState } from 'react';
import { Pressable as RNPressable, type GestureResponderEvent, type PressableProps, type View } from 'react-native';

/**
 * Pressable that accepts `style={({ pressed }) => …}` on native.
 * NativeWind's JSX interop drops function styles on iOS/Android (web is fine), so the
 * pressed state is tracked here and a plain style is handed down instead.
 */
export const Pressable = forwardRef<View, PressableProps>(function Pressable({ style, onPressIn, onPressOut, ...rest }, ref) {
	const [pressed, setPressed] = useState(false);
	if (typeof style !== 'function') return <RNPressable ref={ref} style={style} onPressIn={onPressIn} onPressOut={onPressOut} {...rest} />;
	return (
		<RNPressable
			ref={ref}
			{...rest}
			style={style({ pressed, hovered: false })}
			onPressIn={(e: GestureResponderEvent) => {
				setPressed(true);
				onPressIn?.(e);
			}}
			onPressOut={(e: GestureResponderEvent) => {
				setPressed(false);
				onPressOut?.(e);
			}}
		/>
	);
});

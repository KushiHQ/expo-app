import { useEffect, useState } from 'react';
import { Image as RNImage, Modal, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, type SharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RotateCw, Undo2 } from 'lucide-react-native';
import { color, font, gutter, radius } from '@/lib/k/theme';
import { Button } from './button';
import { KText } from './text';
import { Pressable } from './pressable';
import { Spinner } from './surface';

type Size = { width: number; height: number };
type Aspect = { label: string; ratio: number | null };

const ASPECTS: Aspect[] = [
	{ label: 'Free', ratio: null },
	{ label: '4:3', ratio: 4 / 3 },
	{ label: 'Square', ratio: 1 },
	{ label: '16:9', ratio: 16 / 9 }
];
const MIN = 64;
const HANDLE = 28;

/**
 * Kushi's photo editor: crop (free or fixed shape) and rotate, in the app's own
 * look. Replaces the native cropper, which looked like a different app.
 * `onDone` gets a new local file; the original is left untouched.
 */
export function PhotoEditor({ uri, open, onCancel, onDone }: { uri: string | null; open: boolean; onCancel: () => void; onDone: (edited: string) => void }) {
	const insets = useSafeAreaInsets();
	const win = useWindowDimensions();
	const [src, setSrc] = useState<string | null>(null);
	const [size, setSize] = useState<Size | null>(null);
	const [aspect, setAspect] = useState<Aspect>(ASPECTS[0]);
	const [busy, setBusy] = useState(false);

	// Stage: the area the photo is fitted into, between the top and bottom bars.
	const stageW = win.width - gutter * 2;
	const stageH = win.height - insets.top - insets.bottom - 200;
	const scale = size ? Math.min(stageW / size.width, stageH / size.height) : 1;
	const dispW = size ? size.width * scale : 0;
	const dispH = size ? size.height * scale : 0;

	const x = useSharedValue(0);
	const y = useSharedValue(0);
	const w = useSharedValue(0);
	const h = useSharedValue(0);
	const bounds = useSharedValue({ w: 0, h: 0, ratio: 0 });

	useEffect(() => {
		if (!open || !uri) return;
		setSrc(uri);
		setAspect(ASPECTS[0]);
		RNImage.getSize(uri, (width, height) => setSize({ width, height }), () => setSize(null));
	}, [open, uri]);

	// Reset the crop box to the largest box of the chosen shape, centred.
	function fit(ratio: number | null) {
		let bw = dispW;
		let bh = dispH;
		if (ratio) {
			if (dispW / dispH > ratio) bw = dispH * ratio;
			else bh = dispW / ratio;
		}
		x.value = (dispW - bw) / 2;
		y.value = (dispH - bh) / 2;
		w.value = bw;
		h.value = bh;
		bounds.value = { w: dispW, h: dispH, ratio: ratio ?? 0 };
	}
	useEffect(() => {
		if (size) fit(aspect.ratio);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [size, dispW, dispH]);

	async function rotate() {
		if (!src || busy) return;
		setBusy(true);
		try {
			const r = await manipulateAsync(src, [{ rotate: 90 }], { compress: 1, format: SaveFormat.JPEG });
			setSrc(r.uri);
			setSize({ width: r.width, height: r.height });
		} finally {
			setBusy(false);
		}
	}

	async function done() {
		if (!src || !size || busy) return;
		setBusy(true);
		try {
			const crop = {
				originX: Math.max(0, Math.round(x.value / scale)),
				originY: Math.max(0, Math.round(y.value / scale)),
				width: Math.min(size.width, Math.round(w.value / scale)),
				height: Math.min(size.height, Math.round(h.value / scale))
			};
			const whole = crop.originX === 0 && crop.originY === 0 && crop.width >= size.width - 1 && crop.height >= size.height - 1;
			const r = await manipulateAsync(src, whole ? [] : [{ crop }], { compress: 0.92, format: SaveFormat.JPEG });
			onDone(r.uri);
		} finally {
			setBusy(false);
		}
	}

	// Move the whole box.
	const sx = useSharedValue(0);
	const sy = useSharedValue(0);
	const move = Gesture.Pan()
		.onStart(() => {
			sx.value = x.value;
			sy.value = y.value;
		})
		.onUpdate((e) => {
			x.value = Math.min(Math.max(0, sx.value + e.translationX), bounds.value.w - w.value);
			y.value = Math.min(Math.max(0, sy.value + e.translationY), bounds.value.h - h.value);
		});

	const boxStyle = useAnimatedStyle(() => ({ left: x.value, top: y.value, width: w.value, height: h.value }));
	// Dim everything outside the box with four panels.
	const shadeTop = useAnimatedStyle(() => ({ left: 0, right: 0, top: 0, height: y.value }));
	const shadeBottom = useAnimatedStyle(() => ({ left: 0, right: 0, top: y.value + h.value, bottom: 0 }));
	const shadeLeft = useAnimatedStyle(() => ({ left: 0, width: x.value, top: y.value, height: h.value }));
	const shadeRight = useAnimatedStyle(() => ({ left: x.value + w.value, right: 0, top: y.value, height: h.value }));

	return (
		<Modal visible={open} animationType="fade" statusBarTranslucent onRequestClose={onCancel} supportedOrientations={['portrait', 'landscape']}>
			<GestureHandlerRootView style={[s.fill, { paddingTop: insets.top + 8, paddingBottom: Math.max(insets.bottom, 12) }]}>
				<View style={s.top}>
					<Button title="Cancel" variant="ghost" size="sm" onPress={onCancel} />
					<KText v="label">Edit photo</KText>
					<Button title="Done" size="sm" loading={busy} onPress={done} />
				</View>

				<View style={s.stage}>
					{src && size ? (
						<View style={{ width: dispW, height: dispH }}>
							<Image source={{ uri: src }} style={StyleSheet.absoluteFill} contentFit="fill" />
							<Animated.View pointerEvents="none" style={[s.shade, shadeTop]} />
							<Animated.View pointerEvents="none" style={[s.shade, shadeBottom]} />
							<Animated.View pointerEvents="none" style={[s.shade, shadeLeft]} />
							<Animated.View pointerEvents="none" style={[s.shade, shadeRight]} />
							<GestureDetector gesture={move}>
								<Animated.View style={[s.box, boxStyle]}>
									<View pointerEvents="none" style={[s.third, { left: '33.33%', top: 0, bottom: 0, width: StyleSheet.hairlineWidth }]} />
									<View pointerEvents="none" style={[s.third, { left: '66.66%', top: 0, bottom: 0, width: StyleSheet.hairlineWidth }]} />
									<View pointerEvents="none" style={[s.third, { top: '33.33%', left: 0, right: 0, height: StyleSheet.hairlineWidth }]} />
									<View pointerEvents="none" style={[s.third, { top: '66.66%', left: 0, right: 0, height: StyleSheet.hairlineWidth }]} />
									<Corner corner="tl" x={x} y={y} w={w} h={h} bounds={bounds} />
									<Corner corner="tr" x={x} y={y} w={w} h={h} bounds={bounds} />
									<Corner corner="bl" x={x} y={y} w={w} h={h} bounds={bounds} />
									<Corner corner="br" x={x} y={y} w={w} h={h} bounds={bounds} />
								</Animated.View>
							</GestureDetector>
						</View>
					) : (
						<Spinner />
					)}
				</View>

				<View style={s.tools}>
					<View style={s.aspects}>
						{ASPECTS.map((a) => {
							const on = a.label === aspect.label;
							return (
								<Pressable
									key={a.label}
									accessibilityRole="button"
									accessibilityState={{ selected: on }}
									onPress={() => {
										setAspect(a);
										fit(a.ratio);
									}}
									style={[s.aspect, on && s.aspectOn]}
								>
									<KText style={[s.aspectText, on && { color: color.amber }]}>{a.label}</KText>
								</Pressable>
							);
						})}
					</View>
					<View style={{ flexDirection: 'row', gap: 10, justifyContent: 'center' }}>
						<Button title="Rotate" variant="ghost" size="sm" icon={<RotateCw size={15} color={color.fg} />} onPress={rotate} disabled={busy} />
						<Button
							title="Reset"
							variant="quiet"
							size="sm"
							icon={<Undo2 size={15} color={color.fg2} />}
							disabled={busy}
							onPress={() => {
								if (uri && src !== uri) {
									setSrc(uri);
									RNImage.getSize(uri, (width, height) => setSize({ width, height }));
								}
								setAspect(ASPECTS[0]);
								fit(null);
							}}
						/>
					</View>
				</View>
			</GestureHandlerRootView>
		</Modal>
	);
}

/** A draggable corner handle. Keeps the box inside the photo, above MIN, and in shape when a ratio is set. */
function Corner({ corner, x, y, w, h, bounds }: { corner: 'tl' | 'tr' | 'bl' | 'br'; x: SharedValue<number>; y: SharedValue<number>; w: SharedValue<number>; h: SharedValue<number>; bounds: SharedValue<{ w: number; h: number; ratio: number }> }) {
	const start = useSharedValue({ x: 0, y: 0, w: 0, h: 0 });
	const pan = Gesture.Pan()
		.onStart(() => {
			start.value = { x: x.value, y: y.value, w: w.value, h: h.value };
		})
		.onUpdate((e) => {
			const b = bounds.value;
			const st = start.value;
			const left = corner === 'tl' || corner === 'bl';
			const topEdge = corner === 'tl' || corner === 'tr';
			// Fixed opposite corner.
			const ax = left ? st.x + st.w : st.x;
			const ay = topEdge ? st.y + st.h : st.y;
			// Proposed width/height from the drag, clamped to the photo.
			let nw = left ? Math.min(ax, Math.max(MIN, st.w - e.translationX)) : Math.min(b.w - ax, Math.max(MIN, st.w + e.translationX));
			let nh = topEdge ? Math.min(ay, Math.max(MIN, st.h - e.translationY)) : Math.min(b.h - ay, Math.max(MIN, st.h + e.translationY));
			if (b.ratio) {
				// Follow the larger change, then shrink to fit the room available.
				const maxW = left ? ax : b.w - ax;
				const maxH = topEdge ? ay : b.h - ay;
				if (nw / nh > b.ratio) nh = nw / b.ratio;
				else nw = nh * b.ratio;
				if (nw > maxW) {
					nw = maxW;
					nh = nw / b.ratio;
				}
				if (nh > maxH) {
					nh = maxH;
					nw = nh * b.ratio;
				}
			}
			w.value = nw;
			h.value = nh;
			x.value = left ? ax - nw : ax;
			y.value = topEdge ? ay - nh : ay;
		});
	const pos = {
		tl: { left: -HANDLE / 2, top: -HANDLE / 2 },
		tr: { right: -HANDLE / 2, top: -HANDLE / 2 },
		bl: { left: -HANDLE / 2, bottom: -HANDLE / 2 },
		br: { right: -HANDLE / 2, bottom: -HANDLE / 2 }
	}[corner];
	return (
		<GestureDetector gesture={pan}>
			<View style={[s.handleHit, pos]} hitSlop={12}>
				<View style={s.handle} />
			</View>
		</GestureDetector>
	);
}

const s = StyleSheet.create({
	fill: { flex: 1, backgroundColor: color.bg },
	top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: gutter, height: 52 },
	stage: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: gutter },
	shade: { position: 'absolute', backgroundColor: 'rgba(7,8,11,0.62)' },
	box: { position: 'absolute', borderWidth: 1.5, borderColor: color.amber },
	third: { position: 'absolute', backgroundColor: 'rgba(242,238,230,0.35)' },
	handleHit: { position: 'absolute', width: HANDLE, height: HANDLE, alignItems: 'center', justifyContent: 'center' },
	handle: { width: 16, height: 16, borderRadius: radius.sm, backgroundColor: color.amber, borderWidth: 2, borderColor: color.bg },
	tools: { gap: 14, paddingHorizontal: gutter, paddingTop: 12 },
	aspects: { flexDirection: 'row', alignSelf: 'center', gap: 6, padding: 4, borderRadius: radius.pill, borderWidth: 1, borderColor: color.line2, backgroundColor: color.bg2 },
	aspect: { paddingHorizontal: 14, height: 34, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
	aspectOn: { backgroundColor: color.amberSoft },
	aspectText: { fontFamily: font.bodySemi, fontSize: 13, color: color.fg2 }
});

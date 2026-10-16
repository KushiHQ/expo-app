/**
 * Draw-your-signature pad in the Kushi kit. Strokes run on the UI thread and are
 * smoothed (Chaikin) when the finger lifts; the PNG is exported through
 * react-native-svg so the strokes are always captured.
 */
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedProps, useSharedValue } from 'react-native-reanimated';
import { Path, Rect, Svg } from 'react-native-svg';
import { PenLine, RotateCcw } from 'lucide-react-native';
import { Pressable } from '@/components/k/pressable';
import { color, gutter, radius } from '@/lib/k/theme';
import { useLayout } from '@/lib/k/layout';
import { Button } from './button';
import { KText } from './text';

const AnimatedPath = Animated.createAnimatedComponent(Path);
type Point = { x: number; y: number };

function chaikin(pts: Point[], iterations = 2): Point[] {
	if (pts.length < 3) return pts;
	let p = pts;
	for (let it = 0; it < iterations; it++) {
		const out: Point[] = [p[0]];
		for (let i = 0; i < p.length - 1; i++) {
			out.push({ x: 0.75 * p[i].x + 0.25 * p[i + 1].x, y: 0.75 * p[i].y + 0.25 * p[i + 1].y });
			out.push({ x: 0.25 * p[i].x + 0.75 * p[i + 1].x, y: 0.25 * p[i].y + 0.75 * p[i + 1].y });
		}
		out.push(p[p.length - 1]);
		p = out;
	}
	return p;
}

function toPath(pts: Point[]): string {
	if (!pts.length) return '';
	if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y} l 0.5 0.5`;
	let d = `M ${pts[0].x} ${pts[0].y}`;
	for (let i = 1; i < pts.length - 1; i++) d += ` Q ${pts[i].x} ${pts[i].y} ${(pts[i].x + pts[i + 1].x) / 2} ${(pts[i].y + pts[i + 1].y) / 2}`;
	return `${d} L ${pts[pts.length - 1].x} ${pts[pts.length - 1].y}`;
}

/** Shows the signature on file (or a "draw" prompt) and opens a full-screen pad. */
export function SignaturePad({ onSave, existingUrl, uploading }: { onSave: (dataUrl: string) => void; existingUrl?: string | null; uploading?: boolean }) {
	const insets = useSafeAreaInsets();
	const { compact } = useLayout();
	const [open, setOpen] = useState(false);
	const [paths, setPaths] = useState<string[]>([]);
	const svg = useRef<any>(null);
	const raw = useRef<Point[]>([]);
	const current = useSharedValue('');
	const px = useSharedValue(0);
	const py = useSharedValue(0);

	const start = useCallback((x: number, y: number) => {
		raw.current = [{ x, y }];
	}, []);
	const push = useCallback((x: number, y: number) => {
		raw.current.push({ x, y });
	}, []);
	const commit = useCallback(() => {
		const pts = raw.current;
		raw.current = [];
		if (pts.length) setPaths((p) => [...p, toPath(chaikin(pts))]);
	}, []);

	const pan = Gesture.Pan()
		.minDistance(0)
		.onStart((e) => {
			'worklet';
			current.value = `M ${e.x} ${e.y}`;
			px.value = e.x;
			py.value = e.y;
			runOnJS(start)(e.x, e.y);
		})
		.onUpdate((e) => {
			'worklet';
			const dx = e.x - px.value;
			const dy = e.y - py.value;
			if (dx * dx + dy * dy < 2.25) return;
			current.value = `${current.value} Q ${px.value} ${py.value} ${(px.value + e.x) / 2} ${(py.value + e.y) / 2}`;
			px.value = e.x;
			py.value = e.y;
			runOnJS(push)(e.x, e.y);
		})
		.onEnd(() => {
			'worklet';
			current.value = '';
			runOnJS(commit)();
		})
		.onFinalize(() => {
			'worklet';
			current.value = '';
			runOnJS(commit)();
		});
	const live = useAnimatedProps(() => ({ d: current.value }));

	const clear = () => {
		setPaths([]);
		current.value = '';
		raw.current = [];
	};
	const save = () => {
		if (!paths.length) return;
		svg.current?.toDataURL((data: string) => {
			onSave(`data:image/png;base64,${data}`);
			setOpen(false);
		});
	};

	return (
		<>
			{existingUrl ? (
				<View style={{ gap: 8 }}>
					<View style={s.preview}>
						<Image source={{ uri: existingUrl }} style={StyleSheet.absoluteFill} contentFit="contain" transition={250} />
					</View>
					<Pressable accessibilityRole="button" accessibilityLabel="Sign again" onPress={() => (clear(), setOpen(true))} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingVertical: 4 }}>
						{uploading ? <ActivityIndicator color={color.amber} /> : <RotateCcw size={14} color={color.muted} />}
						<KText v="small">Sign again</KText>
					</Pressable>
				</View>
			) : (
				<Pressable accessibilityRole="button" accessibilityLabel="Draw your signature" testID="sign-open" onPress={() => (clear(), setOpen(true))} style={({ pressed }) => [s.cta, pressed && { opacity: 0.8 }]}>
					{uploading ? (
						<ActivityIndicator color={color.amber} />
					) : (
						<>
							<PenLine size={20} color={color.amber} />
							<KText v="bodyStrong">Draw your signature</KText>
							<KText v="xs">Opens a signing pad</KText>
						</>
					)}
				</Pressable>
			)}

			<Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)} statusBarTranslucent supportedOrientations={['portrait', 'landscape']}>
				<GestureHandlerRootView style={{ flex: 1 }}>
					<View style={[s.modal, { paddingTop: insets.top + 8, paddingBottom: Math.max(insets.bottom, 16) }]}>
						<View style={s.bar}>
							<Pressable accessibilityRole="button" onPress={() => setOpen(false)} hitSlop={12}>
								<KText v="body" c="fg2">
									Cancel
								</KText>
							</Pressable>
							<KText v="heading">Your signature</KText>
							<Pressable accessibilityRole="button" onPress={clear} hitSlop={12}>
								<KText v="body" c="fg2">
									Clear
								</KText>
							</Pressable>
						</View>
						<KText v="small" center style={{ marginVertical: 12 }}>
							Sign with your finger in the box below.
						</KText>
						<GestureDetector gesture={pan}>
							<View style={[s.canvas, !compact && { maxWidth: 720, alignSelf: 'center', width: '100%' }]} testID="sign-canvas">
								<Svg ref={svg} width="100%" height="100%">
									<Rect x="0" y="0" width="100%" height="100%" fill="#ffffff" />
									{paths.map((d, i) => (
										<Path key={i} d={d} stroke="#111" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
									))}
									<AnimatedPath animatedProps={live} stroke="#111" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
								</Svg>
								{!paths.length ? (
									<View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center', gap: 8 }]} pointerEvents="none">
										<PenLine size={26} color="rgba(0,0,0,0.2)" />
										<KText v="small" style={{ color: 'rgba(0,0,0,0.3)' }}>
											Sign here
										</KText>
									</View>
								) : null}
							</View>
						</GestureDetector>
						<View style={[{ paddingHorizontal: gutter, paddingTop: 16 }, !compact && { maxWidth: 560, alignSelf: 'center', width: '100%' }]}>
							<Button title="Use this signature" size="lg" block disabled={!paths.length} loading={uploading} onPress={save} testID="sign-save" />
						</View>
					</View>
				</GestureHandlerRootView>
			</Modal>
		</>
	);
}

const s = StyleSheet.create({
	preview: { height: 120, borderRadius: radius.md, backgroundColor: '#fff', overflow: 'hidden' },
	cta: { height: 110, borderRadius: radius.md, borderWidth: 1, borderStyle: 'dashed', borderColor: color.amberLine, backgroundColor: 'rgba(245,158,11,0.05)', alignItems: 'center', justifyContent: 'center', gap: 4 },
	modal: { flex: 1, backgroundColor: color.bg },
	bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: gutter, paddingVertical: 10 },
	canvas: { flex: 1, marginHorizontal: 16, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: '#fff' }
});

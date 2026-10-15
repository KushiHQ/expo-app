/**
 * Responsive layout for tablets (iPad, large Android) — driven by the current
 * window, not the device, so rotation and iPad split view / slide over follow
 * along. Phones (and any window narrower than 600dp, or shorter than 500dp —
 * a phone in landscape) are `compact`, and every screen keeps its phone layout
 * there: tablet styling is only ever added for `medium` and `expanded`.
 */
import { useMemo } from 'react';
import { useWindowDimensions, type ViewStyle } from 'react-native';
import { gutter } from './theme';

export type WidthClass = 'compact' | 'medium' | 'expanded';

/** Window-width breakpoints (dp). */
export const breakpoint = { medium: 600, expanded: 900 } as const;

/** Max widths (dp) for content on large windows. */
export const maxWidth = {
	/** Feeds and grids. */
	content: 1280,
	/** Reading columns: settings, lists, details on medium. */
	reading: 720,
	/** Forms and auth. */
	form: 560,
	/** Sheets and dialogs presented as centered panels. */
	panel: 600
} as const;

export function widthClassOf(width: number, height: number): WidthClass {
	if (width < breakpoint.medium || Math.min(width, height) < 500) return 'compact';
	return width >= breakpoint.expanded ? 'expanded' : 'medium';
}

/** Columns for a card feed at a width class. */
export function columnsFor(cls: WidthClass): number {
	return cls === 'expanded' ? 3 : cls === 'medium' ? 2 : 1;
}

/** Width of one grid item for `columns` across `inner` dp with `gap` between them. */
export function itemWidth(inner: number, columns: number, gap: number): number {
	return Math.floor((inner - gap * (columns - 1)) / columns);
}

/** Center a block and cap its width (no-op when `max` is undefined). */
export function centered(max?: number): ViewStyle | undefined {
	return max ? { width: '100%', maxWidth: max, alignSelf: 'center' } : undefined;
}

export function useLayout() {
	const { width, height } = useWindowDimensions();
	return useMemo(() => {
		const widthClass = widthClassOf(width, height);
		const compact = widthClass === 'compact';
		const pad = compact ? gutter : widthClass === 'medium' ? 28 : 40;
		const columns = columnsFor(widthClass);
		const contentWidth = Math.min(width, maxWidth.content);
		return {
			width,
			height,
			widthClass,
			compact,
			medium: widthClass === 'medium',
			expanded: widthClass === 'expanded',
			/** Shorter window side is tablet-sized. */
			isTablet: Math.min(width, height) >= breakpoint.medium,
			landscape: width > height,
			/** Side padding for screen content. */
			gutter: pad,
			columns,
			/** Width the content column actually gets (window capped at maxWidth.content). */
			contentWidth,
			/** Max width for a screen type, undefined on compact (phone layout untouched). */
			max: (kind: keyof typeof maxWidth) => (compact ? undefined : maxWidth[kind])
		};
	}, [width, height]);
}

export type Layout = ReturnType<typeof useLayout>;

/**
 * Soft / cloudy design tokens. See the [[reference_design_system_soft_cloudy]]
 * memory + Notion "3 · Design System". Core rule: surfaces are defined by a
 * translucent FILL + soft SHADOW (+ optional glow) — never a hard 1px border.
 */
export const SURFACE = {
  /** Default soft ambient shadow for a raised surface — kept subtle. */
  shadow: "0px 10px 28px -16px rgba(0,0,0,0.42)",
  /** Slightly stronger shadow for more-elevated surfaces (sheets, hero cards). */
  shadowHigh: "0px 16px 38px -20px rgba(0,0,0,0.52)",
  /** Warm glow for selected/active surfaces and primary CTAs. */
  glow: "0px 8px 22px -10px rgba(255,165,0,0.30)",
  /** Fill alphas, applied to the theme text colour so they adapt to light/dark. */
  fillRaised: 0.05,
  fillHigh: 0.075,
  /** Selected wash alpha, applied to the brand primary. */
  fillSelected: 0.14,
  radius: 22,
  radiusSm: 16,
} as const;

/** Filled, borderless status pills. */
export const STATUS_PILL = {
  live: { fg: "#34D399", bg: "rgba(34,197,94,0.16)" },
  draft: { fg: "#9AA0A6", bg: "rgba(255,255,255,0.07)" },
  review: { fg: "#FBBF24", bg: "rgba(245,158,11,0.16)" },
  danger: { fg: "#F87171", bg: "rgba(239,68,68,0.16)" },
} as const;

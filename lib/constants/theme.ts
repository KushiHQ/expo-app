/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

// Legacy palette, mapped onto the Kushi night tokens (lib/k/theme.ts) so screens
// that still use useThemeColors() match the redesign. Both keys are night.
const tintColorLight = '#F59E0B';
const tintColorDark = '#F2EEE6';

const common = {
  primary: '#F59E0B',
  'primary-01': 'rgba(245,158,11,0.12)',
  'primary-04': '#FFB627',
  'primary-content': '#120C02',
  secondary: '#266DD3',
  shade: '#12151C',
  'shade-content': '#F2EEE6',
  accent: '#3CCB8E',
  warning: '#F59E0B',
  error: '#F0524F',
  success: '#3CCB8E',
  'success-content': 'rgba(60,203,142,0.12)',
  info: '#4C8FF0',
  'info-content': 'rgba(76,143,240,0.12)',
};

const night = {
  ...common,
  text: '#F2EEE6',
  background: '#07080B',
  surface: '#0C0E13',
  'surface-01': '#12151C',
  'surface-02': '#181C25',
  tint: tintColorDark,
  icon: '#8A867E',
  tabIconDefault: '#55524D',
  tabIconSelected: tintColorDark,
};

export const Colors = {
  light: night,
  dark: night,
};

// Legacy font keys now resolve to the Kushi body face (Inter Tight).
export const Fonts = {
  thin: 'InterTight_400Regular',
  extralight: 'InterTight_400Regular',
  light: 'InterTight_400Regular',
  regular: 'InterTight_400Regular',
  medium: 'InterTight_500Medium',
  semibold: 'InterTight_600SemiBold',
  bold: 'InterTight_700Bold',
  extrabold: 'InterTight_700Bold',
  black: 'InterTight_700Bold',
};

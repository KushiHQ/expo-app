/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#F59E0B';
const tintColorDark = '#fff';

const common = {
  primary: '#F59E0B', // Lux Amber (Logo Primary)
  'primary-01': '#FEF3C7',
  'primary-04': '#FCD34D',
  'primary-content': '#fff',
  secondary: '#1E3A8A', // Deep Sapphire (Logo Blue)
  shade: '#0F172A', // Deep Navy Shade
  'shade-content': '#fff',
  accent: '#10B981', // Emerald for success/premium feel
  warning: '#FBBF24',
  error: '#EF4444',
  success: '#22C55E',
  'success-content': '#DCFCE7',
  info: '#3B82F6',
  'info-content': '#EFF6FF',
};

export const Colors = {
  light: {
    ...common,
    text: '#0F172A', // Deep Navy Text
    background: '#FFFFFF',
    surface: '#F8FAFC', // Bone White
    'surface-01': '#F1F5F9',
    'surface-02': '#E2E8F0',
    tint: tintColorLight,
    icon: '#64748B',
    tabIconDefault: '#94A3B8',
    tabIconSelected: tintColorLight,
  },
  dark: {
    ...common,
    text: '#F8FAFC',
    background: '#020617', // Rich Darker Navy
    surface: '#0F172A', // Deep Navy Surface
    'surface-01': '#1E293B', // Elevated Navy
    'surface-02': '#334155', // High Elevation Navy
    tint: tintColorDark,
    icon: '#94A3B8',
    tabIconDefault: '#475569',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = {
  thin: 'Inter_100',
  extralight: 'Inter_200',
  light: 'Inter_300',
  regular: 'Inter_400',
  medium: 'Inter_500',
  semibold: 'Inter_600',
  bold: 'Inter_700',
  extrabold: 'Inter_800',
  black: 'Inter_900',
};

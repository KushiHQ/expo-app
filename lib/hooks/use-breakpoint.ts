import { useWindowDimensions } from 'react-native';

export const useBreakpoint = () => {
  const { width } = useWindowDimensions();
  return { isTablet: width >= 768 };
};

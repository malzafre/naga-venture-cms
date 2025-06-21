import { Colors } from '@/constants/Colors';

/**
 * Tourism CMS Theme Hook
 * Based on ComprehensiveStyleGuide.md
 * Provides consistent color palette without light/dark mode switching
 */
export function useTheme() {
  // Fixed color palette based on ComprehensiveStyleGuide.md
  const theme = {
    colors: Colors,
    fontWeights: {
      light: '300' as const,
      normal: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
      heavy: '800' as const,
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
    },
    borderRadius: {
      sm: 4,
      md: 8,
      lg: 12,
      xl: 16,
      full: 999,
    },
    shadows: {
      sm: {
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      },
      md: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      },
      lg: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
      },
    },
  };
  return {
    theme,
    colorScheme: 'light' as const,
    isDark: false,
    isLight: true,
  };
}

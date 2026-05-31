import { StyleSheet } from 'react-native';

export const colors = {
  bg: '#050a05',
  surface: '#0a120a',
  surfaceRaised: '#0d1a0d',
  border: '#1a3a1a',
  borderDim: '#0f250f',

  primary: '#00ff41',
  secondary: '#00cc33',
  dim: '#006622',
  muted: '#004411',

  accent: '#ff6600',
  warning: '#ffaa00',
  error: '#ff0044',
  info: '#00aaff',

  textBright: '#e0ffe0',
  textNormal: '#00ff41',
  textDim: '#006622',

  scanline: 'rgba(0,0,0,0.15)',
  phosphor: 'rgba(0,255,65,0.03)',
} as const;

export const fonts = {
  mono: 'Courier New',
  size: {
    xxs: 9,
    xs: 11,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 20,
    xxl: 26,
  },
  weight: {
    normal: '400' as const,
    bold: '700' as const,
  },
} as const;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 2,
  md: 4,
} as const;

/** Shared text style base — apply on top with specific sizes */
export const textBase = StyleSheet.create({
  mono: {
    fontFamily: fonts.mono,
    color: colors.textNormal,
  },
});

export const logTypeColor: Record<string, string> = {
  system: colors.secondary,
  warning: colors.warning,
  error: colors.error,
  event: colors.accent,
  action: colors.primary,
};

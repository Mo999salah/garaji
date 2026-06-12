/**
 * Centralized color constants — mirrors tailwind.config.js tokens.
 * Use these for inline `color` props on icons or any place that
 * can't leverage Tailwind/NativeWind class names.
 *
 * RULE: Never hard-code a hex colour elsewhere. Import from here.
 */

export const AppColors = {
 // ── Primary ───────────────────────────────
 primary: '#00685f',
 onPrimary: '#ffffff',
 primaryContainer: '#008378',
 onPrimaryContainer: '#f4fffc',

 // ── Secondary ─────────────────────────────
 secondary: '#5d5c74',
 onSecondary: '#ffffff',
 secondaryContainer: '#e2e0fc',
 onSecondaryContainer: '#63627a',

 // ── Tertiary ──────────────────────────────
 tertiary: '#555c6a',
 onTertiary: '#ffffff',

 // ── Surface ───────────────────────────────
 background: '#f9f9fa',
 onBackground: '#1a1c1d',
 surface: '#f9f9fa',
 onSurface: '#1a1c1d',
 onSurfaceVariant: '#3d4947',
 surfaceContainerLowest: '#ffffff',
 surfaceContainerLow: '#f3f3f4',
 surfaceContainerHigh: '#e8e8e9',

 // ── Outline ───────────────────────────────
 outline: '#6d7a77',
 outlineVariant: '#bcc9c6',

 // ── Error ─────────────────────────────────
 error: '#ba1a1a',
 onError: '#ffffff',
 errorContainer: '#ffdad6',

 // ── Warning (amber) ───────────────────────
 warning: '#F59E0B',
 onWarning: '#1a1c1d',
 warningContainer: '#FEF3C7',

 // ── Success (green) ───────────────────────
 success: '#10b981',
 onSuccess: '#ffffff',
 successContainer: '#d1fae5',

 // ── Brand / third-party ───────────────────
 whatsapp: '#25D366',
} as const;

export type AppColorKey = keyof typeof AppColors;

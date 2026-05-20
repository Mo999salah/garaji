import { I18nManager } from 'react-native';

const RTL_LOCALE_PREFIXES = ['ar', 'he', 'fa', 'ur'];

function getDeviceLocale() {
  try {
    const intlLocale = Intl.DateTimeFormat().resolvedOptions().locale;
    return intlLocale || 'en';
  } catch {
    return 'en';
  }
}

export function isRtlLocale(locale: string) {
  const normalized = locale.toLowerCase();
  return RTL_LOCALE_PREFIXES.some(
    (prefix) => normalized === prefix || normalized.startsWith(`${prefix}-`),
  );
}

export function configureAppDirection() {
  const shouldUseRtl = isRtlLocale(getDeviceLocale());

  if (I18nManager.isRTL !== shouldUseRtl) {
    I18nManager.allowRTL(shouldUseRtl);
    I18nManager.forceRTL(shouldUseRtl);
  }
}

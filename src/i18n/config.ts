export const locales = ['sr'] as const;
export const defaultLocale = 'sr' as const;

export type Locale = (typeof locales)[number];

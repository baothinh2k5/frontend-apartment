import i18n from '../i18n';

export const getLocalizedText = (translations: any[] | undefined, key: 'title' | 'description', currentLang?: string): string | null => {
  if (!translations || !Array.isArray(translations) || translations.length === 0) return null;
  
  const lang = currentLang || i18n.language || 'vi';
  const prefix = lang.startsWith('en') ? 'en' : 'vi';
  
  const match = translations.find((t: any) => t.languageCode === prefix);
  if (match && match[key]) return match[key];
  
  const fallback = translations.find((t: any) => t.languageCode === 'vi');
  if (fallback && fallback[key]) return fallback[key];
  
  return translations[0][key] || null;
};

export const removeDiacritics = (str: string): string => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
};

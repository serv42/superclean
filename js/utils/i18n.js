export const translations = {
    de: { /* ... alle Texte aus vorheriger Version ... */ },
    en: { /* ... alle Texte aus vorheriger Version ... */ }
};

export let currentLang = localStorage.getItem('superclean_lang') || 'de';

export function t(key) {
    return translations[currentLang]?.[key] || key;
}

export function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('superclean_lang', lang);
}
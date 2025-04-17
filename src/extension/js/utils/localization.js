const translations = {
    en: {
        phishingWarning: 'WARNING! CorgPhish has detected signs of a phishing site. Be cautious when entering personal information.',
        officialSite: 'Official Site',
        checkHistoryEmpty: 'Check history is empty',
    },
    ru: {
        phishingWarning: 'ВНИМАНИЕ! CorgPhish обнаружил признаки фишингового сайта. Будьте осторожны при вводе личных данных.',
        officialSite: 'Официальный сайт',
        checkHistoryEmpty: 'История проверок пуста',
    }
};

function getTranslation(key, lang = 'en') {
    return translations[lang][key] || key;
}

// Экспортируем функции в глобальный объект window для доступа из других скриптов
window.CorgPhishLocalization = {
    getTranslation: getTranslation,
    translations: translations
}; 
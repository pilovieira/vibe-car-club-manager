import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n/translations';
import { useSettings } from './SettingsContext';

const LanguageContext = createContext();

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

export const LanguageProvider = ({ children }) => {
    const { settings } = useSettings();
    const [language, setLanguage] = useState(() => {
        // Load from localStorage or default to settings or 'pt'
        return localStorage.getItem('language') || settings.app_language || 'pt';
    });

    // Update language state when the app property changes
    useEffect(() => {
        if (settings.app_language && settings.app_language !== language) {
            setLanguage(settings.app_language);
        }
    }, [settings.app_language]);

    useEffect(() => {
        // Save to localStorage whenever language changes
        localStorage.setItem('language', language);
    }, [language]);

    const t = (key) => {
        return translations[language]?.[key] || key;
    };

    const toggleLanguage = () => {
        // No longer actively used in navbar but kept here for stability
        setLanguage(prev => {
            if (prev === 'en') return 'pt';
            if (prev === 'pt') return 'es';
            return 'en';
        });
    };

    const getTranslatedTitle = (rawTitle) => {
        if (!rawTitle || typeof rawTitle !== 'string') return rawTitle || '';

        // Multi-language pattern: pt:Title\nen:Title\nes:Title
        const validLangs = ['en', 'pt', 'es'];
        const lines = rawTitle.split('\n');
        const langMap = {};
        let hasPattern = false;

        lines.forEach(line => {
            const separatorIndex = line.indexOf(':');
            if (separatorIndex !== -1) {
                const prefix = line.substring(0, separatorIndex).trim().toLowerCase();
                const content = line.substring(separatorIndex + 1).trim();
                if (validLangs.includes(prefix)) {
                    langMap[prefix] = content;
                    hasPattern = true;
                }
            }
        });

        if (!hasPattern) return rawTitle;

        // Try current language, fallback to en, then pt, then es, then original
        return langMap[language] || langMap['en'] || langMap['pt'] || langMap['es'] || rawTitle;
    };

    const value = {
        language,
        setLanguage,
        toggleLanguage,
        t,
        getTranslatedTitle
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

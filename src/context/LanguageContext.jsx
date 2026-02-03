import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n/translations';

const LanguageContext = createContext();

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => {
        // Load from localStorage or default to Portuguese
        return localStorage.getItem('language') || 'pt';
    });

    useEffect(() => {
        // Save to localStorage whenever language changes
        localStorage.setItem('language', language);
    }, [language]);

    const t = (key) => {
        return translations[language]?.[key] || key;
    };

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'en' ? 'pt' : 'en');
    };

    const value = {
        language,
        setLanguage,
        toggleLanguage,
        t
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

import React, { createContext, useState, useContext, useEffect } from 'react';
import { translations, languages } from '../utils/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('en');

    const t = (path) => {
        const keys = path.split('.');
        let current = translations[language];
        for (const key of keys) {
            if (current[key] === undefined) return path;
            current = current[key];
        }
        return current;
    };

    const getVoiceCode = () => {
        const lang = languages.find(l => l.code === language);
        return lang ? lang.voiceCode : 'en-IN';
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, languages, getVoiceCode }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

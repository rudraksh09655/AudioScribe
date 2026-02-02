import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('light');
    const [accentColor, setAccentColor] = useState('blue');

    useEffect(() => {
        // Load theme from localStorage
        const savedTheme = localStorage.getItem('stt_theme') || 'light';
        const savedAccent = localStorage.getItem('stt_accent') || 'blue';
        setTheme(savedTheme);
        setAccentColor(savedAccent);
        applyTheme(savedTheme);
    }, []);

    const applyTheme = (newTheme) => {
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const updateTheme = (newTheme) => {
        setTheme(newTheme);
        localStorage.setItem('stt_theme', newTheme);
        applyTheme(newTheme);
    };

    const updateAccentColor = (color) => {
        setAccentColor(color);
        localStorage.setItem('stt_accent', color);
    };

    return (
        <ThemeContext.Provider value={{ theme, accentColor, updateTheme, updateAccentColor }}>
            {children}
        </ThemeContext.Provider>
    );
};

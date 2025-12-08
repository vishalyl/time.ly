"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface ThemeContextType {
    colorfulMode: boolean;
    toggleColorfulMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [colorfulMode, setColorfulMode] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const stored = localStorage.getItem("colorfulMode");
        if (stored !== null) {
            setColorfulMode(stored === "true");
        }
    }, []);

    useEffect(() => {
        if (mounted) {
            localStorage.setItem("colorfulMode", colorfulMode.toString());
            if (colorfulMode) {
                document.documentElement.classList.add("colorful-mode");
            } else {
                document.documentElement.classList.remove("colorful-mode");
            }
        }
    }, [colorfulMode, mounted]);

    const toggleColorfulMode = () => {
        setColorfulMode(prev => !prev);
    };

    return (
        <ThemeContext.Provider value={{ colorfulMode, toggleColorfulMode }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};

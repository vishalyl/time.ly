"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

interface ThemeContextType {
    colorfulMode: boolean;
    toggleColorfulMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const [colorfulMode, setColorfulMode] = useState(false); // Default to black & white
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Sync theme from Firestore
    useEffect(() => {
        if (!user) {
            // Not logged in - use default black & white theme
            setColorfulMode(false);
            return;
        }

        console.log("🎨 Setting up theme listener for user:", user.uid);

        const userSettingsDoc = doc(db, "user_settings", user.uid);

        const unsubscribe = onSnapshot(
            userSettingsDoc,
            (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const data = docSnapshot.data();
                    const themePreference = data.colorfulMode ?? false; // Default to black & white
                    console.log("🎨 Theme loaded from Firestore:", themePreference ? "Colorful" : "Black & White");
                    setColorfulMode(themePreference);
                } else {
                    // Document doesn't exist - use default and create it
                    console.log("🎨 No theme preference found, using black & white");
                    setColorfulMode(false);
                }
            },
            (error) => {
                console.error("❌ Theme listener error:", error);
                setColorfulMode(false); // Fallback to black & white
            }
        );

        return () => unsubscribe();
    }, [user]);

    // Apply theme to DOM
    useEffect(() => {
        if (mounted) {
            if (colorfulMode) {
                document.documentElement.classList.add("colorful-mode");
            } else {
                document.documentElement.classList.remove("colorful-mode");
            }
        }
    }, [colorfulMode, mounted]);

    const toggleColorfulMode = async () => {
        if (!user) {
            alert("Please log in to change theme");
            return;
        }

        const newMode = !colorfulMode;
        console.log("🎨 Toggling theme to:", newMode ? "Colorful" : "Black & White");

        try {
            const userSettingsDoc = doc(db, "user_settings", user.uid);
            await setDoc(userSettingsDoc, {
                userId: user.uid,
                colorfulMode: newMode,
                updatedAt: new Date()
            }, { merge: true });
            // onSnapshot will update the state automatically
        } catch (error) {
            console.error("❌ Failed to save theme:", error);
            alert("Failed to save theme preference");
        }
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

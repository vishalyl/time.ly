"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";

export type TimerMode = "focus" | "shortBreak" | "longBreak";

interface TimerSettings {
    focusDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
    autoStartBreaks: boolean;
    autoStartPomodoros: boolean;
    focusColor: string;
    shortBreakColor: string;
    longBreakColor: string;
}

const DEFAULT_SETTINGS: TimerSettings = {
    focusDuration: 25 * 60,
    shortBreakDuration: 5 * 60,
    longBreakDuration: 15 * 60,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    focusColor: "#ef4444",
    shortBreakColor: "#14b8a6",
    longBreakColor: "#3b82f6",
};

interface TimerContextType {
    mode: TimerMode;
    timeLeft: number;
    isRunning: boolean;
    settings: TimerSettings;
    setSettings: React.Dispatch<React.SetStateAction<TimerSettings>>;
    switchMode: (mode: TimerMode) => void;
    toggleTimer: () => void;
    resetTimer: () => void;
    activeTaskId: string | null;
    setActiveTaskId: (id: string | null) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider = ({ children }: { children: React.ReactNode }) => {
    const [mode, setMode] = useState<TimerMode>("focus");
    const [timeLeft, setTimeLeft] = useState(DEFAULT_SETTINGS.focusDuration);
    const [isRunning, setIsRunning] = useState(false);
    const [settings, setSettings] = useState<TimerSettings>(DEFAULT_SETTINGS);
    const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Simple beep sound
    const playSound = useCallback((type: "start" | "finish") => {
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) return;

            const audioContext = new AudioContext();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            if (type === "start") {
                oscillator.type = "sine";
                oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.1);
            } else {
                // Finish sound (sequence of notes)
                oscillator.type = "triangle";
                oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
                oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
                oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.4);
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.4);
            }
        } catch (e) {
            console.error("Audio play failed", e);
        }
    }, []);

    // Definitions moved to above useEffect to be utilized inside it. 
    // This replace block is actually unnecessary if I included them in the previous large replacement?
    // Wait, the previous replacement REPLACED the useEffect block but defined `syncTime`, `switchMode`, etc INSIDE or BEFORE it?
    // The previous replacement content INCLUDED the definitions of syncTime, switchMode, toggleTimer, resetTimer AND the useEffect.
    // However, the TargetContent of the previous step was ONLY the useEffect.
    // So the previous step inserted the new functions BUT the old functions `switchMode`, `toggleTimer`, `resetTimer` are still present ABOVE the new block (lines 82-118).
    // I need to DELETE the old functions now.

    const accumulatedSecondsRef = useRef(0);
    const lastTickRef = useRef<number | null>(null);

    // Helper to sync time to Firestore
    const syncTime = useCallback(async () => {
        if (accumulatedSecondsRef.current > 0 && activeTaskId && mode === 'focus') {
            const secondsToAdd = accumulatedSecondsRef.current;
            accumulatedSecondsRef.current = 0; // Reset local accumulator

            try {
                // Dynamic import to avoid SSR issues if any, or just consistent pattern
                const { doc, updateDoc, increment } = await import("firebase/firestore");
                const { db } = await import("@/lib/firebase");
                await updateDoc(doc(db, "tasks", activeTaskId), {
                    totalSeconds: increment(secondsToAdd)
                });
            } catch (e) {
                console.error("Failed to sync time", e);
            }
        }
    }, [activeTaskId, mode]);

    const switchMode = useCallback((newMode: TimerMode) => {
        syncTime(); // Sync before switching
        setMode(newMode);
        setIsRunning(false);
        switch (newMode) {
            case "focus":
                setTimeLeft(settings.focusDuration);
                break;
            case "shortBreak":
                setTimeLeft(settings.shortBreakDuration);
                break;
            case "longBreak":
                setTimeLeft(settings.longBreakDuration);
                break;
        }
    }, [settings, syncTime]);

    const toggleTimer = useCallback(() => {
        if (!isRunning) {
            playSound("start");
            lastTickRef.current = Date.now();
        } else {
            // Pausing
            syncTime(); // Sync accumulated time on pause
            lastTickRef.current = null;
        }
        setIsRunning((prev) => !prev);
    }, [isRunning, playSound, syncTime]);

    const resetTimer = useCallback(() => {
        syncTime(); // Sync before reset
        setIsRunning(false);
        lastTickRef.current = null;
        accumulatedSecondsRef.current = 0;

        switch (mode) {
            case "focus":
                setTimeLeft(settings.focusDuration);
                break;
            case "shortBreak":
                setTimeLeft(settings.shortBreakDuration);
                break;
            case "longBreak":
                setTimeLeft(settings.longBreakDuration);
                break;
        }
    }, [mode, settings, syncTime]);

    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            // Using Date.now() for more accuracy? For now keep simple interval but accumulate seconds
            timerRef.current = setTimeout(() => {
                setTimeLeft((prev) => prev - 1);
                // Increment accumulator if in focus mode
                if (mode === 'focus') {
                    accumulatedSecondsRef.current += 1;
                }
            }, 1000);
        } else if (timeLeft === 0) {
            setIsRunning(false);
            playSound("finish");
            lastTickRef.current = null;

            // Handle Time Persistence (Full Pomodoro finish)
            if (mode === "focus" && activeTaskId) {
                syncTime(); // Sync any remaining seconds (should match full duration)

                import("firebase/firestore").then(async ({ doc, updateDoc, increment }) => {
                    try {
                        const { db } = await import("@/lib/firebase");
                        await updateDoc(doc(db, "tasks", activeTaskId), {
                            actualPomodoros: increment(1)
                        });
                    } catch (e) {
                        console.error("Failed to update task pomodoros", e);
                    }
                });
            }
            // Handle auto-switching
            if (mode === "focus") {
                if (settings.autoStartBreaks) {
                    switchMode("shortBreak");
                    setIsRunning(true);
                }
            } else {
                if (settings.autoStartPomodoros) {
                    switchMode("focus");
                    setIsRunning(true);
                }
            }
        }

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [isRunning, timeLeft, playSound, mode, activeTaskId, settings, switchMode, syncTime]);

    // Update timeLeft if settings change (and timer not running)
    useEffect(() => {
        if (!isRunning) {
            switch (mode) {
                case "focus":
                    setTimeLeft(settings.focusDuration);
                    break;
                case "shortBreak":
                    setTimeLeft(settings.shortBreakDuration);
                    break;
                case "longBreak":
                    setTimeLeft(settings.longBreakDuration);
                    break;
            }
        }
    }, [settings, mode]);


    return (
        <TimerContext.Provider value={{ mode, timeLeft, isRunning, settings, setSettings, switchMode, toggleTimer, resetTimer, activeTaskId, setActiveTaskId }}>
            {children}
        </TimerContext.Provider>
    );
};

export const useTimer = () => {
    const context = useContext(TimerContext);
    if (context === undefined) {
        throw new Error("useTimer must be used within a TimerProvider");
    }
    return context;
};

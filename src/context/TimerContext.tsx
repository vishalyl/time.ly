"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";

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
    activeProjectId: string | null;
    setActiveProjectId: (id: string | null) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const [mode, setMode] = useState<TimerMode>("focus");
    const [timeLeft, setTimeLeft] = useState(DEFAULT_SETTINGS.focusDuration);
    const [isRunning, setIsRunning] = useState(false);
    const [settings, setSettings] = useState<TimerSettings>(DEFAULT_SETTINGS);
    const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
    const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Simple beep sound
    const playSound = useCallback((type: "start" | "finish") => {
        // ... (existing playSound logic, omitted for brevity if unchanged, but for replace_file I must include or map correctly)
        // Since I can't partially match easily inside a large function without full context, I will just keep the existing playSound by not touching it in this targeted replacement if possible.
        // Or I'll rewrite the whole block if I target a large chunk.
        // Let's try to target just the interface and provider start, and then separate chunk for syncTime?
        // I will use multiple chunks.
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

    const accumulatedSecondsRef = useRef(0);
    const lastTickRef = useRef<number | null>(null);

    // Helper to sync time to Firestore
    const syncTime = useCallback(async () => {
        if (accumulatedSecondsRef.current > 0 && mode === 'focus' && user) {
            const secondsToAdd = accumulatedSecondsRef.current;
            accumulatedSecondsRef.current = 0; // Reset local accumulator

            console.log("⏱️ Syncing time:", secondsToAdd, "seconds (", Math.floor(secondsToAdd / 60), "min)");
            console.log("📍 Active task:", activeTaskId);
            console.log("📍 Active project:", activeProjectId);
            console.log("👤 User:", user.uid);

            try {
                const { doc, updateDoc, increment, setDoc, addDoc, collection, serverTimestamp } = await import("firebase/firestore");
                const { db } = await import("@/lib/firebase");

                const minutesToAdd = Math.floor(secondsToAdd / 60);

                // ALWAYS update daily goal progress (todayMinutes)
                if (minutesToAdd > 0) {
                    console.log("📊 Updating daily goal progress...");
                    const userSettingsDoc = doc(db, "user_settings", user.uid);
                    await setDoc(userSettingsDoc, {
                        userId: user.uid,
                        todayMinutes: increment(minutesToAdd),
                        lastUpdated: serverTimestamp()
                    }, { merge: true });
                    console.log("✅ Daily goal updated! Added", minutesToAdd, "minutes");
                }

                // Update task/project time if selected
                if (activeTaskId) {
                    console.log("✅ Updating task time...");
                    await updateDoc(doc(db, "tasks", activeTaskId), {
                        totalSeconds: increment(secondsToAdd)
                    });
                    console.log("✅ Task time updated!");
                } else if (activeProjectId) {
                    console.log("✅ Updating project time...");
                    await updateDoc(doc(db, "projects", activeProjectId), {
                        totalSeconds: increment(secondsToAdd)
                    });
                    console.log("✅ Project time updated!");
                } else {
                    // No task/project selected - create a focus session record
                    console.log("📝 Creating focus session for unassigned time...");
                    await addDoc(collection(db, "focus_sessions"), {
                        userId: user.uid,
                        seconds: secondsToAdd,
                        projectId: null,
                        taskId: null,
                        createdAt: serverTimestamp()
                    });
                    console.log("✅ Focus session created!");
                }
            } catch (e) {
                console.error("❌ Failed to sync time:", e);
            }
        } else if (accumulatedSecondsRef.current > 0) {
            console.log("⏭️ Skipping sync (not in focus mode)");
        }
    }, [activeTaskId, activeProjectId, mode]);

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
            if (mode === "focus") {
                syncTime(); // Sync any remaining seconds (should match full duration)

                import("firebase/firestore").then(async ({ doc, updateDoc, increment }) => {
                    try {
                        const { db } = await import("@/lib/firebase");
                        if (activeTaskId) {
                            await updateDoc(doc(db, "tasks", activeTaskId), {
                                actualPomodoros: increment(1)
                            });
                        }
                        // We could also track pomodoros for projects? For now just tasks or time.
                    } catch (e) {
                        console.error("Failed to update task pomodoros", e);
                    }
                });
            }
            // Handle auto-switching ...
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
    }, [isRunning, timeLeft, playSound, mode, activeTaskId, activeProjectId, settings, switchMode, syncTime]);

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

    // Periodic auto-save every 30 seconds
    useEffect(() => {
        if (isRunning && mode === 'focus') {
            const autoSaveInterval = setInterval(() => {
                console.log("💾 Auto-saving time...");
                syncTime();
            }, 30000); // 30 seconds

            return () => clearInterval(autoSaveInterval);
        }
    }, [isRunning, mode, syncTime]);

    // Save on browser close
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isRunning && accumulatedSecondsRef.current > 0) {
                console.log("🚪 Browser closing - saving time...");
                syncTime();
                // Show warning if timer is running
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isRunning, syncTime]);


    return (
        <TimerContext.Provider value={{ mode, timeLeft, isRunning, settings, setSettings, switchMode, toggleTimer, resetTimer, activeTaskId, setActiveTaskId, activeProjectId, setActiveProjectId }}>
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

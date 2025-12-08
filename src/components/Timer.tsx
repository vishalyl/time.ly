"use client";

import { useState } from "react";
import { useTimer, TimerMode } from "@/context/TimerContext";
import { useTheme } from "@/context/ThemeContext";
import { useAmbientSound, AmbientSound } from "@/hooks/useAmbientSound";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useActiveTask } from "@/hooks/useActiveTask";
import { TaskSelector } from "@/components/TaskSelector";
import { SoundSelector } from "@/components/SoundSelector";

const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

export function Timer() {
    const { mode, timeLeft, isRunning, toggleTimer, switchMode, resetTimer, activeTaskId, activeProjectId, settings } = useTimer();
    const { activeTaskTitle, loading: taskLoading } = useActiveTask();
    const { colorfulMode } = useTheme();
    const [selectedSound, setSelectedSound] = useState<AmbientSound>("none");

    // Play sound only during focus mode when timer is running
    useAmbientSound(isRunning && mode === 'focus', selectedSound);

    // ... existing helpers

    const getThemeColor = () => {
        if (colorfulMode) {
            // Colorful mode - use vibrant colors
            switch (mode) {
                case 'focus': return settings.focusColor || '#ef4444';
                case 'shortBreak': return settings.shortBreakColor || '#14b8a6';
                case 'longBreak': return settings.longBreakColor || '#3b82f6';
                default: return '#ef4444';
            }
        } else {
            // Black & white mode - use white/light colors for visibility
            return '#fafafa'; // Light color for all modes in B&W theme
        }
    }

    const containerStyle = {
        backgroundColor: `${colorfulMode ? getThemeColor() : '#171717'}20`, // Subtle background
        borderColor: `${colorfulMode ? getThemeColor() : '#404040'}40`
    };

    // Determine if we should show the selector
    const hasActiveFocus = activeTaskId || activeProjectId;
    // Only show selector if: user has selected something OR timer is at initial state (finished/reset)
    const isTimerAtStart = timeLeft === settings.focusDuration;
    const shouldShowSelector = hasActiveFocus || isTimerAtStart;

    return (
        <div
            className="w-full max-w-lg backdrop-blur-sm rounded-3xl p-8 shadow-xl border-2 border-white/40 transition-colors duration-500"
            style={containerStyle}
        >
            {/* Mode Switcher */}
            <div className="flex justify-center items-center gap-4 mb-8">
                <div className="flex gap-2 bg-neutral-900 p-1 rounded-full">
                    {(['focus', 'shortBreak', 'longBreak'] as TimerMode[]).map((m) => (
                        <button
                            key={m}
                            onClick={() => switchMode(m)}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                                mode === m
                                    ? "bg-white text-black"
                                    : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                            )}
                        >
                            {m === 'focus' ? 'Focus' : m === 'shortBreak' ? 'Short Break' : 'Long Break'}
                        </button>
                    ))}
                </div>

                {/* Sound Selector - only show in focus mode */}
                {mode === 'focus' && (
                    <SoundSelector selectedSound={selectedSound} onSoundChange={setSelectedSound} />
                )}
            </div>

            {/* Timer Display */}
            <div className="h-64 flex flex-col items-center justify-center mb-6 relative">
                <div
                    className="text-8xl font-bold font-mono tracking-tighter tabular-nums transition-colors duration-300"
                    style={{ color: getThemeColor() }}
                >
                    {formatTime(timeLeft)}
                </div>

                {/* Task Selector Trigger (Only in Focus Mode and when appropriate) */}
                {mode === 'focus' && shouldShowSelector && (
                    <div className="mt-6 w-full max-w-xs mx-auto">
                        <TaskSelector>
                            <div className="flex flex-col items-center justify-center p-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-all border border-transparent hover:border-black/5 dark:hover:border-white/10 group">
                                <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1 group-hover:text-primary transition-colors">
                                    {hasActiveFocus ? "WORKING ON" : "CURRENT FOCUS"}
                                </span>
                                <div className="flex items-center gap-2 text-center">
                                    <span className={cn("text-lg font-medium truncate max-w-[250px]", !hasActiveFocus && "text-muted-foreground italic")}>
                                        {hasActiveFocus
                                            ? (activeTaskTitle || "Loading...")
                                            : "Select a task..."}
                                    </span>
                                </div>
                            </div>
                        </TaskSelector>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
                <Button
                    onClick={toggleTimer}
                    size="lg"
                    className="h-16 px-8 text-xl rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-lg bg-white text-black hover:bg-neutral-100"
                >
                    {isRunning ? (
                        <>
                            <Pause className="mr-2 h-6 w-6" fill="currentColor" /> Pause
                        </>
                    ) : (
                        <>
                            <Play className="mr-2 h-6 w-6" fill="currentColor" /> Start
                        </>
                    )}
                </Button>

                {/* Only show reset if timer has started or changed */}
                <Button
                    onClick={resetTimer}
                    variant="ghost"
                    size="icon"
                    className="h-16 w-16 rounded-2xl text-white hover:bg-white/10"
                    title="Reset Timer"
                >
                    <RotateCcw className="h-6 w-6" />
                </Button>
            </div>
        </div>
    );
}

"use client";

import { useTimer, TimerMode } from "@/context/TimerContext";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

export function Timer() {
    const { mode, timeLeft, isRunning, toggleTimer, switchMode, resetTimer, activeTaskId, settings } = useTimer();

    // Progress percentage for visual circle (optional, doing simple bar/color first)
    const getProgress = () => {
        // Note: Assuming default durations for calculation simplicity in this MVP step
        // In real app, use settings from hook to calculate percentage
        return 100;
    };

    const getThemeColor = () => {
        switch (mode) {
            case 'focus': return settings.focusColor || '#ef4444';
            case 'shortBreak': return settings.shortBreakColor || '#14b8a6';
            case 'longBreak': return settings.longBreakColor || '#3b82f6';
            default: return '#ef4444';
        }
    }

    const containerStyle = {
        backgroundColor: `${getThemeColor()}20`, // 20 = ~12% opacity hex
        borderColor: `${getThemeColor()}40`
    };

    return (
        <div
            className="w-full max-w-lg backdrop-blur-sm rounded-3xl p-8 shadow-xl border transition-colors duration-500"
            style={containerStyle}
        >
            {/* Mode Switcher */}
            <div className="flex justify-center gap-2 mb-8 bg-black/5 dark:bg-white/5 p-1 rounded-full w-fit mx-auto">
                {(['focus', 'shortBreak', 'longBreak'] as TimerMode[]).map((m) => (
                    <button
                        key={m}
                        onClick={() => switchMode(m)}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-sm font-medium transition-all text-muted-foreground hover:bg-white/50 dark:hover:bg-white/10"
                        )}
                        style={mode === m ? { backgroundColor: getThemeColor(), color: 'white' } : {}}
                    >
                        {m === 'focus' ? 'Focus' : m === 'shortBreak' ? 'Short Break' : 'Long Break'}
                    </button>
                ))}
            </div>

            {/* Timer Display */}
            <div className="h-64 flex flex-col items-center justify-center mb-6 relative">
                <div
                    className="text-8xl font-bold font-mono tracking-tighter tabular-nums transition-colors duration-300"
                    style={{ color: getThemeColor() }}
                >
                    {formatTime(timeLeft)}
                </div>
                <div className="mt-4 text-center">
                    <p className="text-muted-foreground font-medium text-lg">
                        {activeTaskId ? (
                            isRunning ? 'Working on Task' : 'Select "Start" to focus'
                        ) : (
                            isRunning ? 'Stay focused!' : 'Select a task or just start'
                        )}
                    </p>
                    {activeTaskId && (
                        <p className="text-sm opacity-50 mt-1">Task ID: #{activeTaskId.slice(0, 4)}</p>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
                <Button
                    onClick={toggleTimer}
                    size="lg"
                    className="h-16 px-8 text-xl rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-lg text-white"
                    style={{ backgroundColor: getThemeColor() }}
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
                    className="h-16 w-16 rounded-2xl text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5"
                    title="Reset Timer"
                >
                    <RotateCcw className="h-6 w-6" />
                </Button>
            </div>
        </div>
    );
}

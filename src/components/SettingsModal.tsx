"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Settings, Clock } from "lucide-react";
import { useTimer } from "@/context/TimerContext";
import { useState, useEffect } from "react";

export function SettingsModal() {
    const { settings, setSettings } = useTimer();
    const [localSettings, setLocalSettings] = useState(settings);
    const [open, setOpen] = useState(false);

    // Sync local state when settings change externally or modal opens
    useEffect(() => {
        if (open) {
            setLocalSettings(settings);
        }
    }, [open, settings]);

    const handleSave = () => {
        setSettings(localSettings);
        setOpen(false);
    };

    const updateDuration = (key: 'focusDuration' | 'shortBreakDuration' | 'longBreakDuration', minutes: number) => {
        setLocalSettings(prev => ({
            ...prev,
            [key]: minutes * 60
        }));
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                    <Settings className="w-4 h-4" />
                    <span className="hidden sm:inline">Settings</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-slate-500 uppercase tracking-widest text-sm font-bold border-b pb-4">
                        <Clock className="w-4 h-4" /> Timer Settings
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Timer Durations */}
                    <div>
                        <h4 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">Time (minutes)</h4>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500">Pomodoro</label>
                                <Input
                                    type="number"
                                    value={Math.floor(localSettings.focusDuration / 60)}
                                    onChange={(e) => updateDuration('focusDuration', parseInt(e.target.value) || 0)}
                                    className="bg-slate-100 dark:bg-slate-800 border-transparent"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500">Short Break</label>
                                <Input
                                    type="number"
                                    value={Math.floor(localSettings.shortBreakDuration / 60)}
                                    onChange={(e) => updateDuration('shortBreakDuration', parseInt(e.target.value) || 0)}
                                    className="bg-slate-100 dark:bg-slate-800 border-transparent"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500">Long Break</label>
                                <Input
                                    type="number"
                                    value={Math.floor(localSettings.longBreakDuration / 60)}
                                    onChange={(e) => updateDuration('longBreakDuration', parseInt(e.target.value) || 0)}
                                    className="bg-slate-100 dark:bg-slate-800 border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Toggles */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-700 dark:text-slate-200">Auto Start Breaks</span>
                            <Switch
                                checked={localSettings.autoStartBreaks}
                                onCheckedChange={(c) => setLocalSettings(prev => ({ ...prev, autoStartBreaks: c }))}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-700 dark:text-slate-200">Auto Start Pomodoros</span>
                            <Switch
                                checked={localSettings.autoStartPomodoros}
                                onCheckedChange={(c) => setLocalSettings(prev => ({ ...prev, autoStartPomodoros: c }))}
                            />
                        </div>
                    </div>

                    {/* Theme Colors */}
                    <div>
                        <h4 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">Theme Colors</h4>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500">Focus</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={localSettings.focusColor || "#ef4444"}
                                        onChange={(e) => setLocalSettings(prev => ({ ...prev, focusColor: e.target.value }))}
                                        className="h-8 w-full p-1 rounded cursor-pointer"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500">Short Break</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={localSettings.shortBreakColor || "#14b8a6"}
                                        onChange={(e) => setLocalSettings(prev => ({ ...prev, shortBreakColor: e.target.value }))}
                                        className="h-8 w-full p-1 rounded cursor-pointer"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500">Long Break</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={localSettings.longBreakColor || "#3b82f6"}
                                        onChange={(e) => setLocalSettings(prev => ({ ...prev, longBreakColor: e.target.value }))}
                                        className="h-8 w-full p-1 rounded cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                    <Button onClick={handleSave} className="bg-slate-800 text-white hover:bg-slate-700 px-8">OK</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

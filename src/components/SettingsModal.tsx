"use client";

import { useState, useEffect } from "react";
import { useTimer } from "@/context/TimerContext";
import { useTheme } from "@/context/ThemeContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings } from "lucide-react";

export function SettingsModal() {
    const { settings, setSettings } = useTimer();
    const { colorfulMode, toggleColorfulMode } = useTheme();
    const [open, setOpen] = useState(false);
    const [localSettings, setLocalSettings] = useState(settings);

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    const updateDuration = (key: keyof typeof localSettings, value: number | boolean | string) => {
        setLocalSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        setSettings(localSettings);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                    <Settings className="w-5 h-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Timer Settings</DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    {/* Theme Toggle */}
                    <div className="flex items-center justify-between">
                        <Label htmlFor="colorful-mode" className="flex flex-col gap-1">
                            <span className="font-semibold">Colorful Mode</span>
                            <span className="text-xs text-muted-foreground">Enable vibrant colors</span>
                        </Label>
                        <Switch
                            id="colorful-mode"
                            checked={colorfulMode}
                            onCheckedChange={toggleColorfulMode}
                        />
                    </div>

                    {/* Durations */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm">Durations (minutes)</h3>
                        <div className="grid gap-3">
                            <div className="flex items-center gap-3">
                                <Label htmlFor="focus" className="w-32">Focus</Label>
                                <Input
                                    id="focus"
                                    type="number"
                                    value={localSettings.focusDuration / 60}
                                    onChange={(e) => updateDuration("focusDuration", parseInt(e.target.value) * 60)}
                                    min={1}
                                    max={120}
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <Label htmlFor="short-break" className="w-32">Short Break</Label>
                                <Input
                                    id="short-break"
                                    type="number"
                                    value={localSettings.shortBreakDuration / 60}
                                    onChange={(e) => updateDuration("shortBreakDuration", parseInt(e.target.value) * 60)}
                                    min={1}
                                    max={30}
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <Label htmlFor="long-break" className="w-32">Long Break</Label>
                                <Input
                                    id="long-break"
                                    type="number"
                                    value={localSettings.longBreakDuration / 60}
                                    onChange={(e) => updateDuration("longBreakDuration", parseInt(e.target.value) * 60)}
                                    min={1}
                                    max={60}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Auto-start */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-sm">Auto-start</h3>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="auto-breaks">Auto-start Breaks</Label>
                            <Switch
                                id="auto-breaks"
                                checked={localSettings.autoStartBreaks}
                                onCheckedChange={(checked) => updateDuration("autoStartBreaks", checked)}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="auto-pomodoros">Auto-start Pomodoros</Label>
                            <Switch
                                id="auto-pomodoros"
                                checked={localSettings.autoStartPomodoros}
                                onCheckedChange={(checked) => updateDuration("autoStartPomodoros", checked)}
                            />
                        </div>
                    </div>

                    <Button onClick={handleSave} className="w-full">Save Settings</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

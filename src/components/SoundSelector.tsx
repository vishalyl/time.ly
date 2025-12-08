"use client";

import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AmbientSound } from "@/hooks/useAmbientSound";

interface SoundSelectorProps {
    selectedSound: AmbientSound;
    onSoundChange: (sound: AmbientSound) => void;
}

export function SoundSelector({ selectedSound, onSoundChange }: SoundSelectorProps) {
    const sounds: { value: AmbientSound; label: string }[] = [
        { value: "none", label: "No Sound" },
        { value: "rain", label: "Rain" },
        { value: "forest", label: "Forest" },
        { value: "whitenoise", label: "White Noise" },
    ];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-muted-foreground hover:text-foreground"
                >
                    {selectedSound === "none" ? (
                        <VolumeX className="w-5 h-5" />
                    ) : (
                        <Volume2 className="w-5 h-5" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {sounds.map((sound) => (
                    <DropdownMenuItem
                        key={sound.value}
                        onClick={() => onSoundChange(sound.value)}
                        className={selectedSound === sound.value ? "bg-accent" : ""}
                    >
                        {sound.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

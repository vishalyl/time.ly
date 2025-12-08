import { useEffect, useRef, useState } from "react";

export type AmbientSound = "none" | "rain" | "forest" | "whitenoise";

export function useAmbientSound(isPlaying: boolean, selectedSound: AmbientSound) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [volume, setVolume] = useState(0.5);

    useEffect(() => {
        if (selectedSound === "none") {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            return;
        }

        // Using free ambient sound URLs from freesound.org and other sources
        // These are royalty-free and publicly available
        const soundUrls: Record<Exclude<AmbientSound, "none">, string> = {
            rain: "https://assets.mixkit.co/active_storage/sfx/2390/2390-preview.mp3", // Rain sound
            forest: "https://assets.mixkit.co/active_storage/sfx/1210/1210-preview.mp3", // Forest birds
            whitenoise: "https://assets.mixkit.co/active_storage/sfx/2393/2393-preview.mp3" // White noise
        };

        // Clean up previous audio
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }

        // Create new audio element
        audioRef.current = new Audio(soundUrls[selectedSound]);
        audioRef.current.loop = true;
        audioRef.current.volume = volume;

        if (isPlaying) {
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(err => {
                    console.error("Audio play failed:", err);
                    // Fallback: try again after user interaction
                });
            }
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, [isPlaying, selectedSound, volume]);

    return { volume, setVolume };
}

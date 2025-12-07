// This file is now deprecated in favor of using the Context directly
// Re-exporting from context for backward compatibility if needed, 
// but best practice is to import useTimer from context/TimerContext

export { useTimer } from "@/context/TimerContext";
export type { TimerMode } from "@/context/TimerContext";

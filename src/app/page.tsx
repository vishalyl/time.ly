"use client";

import { useTimer } from "@/context/TimerContext";
import { useTheme } from "@/context/ThemeContext";
import { useGoals } from "@/hooks/useGoals";
import { Navbar } from "@/components/Navbar";
import { Timer } from "@/components/Timer";
import { DailyGoalCard } from "@/components/DailyGoalCard";
import { cn } from "@/lib/utils";

export default function Home() {
  const { mode } = useTimer();
  const { colorfulMode } = useTheme();
  const { dailyGoal, todayMinutes, loading } = useGoals();

  const getBackgroundColor = () => {
    if (colorfulMode) {
      // Colorful mode backgrounds
      switch (mode) {
        case "focus":
          return "bg-red-50 dark:bg-red-950";
        case "shortBreak":
          return "bg-teal-50 dark:bg-teal-950";
        case "longBreak":
          return "bg-blue-50 dark:bg-blue-950";
        default:
          return "bg-background";
      }
    } else {
      // Black & white mode - pure black background
      return "bg-black";
    }
  };

  return (
    <main className={cn("min-h-screen transition-colors duration-500 ease-in-out", getBackgroundColor())}>
      <Navbar />
      <div className="container max-w-screen-md mx-auto p-4 flex flex-col items-center mt-10">
        <Timer />

        {/* Daily Goal Card - only show if goal is set */}
        {dailyGoal && (
          <div className="mt-8 w-full max-w-sm">
            <DailyGoalCard dailyGoal={dailyGoal} todayMinutes={todayMinutes} />
          </div>
        )}
      </div>
    </main>
  );
}

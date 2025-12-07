"use client";

import { useTimer } from "@/context/TimerContext";
import { Navbar } from "@/components/Navbar";
import { Timer } from "@/components/Timer";
import { TaskSelector } from "@/components/TaskSelector";
import { cn } from "@/lib/utils";

export default function Home() {
  const { mode } = useTimer();

  const getBackgroundColor = () => {
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
  };

  return (
    <main className={cn("min-h-screen transition-colors duration-500 ease-in-out", getBackgroundColor())}>
      <Navbar />
      <div className="container max-w-screen-md mx-auto p-4 flex flex-col items-center mt-10">
        <Timer />
        <div className="mt-8 w-full flex justify-center">
          <TaskSelector />
        </div>
      </div>
    </main>
  );
}

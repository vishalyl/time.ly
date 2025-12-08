"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";
import Link from "next/link";

interface DailyGoalCardProps {
    dailyGoal: number; // in minutes
    todayMinutes: number;
}

export function DailyGoalCard({ dailyGoal, todayMinutes }: DailyGoalCardProps) {
    const progress = Math.min((todayMinutes / dailyGoal) * 100, 100);
    const circumference = 2 * Math.PI * 45; // radius = 45
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <Link href="/stats">
            <Card className="cursor-pointer hover:border-primary/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Daily Goal</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        {/* Circular Progress */}
                        <div className="relative w-20 h-20">
                            <svg className="w-20 h-20 transform -rotate-90">
                                {/* Background circle */}
                                <circle
                                    cx="40"
                                    cy="40"
                                    r="35"
                                    stroke="currentColor"
                                    strokeWidth="6"
                                    fill="none"
                                    className="text-muted opacity-20"
                                />
                                {/* Progress circle */}
                                <circle
                                    cx="40"
                                    cy="40"
                                    r="35"
                                    stroke="currentColor"
                                    strokeWidth="6"
                                    fill="none"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeDashoffset}
                                    className="text-primary transition-all duration-500"
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-sm font-bold">{Math.round(progress)}%</span>
                            </div>
                        </div>

                        {/* Text Info */}
                        <div>
                            <p className="text-2xl font-bold">{todayMinutes} min</p>
                            <p className="text-xs text-muted-foreground">of {dailyGoal} min goal</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}

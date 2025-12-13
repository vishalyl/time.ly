"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Flame, Target, TrendingUp, Clock } from "lucide-react";
import { useGoals } from "@/hooks/useGoals";

export default function StatsPage() {
    const { dailyGoal, todayMinutes, currentStreak, longestStreak, setDailyGoal, deleteDailyGoal, loading } = useGoals();
    const [goalInput, setGoalInput] = useState("");
    const [isSettingGoal, setIsSettingGoal] = useState(false);

    // This will be calculated from real data in the future
    const weeklyMinutes = 0;

    const handleSetGoal = async () => {
        const minutes = parseInt(goalInput);
        if (minutes > 0) {
            await setDailyGoal(minutes);
            setIsSettingGoal(false);
            setGoalInput("");
        }
    };

    const handleDeleteGoal = async () => {
        await deleteDailyGoal();
    };

    const goalProgress = dailyGoal ? Math.min((todayMinutes / dailyGoal) * 100, 100) : 0;

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="max-w-6xl mx-auto p-4 md:p-8">
                    <div className="text-center py-12">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="max-w-6xl mx-auto p-4 md:p-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">Statistics</h1>
                    <p className="text-muted-foreground">Track your progress and maintain your streak</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                    {/* Current Streak */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                            <Flame className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{currentStreak} days</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {currentStreak > 0 ? "Keep it going!" : "Start focusing to build a streak"}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Longest Streak */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Longest Streak</CardTitle>
                            <TrendingUp className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{longestStreak} days</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {longestStreak > 0 ? "Personal best" : "No streak yet"}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Today's Focus */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Today's Focus</CardTitle>
                            <Clock className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{Math.round(todayMinutes)} min</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {dailyGoal ? `${Math.round(goalProgress)}% of goal` : "No goal set"}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Weekly Focus */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">This Week</CardTitle>
                            <Target className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{weeklyMinutes} min</div>
                            <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Daily Goal Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daily Goal</CardTitle>
                        <CardDescription>Set a daily focus time goal to stay motivated</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {dailyGoal ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-2xl font-bold">{dailyGoal} minutes</p>
                                        <p className="text-sm text-muted-foreground">Daily target</p>
                                    </div>
                                    <Button variant="destructive" size="sm" onClick={handleDeleteGoal}>
                                        Delete Goal
                                    </Button>
                                </div>

                                {/* Progress Bar */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Progress</span>
                                        <span>{Math.round(todayMinutes)} / {dailyGoal} min</span>
                                    </div>
                                    <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                                        <div
                                            className="bg-primary h-full transition-all duration-500 rounded-full"
                                            style={{ width: `${goalProgress}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : isSettingGoal ? (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="goal">Daily Goal (minutes)</Label>
                                    <Input
                                        id="goal"
                                        type="number"
                                        placeholder="e.g., 120"
                                        value={goalInput}
                                        onChange={(e) => setGoalInput(e.target.value)}
                                        min={1}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={handleSetGoal}>Set Goal</Button>
                                    <Button variant="outline" onClick={() => setIsSettingGoal(false)}>
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <Button onClick={() => setIsSettingGoal(true)}>
                                <Target className="w-4 h-4 mr-2" />
                                Set Daily Goal
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

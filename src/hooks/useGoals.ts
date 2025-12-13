import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { doc, onSnapshot, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface UserGoal {
    dailyGoalMinutes: number | null;
    todayMinutes: number;
    lastResetDate: string | null; // YYYY-MM-DD format
    currentStreak: number;
    longestStreak: number;
}

export function useGoals() {
    const { user } = useAuth();
    const [goal, setGoal] = useState<UserGoal>({
        dailyGoalMinutes: null,
        todayMinutes: 0,
        lastResetDate: null,
        currentStreak: 0,
        longestStreak: 0
    });
    const [loading, setLoading] = useState(true);

    // Helper to get today's date in YYYY-MM-DD format
    const getTodayString = () => {
        const now = new Date();
        return now.toISOString().split('T')[0];
    };

    // Check and reset daily progress if it's a new day
    const checkAndResetDaily = async (data: any) => {
        const today = getTodayString();
        const lastReset = data.lastResetDate || null;

        if (lastReset !== today) {
            console.log("🔄 New day detected! Resetting daily progress...");
            console.log("Previous date:", lastReset, "Current date:", today);

            // Check if yesterday's goal was met (for streak tracking)
            const previousMinutes = data.todayMinutes || 0;
            const dailyGoal = data.dailyGoalMinutes || null;
            let newCurrentStreak = data.currentStreak || 0;
            let newLongestStreak = data.longestStreak || 0;

            if (dailyGoal && lastReset) {
                // Only update streak if there was a previous day being tracked
                if (previousMinutes >= dailyGoal) {
                    // Goal achieved! Increment streak
                    newCurrentStreak += 1;
                    console.log("🔥 Goal achieved! Streak:", newCurrentStreak);
                } else {
                    // Goal missed, reset streak
                    console.log("❌ Goal missed. Resetting streak.");
                    newCurrentStreak = 0;
                }

                // Update longest streak if current exceeds it
                if (newCurrentStreak > newLongestStreak) {
                    newLongestStreak = newCurrentStreak;
                }
            }

            // Update Firestore with reset values
            try {
                await setDoc(doc(db, "user_settings", user!.uid), {
                    userId: user!.uid,
                    dailyGoalMinutes: dailyGoal,
                    todayMinutes: 0,
                    lastResetDate: today,
                    currentStreak: newCurrentStreak,
                    longestStreak: newLongestStreak,
                    updatedAt: serverTimestamp()
                }, { merge: true });
                console.log("✅ Daily reset complete!");
            } catch (error) {
                console.error("❌ Failed to reset daily progress:", error);
            }
        }
    };

    useEffect(() => {
        if (!user) {
            setGoal({
                dailyGoalMinutes: null,
                todayMinutes: 0,
                lastResetDate: null,
                currentStreak: 0,
                longestStreak: 0
            });
            setLoading(false);
            return;
        }

        // Use the same pattern as projects/tasks - top-level collection with real-time listener
        const userGoalDoc = doc(db, "user_settings", user.uid);

        const unsubscribe = onSnapshot(
            userGoalDoc,
            async (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const data = docSnapshot.data();

                    // Check if we need to reset for a new day
                    await checkAndResetDaily(data);

                    // After potential reset, get the latest data
                    const latestDoc = await getDoc(docSnapshot.ref);
                    const latestData = latestDoc.data() || data;

                    setGoal({
                        dailyGoalMinutes: latestData.dailyGoalMinutes || null,
                        todayMinutes: latestData.todayMinutes || 0,
                        lastResetDate: latestData.lastResetDate || null,
                        currentStreak: latestData.currentStreak || 0,
                        longestStreak: latestData.longestStreak || 0
                    });
                } else {
                    // Document doesn't exist yet, use defaults
                    setGoal({
                        dailyGoalMinutes: null,
                        todayMinutes: 0,
                        lastResetDate: null,
                        currentStreak: 0,
                        longestStreak: 0
                    });
                }
                setLoading(false);
            },
            (error) => {
                console.error("Error fetching goal:", error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user]);

    const setDailyGoal = async (minutes: number) => {
        if (!user) {
            alert("Please log in to set a goal");
            return;
        }

        try {
            const userGoalDoc = doc(db, "user_settings", user.uid);
            const today = getTodayString();
            await setDoc(userGoalDoc, {
                userId: user.uid,
                dailyGoalMinutes: minutes,
                todayMinutes: goal.todayMinutes,
                lastResetDate: goal.lastResetDate || today,
                currentStreak: goal.currentStreak,
                longestStreak: goal.longestStreak,
                updatedAt: serverTimestamp()
            }, { merge: true });
            // No need to manually update state - onSnapshot will handle it
        } catch (error: any) {
            console.error("Error setting goal:", error);
            alert("Failed to set goal: " + error.message);
        }
    };

    const deleteDailyGoal = async () => {
        if (!user) {
            alert("Please log in to delete a goal");
            return;
        }

        try {
            const userGoalDoc = doc(db, "user_settings", user.uid);
            await setDoc(userGoalDoc, {
                userId: user.uid,
                dailyGoalMinutes: null,
                todayMinutes: goal.todayMinutes,
                lastResetDate: goal.lastResetDate,
                currentStreak: goal.currentStreak,
                longestStreak: goal.longestStreak,
                updatedAt: serverTimestamp()
            }, { merge: true });
            // No need to manually update state - onSnapshot will handle it
        } catch (error: any) {
            console.error("Error deleting goal:", error);
            alert("Failed to delete goal: " + error.message);
        }
    };

    return {
        dailyGoal: goal.dailyGoalMinutes,
        todayMinutes: goal.todayMinutes,
        currentStreak: goal.currentStreak,
        longestStreak: goal.longestStreak,
        setDailyGoal,
        deleteDailyGoal,
        loading
    };
}

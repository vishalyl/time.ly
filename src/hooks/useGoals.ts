import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface UserGoal {
    dailyGoalMinutes: number | null;
    todayMinutes: number;
}

export function useGoals() {
    const { user } = useAuth();
    const [goal, setGoal] = useState<UserGoal>({ dailyGoalMinutes: null, todayMinutes: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setGoal({ dailyGoalMinutes: null, todayMinutes: 0 });
            setLoading(false);
            return;
        }

        // Use the same pattern as projects/tasks - top-level collection with real-time listener
        const userGoalDoc = doc(db, "user_settings", user.uid);

        const unsubscribe = onSnapshot(
            userGoalDoc,
            (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const data = docSnapshot.data();
                    setGoal({
                        dailyGoalMinutes: data.dailyGoalMinutes || null,
                        todayMinutes: data.todayMinutes || 0
                    });
                } else {
                    // Document doesn't exist yet, use defaults
                    setGoal({ dailyGoalMinutes: null, todayMinutes: 0 });
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
            await setDoc(userGoalDoc, {
                userId: user.uid,
                dailyGoalMinutes: minutes,
                todayMinutes: goal.todayMinutes,
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
        setDailyGoal,
        deleteDailyGoal,
        loading
    };
}

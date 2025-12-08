import { useState, useEffect } from "react";
import { useTimer } from "@/context/TimerContext";
import { collection, query, where, getDocs, documentId } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function useActiveTask() {
    const { activeTaskId, activeProjectId } = useTimer();
    const [activeTaskTitle, setActiveTaskTitle] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchFocusItem = async () => {
            setLoading(true);
            setActiveTaskTitle(null);

            try {
                if (activeTaskId) {
                    const q = query(collection(db, "tasks"), where(documentId(), "==", activeTaskId));
                    const snapshot = await getDocs(q);
                    if (!snapshot.empty) {
                        setActiveTaskTitle(snapshot.docs[0].data().title);
                    } else {
                        setActiveTaskTitle("Unknown Task");
                    }
                } else if (activeProjectId) {
                    // Fetch Project Name
                    const q = query(collection(db, "projects"), where(documentId(), "==", activeProjectId));
                    const snapshot = await getDocs(q);
                    if (!snapshot.empty) {
                        setActiveTaskTitle(`${snapshot.docs[0].data().name}`);
                    } else {
                        setActiveTaskTitle("Unknown Project");
                    }
                }
            } catch (error) {
                console.error("Error fetching active item:", error);
                setActiveTaskTitle("Error loading...");
            } finally {
                setLoading(false);
            }
        };

        fetchFocusItem();
    }, [activeTaskId, activeProjectId]);

    return { activeTaskTitle, loading };
}

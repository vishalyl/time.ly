import { useState, useEffect } from "react";
import {
    collection,
    query,
    where,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp,
    orderBy
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

export interface Project {
    id: string;
    name: string;
    color: string;
    userId: string;
    createdAt?: any;
}

export const useProjects = () => {
    const { user } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setProjects([]);
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, "projects"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const projectsData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Project[];
            setProjects(projectsData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const addProject = async (name: string, color: string = "#ef4444") => {
        if (!user) return;
        await addDoc(collection(db, "projects"), {
            name,
            color,
            userId: user.uid,
            createdAt: serverTimestamp(),
        });
    };

    const deleteProject = async (id: string) => {
        await deleteDoc(doc(db, "projects", id));
    };

    return { projects, loading, addProject, deleteProject };
};

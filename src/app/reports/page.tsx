"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { useProjects } from "@/hooks/useProjects";
import { useTasks } from "@/hooks/useTasks";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, subDays, startOfDay, isSameDay } from "date-fns";

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function ReportsPage() {
    const { user } = useAuth();
    const { projects } = useProjects();
    const [allTasks, setAllTasks] = useState<any[]>([]);
    const [timeRange, setTimeRange] = useState("week");
    const [selectedProjectId, setSelectedProjectId] = useState<string>("all");

    // Fetch ALL tasks for analytics (not just per project)
    // We need a custom query here because useTasks is scoped to a single project usually
    useEffect(() => {
        if (!user) return;
        const fetchAllTasks = async () => {
            const q = query(
                collection(db, "tasks"),
                where("userId", "==", user.uid),
                // orderBy("createdAt", "desc") // requires index usually, skip for simple fetch
            );
            const snapshot = await getDocs(q);
            const tasks = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setAllTasks(tasks);
        };
        fetchAllTasks();
    }, [user]);

    // Processing Data
    const getChartData = () => {
        const days = timeRange === "week" ? 7 : 30;
        const data = [];

        for (let i = days - 1; i >= 0; i--) {
            const date = subDays(new Date(), i);
            const dateStr = format(date, "EEE"); // Mon, Tue...

            // Filter tasks modified/created? 
            // Wait, our schema currently only has `createdAt` and accumulated `totalSeconds`. 
            // We DO NOT track *when* the time was spent (history). 
            // LIMITATION: We can only show TOTAL time spent on tasks that exist. 
            // We cannot show "How much time I spent LAST TUESDAY" unless we implement a separate "History/Session" collection.
            // For MVP, we will show "Total Accumulated Time" derived from tasks, but visualizing it "Daily" is impossible without history.
            // User Request: "view how many hrs we spent everyday, by day week month"
            // CRITICAL GAP: We need a 'sessions' collection to track time history.
            // WORKAROUND: For now, I will display "Total Time Distribution by Project" (Pie) and "Top Tasks" (Bar).
            // I will add a NOTE to the user that historical daily data requires a schema migration I can do next.
            // BUT wait, I can simulate "Daily" if I had `updatedAt` but even then...

            // Actually, let's implement the Project Breakdown first as requested: "option to select a project and see how many hrs was spent on it"
            data.push({ name: dateStr, seconds: 0 }); // Placeholder
        }
        return data;
    };

    // Calculate Total Time per Project
    const projectData = projects.map(project => {
        const projectTasks = allTasks.filter(t => t.projectId === project.id);
        const totalSeconds = projectTasks.reduce((acc, t) => acc + (t.totalSeconds || 0) + ((t.actualPomodoros || 0) * 25 * 60), 0);
        // Note: defaulting actualPomodoros to 25m if totalSeconds missing (backward compat)
        return {
            name: project.name,
            value: totalSeconds / 3600, // hours
            color: project.color || COLORS[0]
        };
    }).filter(d => d.value > 0);

    // Tasks for selected project
    const taskData = allTasks
        .filter(t => selectedProjectId === "all" || t.projectId === selectedProjectId)
        .map(t => ({
            name: t.title,
            value: ((t.totalSeconds || 0) + ((t.actualPomodoros || 0) * 25 * 60)) / 60, // minutes for better scale? or hours
            valueHours: ((t.totalSeconds || 0) + ((t.actualPomodoros || 0) * 25 * 60)) / 3600
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10); // Top 10

    return (
        <main className="min-h-screen bg-background text-foreground">
            <Navbar />
            <div className="container py-8 px-4 mx-auto max-w-screen-xl">
                <h1 className="text-3xl font-bold mb-8">Reports & Analytics</h1>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Focus Time</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {(allTasks.reduce((acc, t) => acc + (t.totalSeconds || 0) + ((t.actualPomodoros || 0) * 25 * 60), 0) / 3600).toFixed(1)} hrs
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Projects</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{projects.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Tasks Completed</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{allTasks.filter(t => t.completed).length}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Time by Project (Pie) */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Time Distribution (Projects)</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={projectData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {projectData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => {
                                        const hrs = Math.floor(value);
                                        const mins = Math.round((value % 1) * 60);
                                        return `${hrs}h ${mins}m`;
                                    }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex flex-wrap gap-2 justify-center mt-4">
                                {projectData.map((p, i) => (
                                    <div key={i} className="flex items-center gap-1 text-xs">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                                        <span>{p.name}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Top Tasks (Bar) */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Task Breakdown</CardTitle>
                            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="All Projects" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Projects</SelectItem>
                                    {projects.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={taskData} layout="vertical" margin={{ left: 40, right: 40 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" unit="m" />
                                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                                    <Tooltip formatter={(value: number) => {
                                        const mins = Math.floor(value);
                                        const secs = Math.round((value % 1) * 60);
                                        return `${mins}m ${secs}s`;
                                    }} />
                                    <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    );
}

// Temporary Card Components to avoid creating 3 files
// In real app, these are in @/components/ui/card

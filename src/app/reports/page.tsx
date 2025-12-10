"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { useProjects } from "@/hooks/useProjects";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];

export default function ReportsPage() {
    const { user } = useAuth();
    const { projects } = useProjects();
    const [allTasks, setAllTasks] = useState<any[]>([]);
    const [timeRange, setTimeRange] = useState("week"); // daily, week, month, year
    const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
    const [userTodayMinutes, setUserTodayMinutes] = useState<number>(0);

    // Fetch ALL tasks and user settings
    useEffect(() => {
        if (!user) return;
        const fetchData = async () => {
            // Fetch tasks
            const q = query(collection(db, "tasks"), where("userId", "==", user.uid));
            const snapshot = await getDocs(q);
            const tasks = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setAllTasks(tasks);

            // Fetch user settings to get total today minutes
            const userSettingsDoc = doc(db, "user_settings", user.uid);
            const userSettingsSnap = await getDoc(userSettingsDoc);
            if (userSettingsSnap.exists()) {
                const data = userSettingsSnap.data();
                setUserTodayMinutes(data.todayMinutes || 0);
            }
        };
        fetchData();
    }, [user]);

    // --- Data Processing ---

    // 1. Filter Tasks by Date (Placeholder Logic)
    // Since we don't have session history yet, we can't filter seconds by date.
    // We will use ALL tasks for now.
    const filteredTasks = allTasks;

    // 2. Calculate Total Output
    const totalSeconds = filteredTasks.reduce((acc, t) => {
        return acc + ((t.totalSeconds || 0) > 0 ? t.totalSeconds : ((t.actualPomodoros || 0) * 25 * 60));
    }, 0);

    // 3. Project Distribution Data
    const projectDistData = projects.map(p => {
        const pTasks = filteredTasks.filter(t => t.projectId === p.id);
        const pSeconds = pTasks.reduce((acc, t) => acc + ((t.totalSeconds || 0) > 0 ? t.totalSeconds : ((t.actualPomodoros || 0) * 25 * 60)), 0);
        return {
            id: p.id,
            name: p.name,
            value: pSeconds,
            color: p.color || COLORS[0]
        };
    }).filter(d => d.value > 0);

    // Calculate unassigned time (time tracked without a project)
    const totalProjectSeconds = projectDistData.reduce((acc, p) => acc + p.value, 0);
    const userTodaySeconds = userTodayMinutes * 60;
    const unassignedSeconds = Math.max(0, userTodaySeconds - totalProjectSeconds);

    // Debug logging
    console.log("📊 Reports Debug:");
    console.log("  User today minutes:", userTodayMinutes);
    console.log("  User today seconds:", userTodaySeconds);
    console.log("  Total project seconds:", totalProjectSeconds);
    console.log("  Unassigned seconds:", unassignedSeconds);

    // Add "No Project Selected" to distribution if there's unassigned time
    const finalProjectDistData = [...projectDistData];
    if (unassignedSeconds > 0) {
        finalProjectDistData.push({
            id: 'unassigned',
            name: 'No Project Selected',
            value: unassignedSeconds,
            color: '#6b7280' // Gray color for unassigned
        });
        console.log("  ✅ Added 'No Project Selected' to chart");
    } else {
        console.log("  ⚠️ No unassigned time to display");
    }

    // 4. Task Distribution Data (for selected project)
    const selectedProjectTasks = selectedProjectId && selectedProjectId !== 'all'
        ? filteredTasks.filter(t => t.projectId === selectedProjectId)
        : [];

    const taskDistData = selectedProjectTasks.map(t => ({
        name: t.title,
        value: (t.totalSeconds || 0) > 0 ? t.totalSeconds : ((t.actualPomodoros || 0) * 25 * 60)
    })).filter(d => d.value > 0).sort((a, b) => b.value - a.value).slice(0, 10); // Top 10

    // Tooltip Formatter
    const formatTooltip = (value: number) => {
        const h = Math.floor(value / 3600);
        const m = Math.floor((value % 3600) / 60);
        const s = value % 60;
        return `${h}h ${m}m ${s}s`;
    };

    return (
        <main className="min-h-screen bg-background text-foreground pb-12">
            <Navbar />
            <div className="container py-8 px-4 mx-auto max-w-screen-xl">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <h1 className="text-3xl font-bold">Analytics</h1>

                    {/* Time Range Filter */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">Range:</span>
                        <Select value={timeRange} onValueChange={setTimeRange}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select Range" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="daily">Daily (Today)</SelectItem>
                                <SelectItem value="week">Weekly</SelectItem>
                                <SelectItem value="month">Monthly</SelectItem>
                                <SelectItem value="year">Yearly</SelectItem>
                                <SelectItem value="all">All Time</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Box 1: Total Focus Summary */}
                    <Card className="lg:col-span-1 h-fit">
                        <CardHeader>
                            <CardTitle>Total Focus</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center py-8">
                            <div className="text-5xl font-bold tracking-tighter mb-2">
                                {(totalSeconds / 3600).toFixed(1)}
                                <span className="text-2xl text-muted-foreground ml-1">hrs</span>
                            </div>
                            <p className="text-muted-foreground text-center mb-6">
                                Total time focused across all projects in this period.
                            </p>

                            <div className="w-full space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Tasks Completed</span>
                                    <span className="font-bold">{filteredTasks.filter(t => t.completed).length}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Projects Active</span>
                                    <span className="font-bold">{projects.length}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Box 2: Project Distribution */}
                    <Card className="lg:col-span-1 min-h-[400px]">
                        <CardHeader>
                            <CardTitle>Projects Distribution</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px] relative">
                            {finalProjectDistData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={finalProjectDistData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={2}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {finalProjectDistData.map((entry, index) => (
                                                <Cell key={entry.id} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={formatTooltip}
                                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                                            itemStyle={{ color: '#f8fafc' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground">No data</div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Box 3: Task Breakdown (New) */}
                    <Card className="lg:col-span-1 min-h-[400px]">
                        <CardHeader>
                            <div className="flex flex-col gap-2">
                                <CardTitle>Task Breakdown</CardTitle>
                                <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select a Project" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Select a Project...</SelectItem>
                                        {projects.map(p => (
                                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            {selectedProjectId !== 'all' && taskDistData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={taskDistData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={2}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {taskDistData.map((entry, index) => (
                                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={formatTooltip}
                                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                                            itemStyle={{ color: '#f8fafc' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground text-center px-4">
                                    {selectedProjectId === 'all'
                                        ? "Select a project above to see task breakdown"
                                        : "No time tracked on this project yet"}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    );
}

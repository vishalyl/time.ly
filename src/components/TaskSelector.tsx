"use client";

import { useState } from "react";
import { useProjects } from "@/hooks/useProjects";
import { useTasks } from "@/hooks/useTasks";
import { useTimer } from "@/context/TimerContext";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, ChevronRight, ListTodo, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function TaskSelector() {
    const { projects } = useProjects();
    const { activeTaskId, setActiveTaskId } = useTimer();
    const [open, setOpen] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

    // Get selected task details if any
    const activeProject = projects.find(p =>
        // We'd ideally need a way to look up project by task, but for now we iterate
        // This is a bit inefficient but for MVP with small data it's fine.
        // Actually, we can just display "Task Selected" if we don't have the title easily available without fetching all tasks.
        // Optimization: In a real app we'd fetch the single active task or store task title in context.
        // For now, let's just show "Select Task" or the ID.
        // IMPROVEMENT: Let's fetch the task title? No, `useTasks` requires projectId. 
        // We will stick to the selection flow.
        true
    );

    const handleTaskSelect = (taskId: string) => {
        setActiveTaskId(taskId);
        setOpen(false);
        setSelectedProjectId(null); // Reset view
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <div className="flex flex-col items-center mt-8 cursor-pointer group">
                    {activeTaskId ? (
                        <div className="flex items-center gap-3 bg-white/50 dark:bg-slate-800/50 px-6 py-3 rounded-xl border border-border transition-all hover:bg-white/80 dark:hover:bg-slate-800">
                            <CheckCircle2 className="w-5 h-5 text-red-500" />
                            <div>
                                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-[10px] block mb-0.5">Current Task</span>
                                <span className="font-bold text-slate-700 dark:text-slate-200">
                                    Task #{activeTaskId.slice(0, 4)}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <Button variant="outline" size="lg" className="gap-2 text-lg h-auto py-3 px-6 rounded-xl border-dashed border-2 hover:border-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20">
                            <ListTodo className="w-5 h-5" />
                            Select Task to Focus
                        </Button>
                    )}
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md h-[500px] flex flex-col p-0 gap-0 overflow-hidden">
                <DialogHeader className="p-4 border-b">
                    <DialogTitle className="flex items-center gap-2">
                        {selectedProjectId ? (
                            <Button variant="ghost" size="sm" className="-ml-2 h-8 w-8 p-0" onClick={() => setSelectedProjectId(null)}>
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        ) : (
                            <ListTodo className="w-5 h-5 text-red-500" />
                        )}
                        {selectedProjectId ? "Select Task" : "Select Project"}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-2">
                    {!selectedProjectId ? (
                        // Project List
                        <div className="space-y-1">
                            {projects.length === 0 && (
                                <div className="text-center py-12 text-muted-foreground">
                                    No projects found.
                                    <br />
                                    <span className="text-xs">Go to Projects page to create one.</span>
                                </div>
                            )}
                            {projects.map(project => (
                                <div
                                    key={project.id}
                                    onClick={() => setSelectedProjectId(project.id)}
                                    className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: project.color || '#94a3b8' }} />
                                        <span className="font-medium">{project.name}</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        // Task List for Project
                        <TaskListSelector projectId={selectedProjectId} onSelect={handleTaskSelect} />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function TaskListSelector({ projectId, onSelect }: { projectId: string; onSelect: (id: string) => void }) {
    const { tasks } = useTasks(projectId);

    if (tasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-60">
                <p>No tasks in this project</p>
            </div>
        );
    }

    return (
        <div className="space-y-1">
            {tasks.map(task => (
                <div
                    key={task.id}
                    onClick={() => onSelect(task.id)}
                    className={cn(
                        "flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors",
                        task.completed && "opacity-50"
                    )}
                >
                    {task.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                        <Circle className="w-4 h-4 text-slate-300" />
                    )}
                    <span className={cn("text-sm", task.completed && "line-through")}>
                        {task.title}
                    </span>
                    <span className="ml-auto text-xs font-mono text-muted-foreground bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded">
                        {task.actualPomodoros}/{task.estimatedPomodoros}
                    </span>
                </div>
            ))}
        </div>
    );
}

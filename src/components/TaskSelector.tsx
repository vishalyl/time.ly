"use client";

import { useState } from "react";
import { useProjects } from "@/hooks/useProjects";
import { useTasks } from "@/hooks/useTasks";
import { useTimer } from "@/context/TimerContext";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, ChevronRight, ListTodo, ArrowLeft, Target } from "lucide-react";
import { cn } from "@/lib/utils";

export function TaskSelector({ children }: { children?: React.ReactNode }) {
    const { projects } = useProjects();
    const { activeTaskId, setActiveTaskId, activeProjectId, setActiveProjectId } = useTimer();
    const [open, setOpen] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

    const handleTaskSelect = (taskId: string) => {
        setActiveTaskId(taskId);
        setOpen(false);
        setSelectedProjectId(null);
    };

    const handleProjectSelect = (projectId: string) => {
        setActiveProjectId(projectId);
        setActiveTaskId(null); // Clear specific task
        setOpen(false);
        setSelectedProjectId(null);
    };

    const handleJustFocus = () => {
        setActiveProjectId(null);
        setActiveTaskId(null);
        setOpen(false);
        setSelectedProjectId(null);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children ? children : (
                    <div className="flex flex-col items-center mt-8 cursor-pointer group">
                        <Button variant="outline" size="lg" className="gap-2 text-lg h-auto py-3 px-6 rounded-xl border-dashed border-2 hover:border-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20">
                            <ListTodo className="w-5 h-5" />
                            Select Task to Focus
                        </Button>
                    </div>
                )}
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
                            <div
                                onClick={handleJustFocus}
                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors border-b border-border/50 mb-2"
                            >
                                <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                                <span className="font-medium italic text-muted-foreground">Just Focus (No Project/Task)</span>
                            </div>

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
                                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                                >
                                    <div
                                        className="flex-1 flex items-center gap-3 cursor-pointer p-1"
                                        onClick={() => setSelectedProjectId(project.id)}
                                    >
                                        <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: project.color || '#94a3b8' }} />
                                        <span className="font-medium">{project.name}</span>
                                    </div>

                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-xs h-7 px-2 text-muted-foreground hover:text-primary hover:bg-primary/10 gap-1"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleProjectSelect(project.id);
                                        }}
                                    >
                                        <Target className="w-3 h-3" /> Focus
                                    </Button>
                                    <div onClick={() => setSelectedProjectId(project.id)} className="cursor-pointer p-1">
                                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        // Task List for Project
                        <TaskListSelector projectId={selectedProjectId} onSelect={handleTaskSelect} onProjectSelect={() => handleProjectSelect(selectedProjectId)} />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function TaskListSelector({ projectId, onSelect, onProjectSelect }: { projectId: string; onSelect: (id: string) => void, onProjectSelect: () => void }) {
    const { tasks } = useTasks(projectId);

    return (
        <div className="space-y-1">
            {/* Focus on Project Option */}
            <div
                onClick={onProjectSelect}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors border-b border-border/50 mb-2"
            >
                <Target className="w-4 h-4 text-primary" />
                <span className="font-medium text-primary">Focus on Project Only</span>
            </div>

            {tasks.length === 0 && (
                <div className="flex flex-col items-center justify-center p-8 text-muted-foreground opacity-60">
                    <p>No tasks in this project</p>
                </div>
            )}

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

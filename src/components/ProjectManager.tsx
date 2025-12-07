"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { cn } from "@/lib/utils";

export function ProjectManager({ children }: { children?: React.ReactNode }) {
    const { projects, addProject, deleteProject } = useProjects();
    const [newProjectName, setNewProjectName] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleCreateProject = async () => {
        if (!newProjectName.trim()) return;
        await addProject(newProjectName);
        setNewProjectName("");
        setIsDialogOpen(false);
    };

    return (
        <div className="w-full max-w-screen-md mx-auto mt-12 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-border p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Projects</h3>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="gap-2">
                            <Plus className="w-4 h-4" />
                            Add Project
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Project</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <Input
                                placeholder="Project Name"
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleCreateProject()}
                            />
                            <Button onClick={handleCreateProject}>Create Project</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="space-y-4">
                {projects.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-md">
                        No projects yet. Create one to get started!
                    </div>
                )}

                {projects.map((project) => (
                    <div key={project.id} className="border rounded-md p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-lg flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color || '#ef4444' }} />
                                {project.name}
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hover:text-destructive"
                                onClick={() => deleteProject(project.id)}
                            >
                                Delete
                            </Button>
                        </div>
                        {/* Task list will go here */}
                        <TaskList projectId={project.id} />
                    </div>
                ))}
            </div>
        </div>
    );
}

// Inline TaskList for now to keep things simple
import { useTasks } from "@/hooks/useTasks";
import { CheckCircle2, Circle, Trash2, MoreVertical } from "lucide-react";

import { useTimer } from "@/context/TimerContext";

function TaskList({ projectId }: { projectId: string }) {
    const { tasks, addTask, toggleTaskComplete, deleteTask } = useTasks(projectId);
    const { activeTaskId, setActiveTaskId } = useTimer();
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    const handleAddTask = async () => {
        if (!newTaskTitle.trim()) return;
        await addTask(newTaskTitle);
        setNewTaskTitle("");
        setIsAdding(false);
    };

    return (
        <div className="mt-4 pl-4 border-l-2 border-slate-100 dark:border-slate-800">
            <div className="space-y-2">
                {tasks.map((task) => (
                    <div
                        key={task.id}
                        className={cn(
                            "flex items-center justify-between group p-2 rounded hover:bg-white dark:hover:bg-slate-700 cursor-pointer border-l-4 border-transparent transition-all",
                            activeTaskId === task.id ? "bg-white dark:bg-slate-700 border-l-red-500 shadow-sm" : ""
                        )}
                        onClick={() => setActiveTaskId(task.id)}
                    >
                        <div className="flex items-center gap-3">
                            <button onClick={(e) => { e.stopPropagation(); toggleTaskComplete(task.id, !task.completed); }}>
                                {task.completed ? (
                                    <CheckCircle2 className="w-5 h-5 text-red-500" />
                                ) : (
                                    <Circle className="w-5 h-5 text-slate-300 hover:text-red-500" />
                                )}
                            </button>
                            <span className={cn("text-sm", task.completed && "line-through text-muted-foreground", activeTaskId === task.id && "font-medium")}>
                                {task.title}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-xs font-mono text-muted-foreground">{task.actualPomodoros}/{task.estimatedPomodoros}</span>
                            <button onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }} className="text-muted-foreground hover:text-destructive">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {isAdding ? (
                <div className="mt-2 flex gap-2">
                    <Input
                        autoFocus
                        placeholder="What are you working on?"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                        className="h-9"
                    />
                    <Button size="sm" onClick={handleAddTask}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                </div>
            ) : (
                <button
                    onClick={() => setIsAdding(true)}
                    className="mt-2 text-sm font-bold text-black/20 dark:text-white/20 hover:text-red-400 dark:hover:text-red-400 flex items-center gap-2 py-2 w-full border-2 border-dashed border-transparent hover:border-red-200 rounded-md transition-all"
                >
                    <Plus className="w-4 h-4" /> Add Task
                </button>
            )}
        </div>
    );
}

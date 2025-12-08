"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Folder, ChevronDown, ChevronRight, Trash2, CheckCircle2, Circle } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { useTasks } from "@/hooks/useTasks";
import { useTimer } from "@/context/TimerContext";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export function ProjectManager({ children }: { children?: React.ReactNode }) {
    const { projects, addProject, deleteProject } = useProjects();
    const [newProjectName, setNewProjectName] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogKey, setDialogKey] = useState(0);

    const handleCreateProject = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!newProjectName.trim()) return;

        await addProject(newProjectName);
        setNewProjectName("");
        setIsDialogOpen(false);
        setDialogKey(prev => prev + 1);
    };

    const handleDialogChange = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) {
            setNewProjectName("");
            setDialogKey(prev => prev + 1);
        }
    };

    return (
        <div className="w-full max-w-screen-xl mx-auto mt-8 p-4">
            {/* Create Project Button */}
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Projects</h1>
                    <p className="text-muted-foreground mt-1">Organize your tasks and track progress</p>
                </div>
                <Button
                    onClick={() => setIsDialogOpen(true)}
                    className="bg-white text-black hover:bg-neutral-100"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    New Project
                </Button>
            </div>

            {/* Modern Dialog */}
            <Dialog key={dialogKey} open={isDialogOpen} onOpenChange={handleDialogChange}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">Create New Project</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateProject} className="space-y-6 pt-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Project Name</label>
                            <Input
                                placeholder="e.g., Website Redesign"
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                                autoFocus
                                className="h-12 text-base"
                            />
                        </div>
                        <div className="flex gap-3">
                            <Button
                                type="submit"
                                className="flex-1 h-11 bg-white text-black hover:bg-neutral-100"
                            >
                                Create Project
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                                className="h-11"
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Projects Grid - Square Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.length === 0 && (
                    <div className="col-span-full text-center py-20 text-muted-foreground">
                        <Folder className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <p className="text-lg">No projects yet</p>
                        <p className="text-sm mt-1">Click "New Project" to get started</p>
                    </div>
                )}

                {projects.map((project) => (
                    <ProjectCard
                        key={project.id}
                        project={project}
                        onDelete={() => deleteProject(project.id)}
                    />
                ))}
            </div>
        </div>
    );
}

function ProjectCard({ project, onDelete }: { project: any, onDelete: () => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const { tasks, addTask, toggleTaskComplete, deleteTask } = useTasks(project.id);
    const { activeTaskId, setActiveTaskId } = useTimer();
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    const handleAddTask = async () => {
        if (!newTaskTitle.trim()) return;
        const titleToAdd = newTaskTitle;
        setNewTaskTitle("");
        setIsAdding(false);
        try {
            await addTask(titleToAdd);
        } catch (err) {
            console.error("Failed to add task", err);
        }
    };

    const completedCount = tasks.filter(t => t.completed).length;
    const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

    return (
        <Card className="overflow-hidden border-2 border-white/10 hover:border-white/20 transition-all">
            {/* Square Header */}
            <div
                className="aspect-square p-6 flex flex-col justify-between cursor-pointer bg-gradient-to-br from-neutral-900 to-black hover:from-neutral-800 hover:to-neutral-900 transition-all"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex justify-between items-start">
                    <Folder className="w-8 h-8 text-white" />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white/60 hover:text-red-500 hover:bg-white/10 h-8 w-8"
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>

                <div>
                    <h3 className="font-bold text-xl text-white mb-2 line-clamp-2">{project.name}</h3>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-white/60">{tasks.length} tasks</span>
                        <span className="text-white/60">{progress}%</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-white/10 rounded-full h-1.5 mt-2">
                        <div
                            className="bg-white rounded-full h-1.5 transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Tasks List (Expandable) */}
            {isOpen && (
                <div className="p-4 bg-black/40 border-t border-white/10">
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {tasks.map((task) => (
                            <div
                                key={task.id}
                                className={cn(
                                    "flex items-center justify-between group p-2 rounded-lg transition-all cursor-pointer",
                                    activeTaskId === task.id
                                        ? "bg-white/10"
                                        : "hover:bg-white/5"
                                )}
                                onClick={() => setActiveTaskId(task.id)}
                            >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleTaskComplete(task.id, !task.completed); }}
                                        className="text-white/40 hover:text-white transition-colors flex-shrink-0"
                                    >
                                        {task.completed ? (
                                            <CheckCircle2 className="w-4 h-4 text-white" />
                                        ) : (
                                            <Circle className="w-4 h-4" />
                                        )}
                                    </button>
                                    <span className={cn("text-sm text-white truncate", task.completed && "line-through text-white/40")}>
                                        {task.title}
                                    </span>
                                </div>

                                <button
                                    onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                                    className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all text-white/40 flex-shrink-0"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Add Task */}
                    <div className="mt-3 pt-3 border-t border-white/10">
                        {isAdding ? (
                            <div className="flex gap-2">
                                <Input
                                    autoFocus
                                    placeholder="Task name..."
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                                    className="h-9 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                                />
                                <Button onClick={handleAddTask} size="sm" className="bg-white text-black hover:bg-neutral-100">Add</Button>
                            </div>
                        ) : (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-white/60 hover:text-white hover:bg-white/5 w-full"
                                onClick={() => setIsAdding(true)}
                            >
                                <Plus className="w-4 h-4 mr-2" /> Add Task
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </Card>
    );
}

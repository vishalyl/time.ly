import { ProjectManager } from "@/components/ProjectManager";
import { Navbar } from "@/components/Navbar";

export default function ProjectsPage() {
    return (
        <main className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-500">
            <Navbar />
            <div className="container flex-1 py-12 px-4 md:px-8">
                <h1 className="text-3xl font-bold mb-8 text-center text-slate-800 dark:text-slate-100">
                    Project Management
                </h1>
                <p className="text-center text-muted-foreground mb-8 max-w-lg mx-auto">
                    Create and organize your projects here. Select tasks in the main Timer page to track your focus sessions.
                </p>
                <ProjectManager />
            </div>
        </main>
    );
}

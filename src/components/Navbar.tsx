"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, User as UserIcon, Menu, X } from "lucide-react";
import { SettingsModal } from "@/components/SettingsModal";

export function Navbar() {
    const { user, signInWithGoogle, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <nav className="w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4 md:px-8">
                <div className="flex items-center gap-6">
                    {/* Mobile Menu Toggle */}
                    <div className="md:hidden">
                        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </Button>
                    </div>

                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-neutral-800 rounded-md flex items-center justify-center text-white font-bold text-lg">
                            T
                        </div>
                        <span className="font-bold text-lg hidden md:block">
                            Time.ly
                        </span>
                    </Link>

                    <div className="hidden md:flex gap-4">
                        <Link
                            href="/projects"
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Projects
                        </Link>
                        <Link
                            href="/reports"
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Reports
                        </Link>
                        <Link
                            href="/stats"
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Stats
                        </Link>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <SettingsModal />

                    {user ? (
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium hidden sm:block">
                                {user.displayName?.split(" ")[0]}
                            </span>
                            {user.photoURL ? (
                                <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full border border-border" />
                            ) : (
                                <UserIcon className="w-6 h-6" />
                            )}
                            <Button onClick={logout} variant="ghost" size="icon" title="Logout">
                                <LogOut className="w-4 h-4 text-muted-foreground" />
                            </Button>
                        </div>
                    ) : (
                        <Button onClick={signInWithGoogle} variant="default" size="sm" className="gap-2 bg-red-500 hover:bg-red-600 text-white">
                            <LogIn className="w-4 h-4" />
                            <span className="hidden sm:inline">Login</span>
                        </Button>
                    )}
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t p-4 bg-background">
                    <div className="flex flex-col space-y-4">
                        <Link
                            href="/projects"
                            className="text-sm font-medium p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Projects
                        </Link>
                        <Link
                            href="/reports"
                            className="text-sm font-medium p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Reports
                        </Link>
                        <Link
                            href="/stats"
                            className="text-sm font-medium p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Stats
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}

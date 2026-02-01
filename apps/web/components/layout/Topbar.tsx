"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Moon, Sun, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useState, useEffect } from "react";

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

export function Topbar() {
    const { setTheme } = useTheme();
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // Load user from localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error('Failed to parse user data:', error);
            }
        }
    }, []);

    const handleLogout = async () => {
        setIsLoggingOut(true);

        try {
            // Try to call logout API
            await api.post('/auth/logout');
        } catch (error: any) {
            // Log error but don't block logout
            console.error('Logout API call failed:', error);
            // Continue with local cleanup regardless of API response
        }

        // Always clear local data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        sessionStorage.clear();

        // Always redirect to login
        router.push('/login');
        setIsLoggingOut(false);
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getRoleLabel = (role: string) => {
        const labels: Record<string, string> = {
            'principal': 'Principal',
            'office': 'Office Admin',
            'teacher': 'Teacher',
            'student': 'Student',
            'parent': 'Parent',
        };
        return labels[role] || role;
    };

    return (
        <div className="flex h-16 items-center border-b bg-background px-6 justify-between">
            <div className="font-medium">
                Welcome back, {user?.name || 'User'}
            </div>
            <div className="flex items-center space-x-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                            <span className="sr-only">Toggle theme</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setTheme("light")}>
                            Light
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("dark")}>
                            Dark
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("system")}>
                            System
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src="/avatars/01.png" alt={user?.name || 'User'} />
                                <AvatarFallback>{user?.name ? getInitials(user.name) : 'U'}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {user?.email || 'user@octoschool.com'}
                                </p>
                                {user?.role && (
                                    <p className="text-xs leading-none text-muted-foreground mt-1">
                                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                            {getRoleLabel(user.role)}
                                        </span>
                                    </p>
                                )}
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-red-500 focus:text-red-500 cursor-pointer"
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            {isLoggingOut ? 'Logging out...' : 'Log out'}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}

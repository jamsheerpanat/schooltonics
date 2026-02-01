"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    BookOpen,
    Calendar,
    DollarSign,
    FileBarChart,
    Megaphone,
    Building2,
    Clock,
    UserCheck,
    School,
    Settings,
    Home,
    ClipboardList,
    Award,
    TrendingUp
} from "lucide-react";
import { useEffect, useState } from "react";

interface Route {
    label: string;
    icon: any;
    href: string;
    roles: string[];
    children?: Route[];
}

export function Sidebar() {
    const pathname = usePathname();
    const [userRole, setUserRole] = useState<string>('');

    useEffect(() => {
        // Get user role from localStorage
        const user = localStorage.getItem('user');
        if (user) {
            try {
                const userData = JSON.parse(user);
                setUserRole(userData.role || '');
            } catch (error) {
                console.error('Failed to parse user data:', error);
            }
        }
    }, []);

    // Comprehensive route configuration for all roles
    const allRoutes: Route[] = [
        // Principal Routes
        {
            label: "Dashboard",
            icon: LayoutDashboard,
            href: "/principal/health",
            roles: ["principal"],
        },
        {
            label: "Reports",
            icon: FileBarChart,
            href: "/principal/reports",
            roles: ["principal"],
        },

        // Office Routes
        {
            label: "Dashboard",
            icon: Home,
            href: "/office/announcements",
            roles: ["office"],
        },
        {
            label: "Academic",
            icon: School,
            href: "/office/academic",
            roles: ["office", "principal"],
        },
        {
            label: "Students",
            icon: Users,
            href: "/office/students",
            roles: ["office", "principal"],
        },
        {
            label: "Teachers",
            icon: GraduationCap,
            href: "/office/teachers",
            roles: ["office", "principal"],
        },
        {
            label: "Subjects",
            icon: BookOpen,
            href: "/office/subjects",
            roles: ["office", "principal"],
        },
        {
            label: "Timetable",
            icon: Clock,
            href: "/office/timetable",
            roles: ["office", "principal", "teacher"],
        },
        {
            label: "Announcements",
            icon: Megaphone,
            href: "/office/announcements",
            roles: ["office", "principal"],
        },
        {
            label: "Calendar",
            icon: Calendar,
            href: "/office/calendar",
            roles: ["office", "principal", "teacher"],
        },
        {
            label: "Fees",
            icon: DollarSign,
            href: "/office/fees",
            roles: ["office", "principal"],
        },
        {
            label: "Reports",
            icon: FileBarChart,
            href: "/office/reports",
            roles: ["office", "principal"],
        },

        // Teacher Routes
        {
            label: "Dashboard",
            icon: LayoutDashboard,
            href: "/teacher",
            roles: ["teacher"],
        },
        {
            label: "Attendance",
            icon: UserCheck,
            href: "/teacher/attendance",
            roles: ["teacher"],
        },
        {
            label: "My Classes",
            icon: Users,
            href: "/teacher/classes",
            roles: ["teacher"],
        },
        {
            label: "Assignments",
            icon: ClipboardList,
            href: "/teacher/assignments",
            roles: ["teacher"],
        },
        {
            label: "Gradebook",
            icon: Award,
            href: "/teacher/gradebook",
            roles: ["teacher"],
        },
        {
            label: "Communications",
            icon: Megaphone,
            href: "/teacher/messages",
            roles: ["teacher"],
        },
        {
            label: "Analytics",
            icon: TrendingUp,
            href: "/teacher/analytics",
            roles: ["teacher"],
        },
        {
            label: "My Timetable",
            icon: Clock,
            href: "/teacher/timetable",
            roles: ["teacher"],
        },

        // Student Routes
        {
            label: "Dashboard",
            icon: Home,
            href: "/student/today",
            roles: ["student"],
        },
        {
            label: "Today",
            icon: Calendar,
            href: "/student/today",
            roles: ["student"],
        },
        {
            label: "Timetable",
            icon: Clock,
            href: "/student/timetable",
            roles: ["student"],
        },
        {
            label: "Assignments",
            icon: ClipboardList,
            href: "/student/assignments",
            roles: ["student"],
        },
        {
            label: "Grades",
            icon: Award,
            href: "/student/grades",
            roles: ["student"],
        },
        {
            label: "Attendance",
            icon: UserCheck,
            href: "/student/attendance",
            roles: ["student"],
        },

        // Parent Routes
        {
            label: "Dashboard",
            icon: Home,
            href: "/parent",
            roles: ["parent"],
        },
        {
            label: "My Children",
            icon: Users,
            href: "/parent/children",
            roles: ["parent"],
        },
        {
            label: "Attendance",
            icon: UserCheck,
            href: "/parent/attendance",
            roles: ["parent"],
        },
        {
            label: "Grades",
            icon: Award,
            href: "/parent/grades",
            roles: ["parent"],
        },
        {
            label: "Fees",
            icon: DollarSign,
            href: "/parent/fees",
            roles: ["parent"],
        },
        {
            label: "Announcements",
            icon: Megaphone,
            href: "/parent/announcements",
            roles: ["parent"],
        },
    ];

    // Filter routes based on user role
    const routes = allRoutes.filter(route =>
        route.roles.includes(userRole)
    );

    // Remove duplicate dashboard entries (keep only first one)
    const uniqueRoutes = routes.filter((route, index, self) =>
        index === self.findIndex(r => r.href === route.href)
    );

    const isActive = (href: string) => {
        if (href === pathname) return true;
        if (pathname.startsWith(href) && href !== '/') return true;
        return false;
    };

    return (
        <div className="flex h-full w-64 flex-col border-r bg-card text-card-foreground">
            <div className="flex h-16 items-center border-b px-6">
                <Link href="/" className="flex items-center gap-2">
                    <School className="h-6 w-6 text-primary" />
                    <h1 className="text-xl font-bold tracking-tight">OctoSchool</h1>
                </Link>
            </div>

            {/* User Role Badge */}
            {userRole && (
                <div className="px-4 py-3 border-b">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-bold text-primary uppercase">
                                {userRole[0]}
                            </span>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Logged in as</p>
                            <p className="text-sm font-medium capitalize">{userRole}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-auto py-4">
                <nav className="grid items-start px-4 text-sm font-medium space-y-1">
                    {uniqueRoutes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                        >
                            <Button
                                variant={isActive(route.href) ? "secondary" : "ghost"}
                                className={cn(
                                    "w-full justify-start",
                                    isActive(route.href) && "bg-secondary font-semibold"
                                )}
                            >
                                <route.icon className="mr-2 h-4 w-4" />
                                {route.label}
                            </Button>
                        </Link>
                    ))}
                </nav>
            </div>

            {/* Settings Section */}
            <div className="border-t p-4 space-y-2">
                <Link href="/settings">
                    <Button variant="ghost" className="w-full justify-start">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                    </Button>
                </Link>
            </div>
        </div>
    );
}

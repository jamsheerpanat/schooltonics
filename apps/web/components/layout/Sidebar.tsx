"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, School, Settings, LogOut, Megaphone, Calendar, DollarSign, FileBarChart } from "lucide-react";

export function Sidebar() {
    const pathname = usePathname();

    const routes = [
        {
            label: "Dashboard",
            icon: LayoutDashboard,
            href: "/principal/health",
            active: pathname === "/principal/health",
        },
        {
            label: "Announcements",
            icon: Megaphone,
            href: "/office/announcements",
            active: pathname === "/office/announcements",
        },
        {
            label: "Calendar",
            icon: Calendar,
            href: "/office/calendar",
            active: pathname === "/office/calendar",
        },
        {
            label: "Fee Management",
            icon: DollarSign,
            href: "/office/fees",
            active: pathname.startsWith("/office/fees"),
        },
        {
            label: "Staff & Students",
            icon: Users,
            href: "/office",
            active: pathname === "/office",
        },
        {
            label: "Reports",
            icon: FileBarChart,
            href: "/office/reports",
            active: pathname.startsWith("/office/reports"),
        },
    ];

    return (
        <div className="flex h-full w-64 flex-col border-r bg-card text-card-foreground">
            <div className="flex h-16 items-center border-b px-6">
                <h1 className="text-xl font-bold tracking-tight">OctoSchool</h1>
            </div>
            <div className="flex-1 overflow-auto py-4">
                <nav className="grid items-start px-4 text-sm font-medium space-y-2">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                        >
                            <Button
                                variant={route.active ? "secondary" : "ghost"}
                                className={cn("w-full justify-start", route.active && "bg-secondary")}
                            >
                                <route.icon className="mr-2 h-4 w-4" />
                                {route.label}
                            </Button>
                        </Link>
                    ))}
                </nav>
            </div>
            <div className="border-t p-4">
                <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Button>
            </div>
        </div>
    );
}

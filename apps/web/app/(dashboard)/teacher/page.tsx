'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Users,
    BookOpen,
    ClipboardList,
    TrendingUp,
    Calendar,
    Clock,
    Bell,
    Award
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { toast } from "sonner";

interface DashboardData {
    stats: {
        total_classes: number;
        total_students: number;
        pending_assignments: number;
        attendance_rate: number;
    };
    today_schedule: Array<{
        id: number;
        subject: string;
        subject_code: string;
        section: string;
        period: string;
        start_time: string;
        end_time: string;
    }>;
    recent_activity: any[];
    academic_year: {
        id: number;
        name: string;
    };
}

export default function TeacherDashboardPage() {
    const [dashboard, setDashboard] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        fetchDashboard();

        // Update time every minute
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);

        return () => clearInterval(timer);
    }, []);

    const fetchDashboard = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/teacher/dashboard');
            setDashboard(response.data);
        } catch (error) {
            console.error('Failed to fetch dashboard:', error);
            toast.error('Failed to load dashboard');
        } finally {
            setIsLoading(false);
        }
    };

    const getCurrentPeriod = () => {
        if (!dashboard?.today_schedule) return null;

        const now = currentTime.getHours() * 60 + currentTime.getMinutes();

        return dashboard.today_schedule.find(period => {
            const [startHour, startMin] = period.start_time.split(':').map(Number);
            const [endHour, endMin] = period.end_time.split(':').map(Number);
            const start = startHour * 60 + startMin;
            const end = endHour * 60 + endMin;

            return now >= start && now < end;
        });
    };

    const currentPeriod = getCurrentPeriod();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Welcome Back, Teacher!</h1>
                    <p className="text-muted-foreground">
                        {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <Bell className="h-4 w-4 mr-2" />
                        Notifications
                    </Button>
                </div>
            </div>

            {/* Current Period Alert */}
            {currentPeriod && (
                <Card className="border-primary bg-primary/5">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
                                    <Clock className="h-6 w-6 text-primary-foreground" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Current Class</p>
                                    <h3 className="text-xl font-bold">{currentPeriod.subject} - {currentPeriod.section}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {currentPeriod.period} • {currentPeriod.start_time} - {currentPeriod.end_time}
                                    </p>
                                </div>
                            </div>
                            <Link href={`/teacher/attendance`}>
                                <Button>
                                    Mark Attendance
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">My Classes</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dashboard?.stats.total_classes || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Active sections
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        <BookOpen className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dashboard?.stats.total_students || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Across all classes
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Work</CardTitle>
                        <ClipboardList className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dashboard?.stats.pending_assignments || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Assignments to grade
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dashboard?.stats.attendance_rate || 0}%</div>
                        <p className="text-xs text-muted-foreground">
                            This month
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Today's Schedule */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Today's Schedule</CardTitle>
                            <CardDescription>
                                {currentTime.toLocaleDateString('en-US', { weekday: 'long' })}
                            </CardDescription>
                        </div>
                        <Link href="/teacher/timetable">
                            <Button variant="outline" size="sm">
                                <Calendar className="h-4 w-4 mr-2" />
                                Full Timetable
                            </Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8 text-muted-foreground">Loading schedule...</div>
                    ) : dashboard?.today_schedule && dashboard.today_schedule.length > 0 ? (
                        <div className="space-y-3">
                            {dashboard.today_schedule.map((period) => (
                                <div
                                    key={period.id}
                                    className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${currentPeriod?.id === period.id
                                            ? 'bg-primary/10 border-primary'
                                            : 'hover:bg-accent'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="text-center">
                                            <p className="text-xs text-muted-foreground">{period.period}</p>
                                            <p className="text-sm font-medium">{period.start_time}</p>
                                            <p className="text-xs text-muted-foreground">{period.end_time}</p>
                                        </div>
                                        <div>
                                            <p className="font-medium">{period.subject}</p>
                                            <p className="text-sm text-muted-foreground">{period.section}</p>
                                        </div>
                                    </div>
                                    <Badge variant={currentPeriod?.id === period.id ? 'default' : 'outline'}>
                                        {period.subject_code}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            No classes scheduled for today
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common tasks and shortcuts</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <Link href="/teacher/classes">
                            <Button variant="outline" className="w-full justify-start h-auto py-4">
                                <div className="flex flex-col items-start gap-1">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        <span className="font-medium">My Classes</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">View all sections</span>
                                </div>
                            </Button>
                        </Link>

                        <Link href="/teacher/assignments">
                            <Button variant="outline" className="w-full justify-start h-auto py-4">
                                <div className="flex flex-col items-start gap-1">
                                    <div className="flex items-center gap-2">
                                        <ClipboardList className="h-4 w-4" />
                                        <span className="font-medium">Assignments</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">Create & manage</span>
                                </div>
                            </Button>
                        </Link>

                        <Link href="/teacher/gradebook">
                            <Button variant="outline" className="w-full justify-start h-auto py-4">
                                <div className="flex flex-col items-start gap-1">
                                    <div className="flex items-center gap-2">
                                        <Award className="h-4 w-4" />
                                        <span className="font-medium">Gradebook</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">Enter grades</span>
                                </div>
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

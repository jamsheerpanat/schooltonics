'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, BookOpen, ClipboardList, Bell } from "lucide-react";

export default function StudentTodayPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Today's Schedule</h1>
                <p className="text-muted-foreground">
                    Welcome back! Here's your schedule for today.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Classes Today
                        </CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">6</div>
                        <p className="text-xs text-muted-foreground">
                            Next: Mathematics at 9:00 AM
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Homework Due
                        </CardTitle>
                        <ClipboardList className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">3</div>
                        <p className="text-xs text-muted-foreground">
                            2 due this week
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Attendance
                        </CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">95%</div>
                        <p className="text-xs text-muted-foreground">
                            This semester
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Announcements
                        </CardTitle>
                        <Bell className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2</div>
                        <p className="text-xs text-muted-foreground">
                            New this week
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Today's Timetable</CardTitle>
                        <CardDescription>Your classes for today</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { time: "8:00 - 9:00", subject: "English", teacher: "Ms. Johnson", room: "Room 101" },
                                { time: "9:00 - 10:00", subject: "Mathematics", teacher: "Mr. Smith", room: "Room 205" },
                                { time: "10:00 - 11:00", subject: "Science", teacher: "Dr. Brown", room: "Lab 1" },
                                { time: "11:00 - 12:00", subject: "History", teacher: "Mrs. Davis", room: "Room 302" },
                                { time: "13:00 - 14:00", subject: "Physical Education", teacher: "Coach Wilson", room: "Gym" },
                                { time: "14:00 - 15:00", subject: "Art", teacher: "Ms. Taylor", room: "Art Studio" },
                            ].map((period, index) => (
                                <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">{period.subject}</p>
                                        <p className="text-sm text-muted-foreground">{period.teacher} • {period.room}</p>
                                    </div>
                                    <div className="text-sm text-muted-foreground">{period.time}</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Upcoming Homework</CardTitle>
                        <CardDescription>Assignments due soon</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { subject: "Mathematics", title: "Chapter 5 Exercises", due: "Tomorrow", status: "pending" },
                                { subject: "English", title: "Essay on Shakespeare", due: "In 2 days", status: "pending" },
                                { subject: "Science", title: "Lab Report", due: "Friday", status: "in-progress" },
                            ].map((homework, index) => (
                                <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">{homework.title}</p>
                                        <p className="text-sm text-muted-foreground">{homework.subject}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium">{homework.due}</p>
                                        <p className={`text-xs ${homework.status === 'pending' ? 'text-yellow-600' : 'text-blue-600'
                                            }`}>
                                            {homework.status === 'pending' ? 'Not started' : 'In progress'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

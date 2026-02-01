'use client';

import { use, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    ArrowLeft,
    Users,
    Calendar,
    BookOpen,
    Award,
    TrendingUp,
    User
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { toast } from "sonner";

interface ClassDetail {
    section: {
        id: number;
        name: string;
        grade: string;
        section: string;
        capacity: number;
        student_count: number;
    };
    students: Array<{
        id: number;
        name_en: string;
        student_no: string;
        gender: string;
        roll_no: string;
    }>;
}

export default function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [classDetail, setClassDetail] = useState<ClassDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchClassDetail();
    }, [id]);

    const fetchClassDetail = async () => {
        setIsLoading(true);
        try {
            const response = await api.get(`/teacher/classes/${id}`);
            setClassDetail(response.data);
        } catch (error) {
            console.error('Failed to fetch class detail:', error);
            toast.error('Failed to load class details');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="text-lg font-medium">Loading class details...</div>
                </div>
            </div>
        );
    }

    if (!classDetail) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="text-lg font-medium">Class not found</div>
                    <Link href="/teacher/classes">
                        <Button className="mt-4">Back to Classes</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const { section, students } = classDetail;
    const maleCount = students.filter(s => s.gender === 'male').length;
    const femaleCount = students.filter(s => s.gender === 'female').length;

    const getInitials = (name: string) => {
        const parts = name?.split(' ') || ['S'];
        return parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : parts[0][0];
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/teacher/classes">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{section.name}</h1>
                        <p className="text-muted-foreground">
                            {section.student_count} students enrolled
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link href={`/teacher/attendance?section=${id}`}>
                        <Button variant="outline" size="sm">
                            <Calendar className="h-4 w-4 mr-2" />
                            Mark Attendance
                        </Button>
                    </Link>
                    <Link href={`/teacher/assignments/new?section=${id}`}>
                        <Button size="sm">
                            <BookOpen className="h-4 w-4 mr-2" />
                            New Assignment
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{students.length}</div>
                        <p className="text-xs text-muted-foreground">
                            {section.capacity ? `of ${section.capacity} capacity` : 'Enrolled'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Male Students</CardTitle>
                        <User className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{maleCount}</div>
                        <p className="text-xs text-muted-foreground">
                            {students.length > 0 ? Math.round((maleCount / students.length) * 100) : 0}% of class
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Female Students</CardTitle>
                        <User className="h-4 w-4 text-pink-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{femaleCount}</div>
                        <p className="text-xs text-muted-foreground">
                            {students.length > 0 ? Math.round((femaleCount / students.length) * 100) : 0}% of class
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Performance</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">85%</div>
                        <p className="text-xs text-muted-foreground">
                            This semester
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="students" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="students">
                        <Users className="h-4 w-4 mr-2" />
                        Students
                    </TabsTrigger>
                    <TabsTrigger value="assignments">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Assignments
                    </TabsTrigger>
                    <TabsTrigger value="grades">
                        <Award className="h-4 w-4 mr-2" />
                        Grades
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="students" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Student Roster</CardTitle>
                            <CardDescription>
                                All students enrolled in this section
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {students.length > 0 ? (
                                <div className="grid gap-3 md:grid-cols-2">
                                    {students.map((student) => (
                                        <Link
                                            key={student.id}
                                            href={`/office/students/${student.id}`}
                                            className="block"
                                        >
                                            <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                                    {getInitials(student.name_en)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate">{student.name_en}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Roll: {student.roll_no} • {student.student_no}
                                                    </p>
                                                </div>
                                                <Badge variant={student.gender === 'male' ? 'default' : 'secondary'}>
                                                    {student.gender}
                                                </Badge>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    No students enrolled in this section
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="assignments" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Class Assignments</CardTitle>
                            <CardDescription>Assignments for this section</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8">
                                <Link href={`/teacher/assignments?section=${id}`}>
                                    <Button>
                                        <BookOpen className="mr-2 h-4 w-4" />
                                        View All Assignments
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="grades" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Gradebook</CardTitle>
                            <CardDescription>Student grades and performance</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8">
                                <Link href={`/teacher/gradebook?section=${id}`}>
                                    <Button>
                                        <Award className="mr-2 h-4 w-4" />
                                        Open Gradebook
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

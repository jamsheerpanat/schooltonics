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
    User,
    TrendingUp,
    Clock
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { toast } from "sonner";

interface Section {
    id: number;
    name: string;
    capacity?: number;
    grade: {
        id: number;
        name: string;
    };
}

export default function SectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [section, setSection] = useState<Section | null>(null);
    const [students, setStudents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchSectionDetails();
    }, [id]);

    const fetchSectionDetails = async () => {
        setIsLoading(true);
        try {
            // Fetch section info from academic structure
            const structureResponse = await api.get('/academic/structure');
            const sectionData = structureResponse.data.sections.find((s: Section) => s.id === parseInt(id));
            setSection(sectionData);

            // Fetch students for this section
            const studentsResponse = await api.get('/students');
            const sectionStudents = studentsResponse.data.filter((student: any) =>
                student.enrollments?.some((e: any) => e.section.id === parseInt(id))
            );
            setStudents(sectionStudents);
        } catch (error) {
            console.error('Failed to fetch section details:', error);
            toast.error('Failed to load section details');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="text-lg font-medium">Loading section details...</div>
                </div>
            </div>
        );
    }

    if (!section) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="text-lg font-medium">Section not found</div>
                    <Link href="/office/academic">
                        <Button className="mt-4">Back to Academic</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const getInitials = (name: string) => {
        const parts = name?.split(' ') || ['S'];
        return parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : parts[0][0];
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/office/academic">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {section.grade.name} - Section {section.name}
                        </h1>
                        <p className="text-muted-foreground">
                            Capacity: {section.capacity || 30} students
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link href={`/office/timetable/section/${section.id}`}>
                        <Button variant="outline" size="sm">
                            <Calendar className="h-4 w-4 mr-2" />
                            View Timetable
                        </Button>
                    </Link>
                    <Button size="sm">
                        <Users className="h-4 w-4 mr-2" />
                        Manage Students
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
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
                        <div className="text-2xl font-bold">
                            {students.filter(s => s.gender === 'male').length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {students.length > 0 ? Math.round((students.filter(s => s.gender === 'male').length / students.length) * 100) : 0}% of class
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Female Students</CardTitle>
                        <User className="h-4 w-4 text-pink-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {students.filter(s => s.gender === 'female').length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {students.length > 0 ? Math.round((students.filter(s => s.gender === 'female').length / students.length) * 100) : 0}% of class
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">95%</div>
                        <p className="text-xs text-muted-foreground">
                            This month
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
                    <TabsTrigger value="timetable">
                        <Clock className="h-4 w-4 mr-2" />
                        Timetable
                    </TabsTrigger>
                    <TabsTrigger value="teachers">
                        <User className="h-4 w-4 mr-2" />
                        Teachers
                    </TabsTrigger>
                    <TabsTrigger value="subjects">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Subjects
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="students" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Student List</CardTitle>
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
                                                    <p className="text-sm text-muted-foreground">{student.student_no}</p>
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

                <TabsContent value="timetable" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Class Timetable</CardTitle>
                            <CardDescription>Weekly schedule for this section</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8">
                                <Link href={`/office/timetable/section/${section.id}`}>
                                    <Button>
                                        <Calendar className="mr-2 h-4 w-4" />
                                        View Full Timetable
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="teachers" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Subject Teachers</CardTitle>
                            <CardDescription>Teachers assigned to this section</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8 text-muted-foreground">
                                Teacher assignments will be displayed here
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="subjects" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Subjects</CardTitle>
                            <CardDescription>Subjects taught in this section</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8 text-muted-foreground">
                                Subject list will be displayed here
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

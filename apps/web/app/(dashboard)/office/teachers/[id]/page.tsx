'use client';

import { use, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    ArrowLeft,
    User,
    Phone,
    Mail,
    Calendar,
    BookOpen,
    Clock,
    Award,
    Edit,
    Download
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { toast } from "sonner";

interface Teacher {
    id: number;
    name: string;
    email: string;
    role: string;
    status?: string;
}

export default function TeacherDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [teacher, setTeacher] = useState<Teacher | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchTeacher();
    }, [id]);

    const fetchTeacher = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/teachers');
            const teacherData = response.data.find((t: Teacher) => t.id === parseInt(id));
            setTeacher(teacherData);
        } catch (error) {
            console.error('Failed to fetch teacher:', error);
            toast.error('Failed to load teacher details');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="text-lg font-medium">Loading teacher details...</div>
                </div>
            </div>
        );
    }

    if (!teacher) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="text-lg font-medium">Teacher not found</div>
                    <Link href="/office/teachers">
                        <Button className="mt-4">Back to Teachers</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const getInitials = (name: string) => {
        const parts = name?.split(' ') || ['T'];
        return parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : parts[0][0];
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/office/teachers">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{teacher.name}</h1>
                        <p className="text-muted-foreground">{teacher.role}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                    <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                    </Button>
                </div>
            </div>

            {/* Teacher Profile Card */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-start gap-6">
                        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white font-bold text-3xl">
                            {getInitials(teacher.name)}
                        </div>
                        <div className="flex-1">
                            <div className="grid gap-4 md:grid-cols-3">
                                <div>
                                    <p className="text-sm text-muted-foreground">Full Name</p>
                                    <p className="font-medium">{teacher.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-medium">{teacher.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Role</p>
                                    <Badge>{teacher.role}</Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <Badge variant={(teacher.status || 'active') === 'active' ? 'default' : 'secondary'}>
                                        {teacher.status || 'active'}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Phone</p>
                                    <p className="font-medium">+1 234 567 8900</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Department</p>
                                    <p className="font-medium">Academic</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Classes</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">5</div>
                        <p className="text-xs text-muted-foreground">
                            Assigned sections
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Subjects</CardTitle>
                        <Award className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">3</div>
                        <p className="text-xs text-muted-foreground">
                            Teaching subjects
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Students</CardTitle>
                        <User className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">150</div>
                        <p className="text-xs text-muted-foreground">
                            Total students
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Teaching Hours</CardTitle>
                        <Clock className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">24</div>
                        <p className="text-xs text-muted-foreground">
                            Hours per week
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="assignments" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="assignments">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Assignments
                    </TabsTrigger>
                    <TabsTrigger value="timetable">
                        <Calendar className="h-4 w-4 mr-2" />
                        Timetable
                    </TabsTrigger>
                    <TabsTrigger value="qualifications">
                        <Award className="h-4 w-4 mr-2" />
                        Qualifications
                    </TabsTrigger>
                    <TabsTrigger value="performance">
                        <Clock className="h-4 w-4 mr-2" />
                        Performance
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="assignments" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Teaching Assignments</CardTitle>
                            <CardDescription>Classes and subjects assigned to this teacher</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {[
                                    { grade: 'Grade 10', section: 'A', subject: 'Mathematics', hours: 5 },
                                    { grade: 'Grade 10', section: 'B', subject: 'Mathematics', hours: 5 },
                                    { grade: 'Grade 9', section: 'A', subject: 'Mathematics', hours: 4 },
                                ].map((assignment, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div>
                                            <p className="font-medium">
                                                {assignment.grade} - Section {assignment.section}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {assignment.subject}
                                            </p>
                                        </div>
                                        <Badge variant="outline">
                                            {assignment.hours} hrs/week
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="timetable" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Weekly Timetable</CardTitle>
                            <CardDescription>Teacher's class schedule</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8">
                                <Link href={`/office/timetable/teacher/${teacher.id}`}>
                                    <Button>
                                        <Calendar className="mr-2 h-4 w-4" />
                                        View Full Timetable
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="qualifications" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Qualifications & Certifications</CardTitle>
                            <CardDescription>Educational background and certificates</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {[
                                    { degree: 'Master of Education', institution: 'University of Education', year: '2018' },
                                    { degree: 'Bachelor of Science in Mathematics', institution: 'State University', year: '2015' },
                                    { degree: 'Teaching Certificate', institution: 'Education Board', year: '2016' },
                                ].map((qual, index) => (
                                    <div key={index} className="p-4 border rounded-lg">
                                        <p className="font-medium">{qual.degree}</p>
                                        <p className="text-sm text-muted-foreground">{qual.institution}</p>
                                        <Badge variant="outline" className="mt-2">{qual.year}</Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="performance" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Performance Metrics</CardTitle>
                            <CardDescription>Teaching effectiveness and student outcomes</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8 text-muted-foreground">
                                Performance metrics will be displayed here
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

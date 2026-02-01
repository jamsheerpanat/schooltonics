'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Users,
    Search,
    BookOpen,
    Calendar,
    TrendingUp,
    ChevronRight
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { toast } from "sonner";

interface ClassItem {
    id: number;
    section_id: number;
    section_name: string;
    subject: string;
    subject_code: string;
    student_count: number;
}

export default function TeacherClassesPage() {
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/teacher/classes');
            setClasses(response.data);
        } catch (error) {
            console.error('Failed to fetch classes:', error);
            toast.error('Failed to load classes');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredClasses = classes.filter(cls =>
        cls.section_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cls.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cls.subject_code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalStudents = classes.reduce((sum, cls) => sum + cls.student_count, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Classes</h1>
                    <p className="text-muted-foreground">
                        Manage your assigned sections and students
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{classes.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Active sections
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        <Users className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalStudents}</div>
                        <p className="text-xs text-muted-foreground">
                            Across all classes
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Class Size</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {classes.length > 0 ? Math.round(totalStudents / classes.length) : 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Students per class
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <Card>
                <CardHeader>
                    <CardTitle>Class Directory</CardTitle>
                    <CardDescription>Search and view all your assigned classes</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by section, subject, or code..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Classes List */}
            {isLoading ? (
                <div className="text-center py-12">
                    <div className="text-lg font-medium">Loading classes...</div>
                </div>
            ) : filteredClasses.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredClasses.map((classItem) => (
                        <Link key={classItem.id} href={`/teacher/classes/${classItem.section_id}`}>
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-lg">{classItem.section_name}</CardTitle>
                                            <CardDescription className="mt-1">
                                                {classItem.subject}
                                            </CardDescription>
                                        </div>
                                        <Badge variant="outline">{classItem.subject_code}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Users className="h-4 w-4" />
                                                <span>{classItem.student_count} students</span>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    window.location.href = `/teacher/attendance?section=${classItem.section_id}`;
                                                }}
                                            >
                                                <Calendar className="h-3 w-3 mr-1" />
                                                Attendance
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    window.location.href = `/teacher/assignments?section=${classItem.section_id}`;
                                                }}
                                            >
                                                <BookOpen className="h-3 w-3 mr-1" />
                                                Assign
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="py-12">
                        <div className="text-center text-muted-foreground">
                            {searchQuery ? 'No classes match your search' : 'No classes assigned'}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

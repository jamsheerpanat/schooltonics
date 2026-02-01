'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    GraduationCap,
    Users,
    BookOpen,
    Calendar,
    Plus,
    Settings,
    TrendingUp,
    Building2
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { toast } from "sonner";

interface AcademicStructure {
    academic_years: Array<{
        id: number;
        name: string;
        is_active: boolean;
        start_date: string;
        end_date: string;
    }>;
    grades: Array<{
        id: number;
        name: string;
        sections_count?: number;
    }>;
    sections: Array<{
        id: number;
        name: string;
        grade: { name: string };
        capacity?: number;
    }>;
    subjects: Array<{
        id: number;
        name: string;
        code: string;
    }>;
}

export default function AcademicStructurePage() {
    const [structure, setStructure] = useState<AcademicStructure | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchStructure();
    }, []);

    const fetchStructure = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/academic/structure');
            setStructure(response.data);
        } catch (error) {
            console.error('Failed to fetch academic structure:', error);
            toast.error('Failed to load academic structure');
        } finally {
            setIsLoading(false);
        }
    };

    const activeYear = structure?.academic_years?.find(y => y.is_active);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Academic Structure</h1>
                    <p className="text-muted-foreground">
                        Manage your school's academic hierarchy and organization
                    </p>
                </div>
                <Button>
                    <Settings className="mr-2 h-4 w-4" />
                    Configure
                </Button>
            </div>

            {/* Active Academic Year */}
            {activeYear && (
                <Card className="border-primary">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Current Academic Year
                                </CardTitle>
                                <CardDescription className="mt-1">
                                    {new Date(activeYear.start_date).toLocaleDateString()} - {new Date(activeYear.end_date).toLocaleDateString()}
                                </CardDescription>
                            </div>
                            <Badge className="text-lg px-4 py-2">
                                {activeYear.name}
                            </Badge>
                        </div>
                    </CardHeader>
                </Card>
            )}

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Grades</CardTitle>
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{structure?.grades?.length || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Grade levels
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sections</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{structure?.sections?.length || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Active sections
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Subjects</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{structure?.subjects?.length || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Subjects offered
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Academic Years</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{structure?.academic_years?.length || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Total years
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Management Sections */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Grades & Sections */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Grades & Sections</CardTitle>
                                <CardDescription>Manage grade levels and class sections</CardDescription>
                            </div>
                            <Button size="sm" variant="outline">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Grade
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="text-center py-4 text-muted-foreground">Loading...</div>
                        ) : (
                            <div className="space-y-3">
                                {structure?.grades?.map((grade) => {
                                    const gradeSections = structure.sections.filter(
                                        s => s.grade.name === grade.name
                                    );
                                    return (
                                        <div key={grade.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors">
                                            <div>
                                                <p className="font-medium">{grade.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {gradeSections.length} sections
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                {gradeSections.map(section => (
                                                    <Badge key={section.id} variant="outline">
                                                        {section.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Subjects */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Subjects</CardTitle>
                                <CardDescription>Manage curriculum subjects</CardDescription>
                            </div>
                            <Button size="sm" variant="outline">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Subject
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="text-center py-4 text-muted-foreground">Loading...</div>
                        ) : (
                            <div className="space-y-2">
                                {structure?.subjects?.slice(0, 8).map((subject) => (
                                    <div key={subject.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors">
                                        <div>
                                            <p className="font-medium">{subject.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Code: {subject.code}
                                            </p>
                                        </div>
                                        <Badge variant="secondary">Active</Badge>
                                    </div>
                                ))}
                                {(structure?.subjects?.length || 0) > 8 && (
                                    <Button variant="ghost" className="w-full">
                                        View all {structure?.subjects?.length} subjects
                                    </Button>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common academic management tasks</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <Link href="/office/students">
                            <Button variant="outline" className="w-full justify-start">
                                <Users className="mr-2 h-4 w-4" />
                                Manage Students
                            </Button>
                        </Link>
                        <Link href="/office/teachers">
                            <Button variant="outline" className="w-full justify-start">
                                <GraduationCap className="mr-2 h-4 w-4" />
                                Manage Teachers
                            </Button>
                        </Link>
                        <Link href="/office/timetable">
                            <Button variant="outline" className="w-full justify-start">
                                <Calendar className="mr-2 h-4 w-4" />
                                Manage Timetable
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

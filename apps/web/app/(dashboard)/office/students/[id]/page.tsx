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
    MapPin,
    Calendar,
    GraduationCap,
    Users,
    FileText,
    DollarSign,
    Edit,
    Trash2,
    Download
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { toast } from "sonner";

interface StudentDetail {
    id: number;
    name_en: string;
    student_no: string;
    dob: string;
    gender: string;
    status?: string;
    enrollments?: Array<{
        id: number;
        section: {
            id: number;
            name: string;
            grade: {
                id: number;
                name: string;
            };
        };
        academic_year: {
            name: string;
        };
    }>;
    guardians?: Array<{
        id: number;
        name: string;
        relationship: string;
        phone: string;
        email: string;
    }>;
}

export default function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [student, setStudent] = useState<StudentDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchStudent();
    }, [id]);

    const fetchStudent = async () => {
        setIsLoading(true);
        try {
            const response = await api.get(`/students/${id}`);
            setStudent(response.data);
        } catch (error) {
            console.error('Failed to fetch student:', error);
            toast.error('Failed to load student details');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="text-lg font-medium">Loading student details...</div>
                </div>
            </div>
        );
    }

    if (!student) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="text-lg font-medium">Student not found</div>
                    <Link href="/office/students">
                        <Button className="mt-4">Back to Students</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const currentEnrollment = student.enrollments?.[0];
    const getInitials = (name: string) => {
        const parts = name?.split(' ') || ['S'];
        return parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : parts[0][0];
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/office/students">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{student.name_en}</h1>
                        <p className="text-muted-foreground">Student ID: {student.student_no}</p>
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
                    <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                    </Button>
                </div>
            </div>

            {/* Student Profile Card */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-start gap-6">
                        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-3xl">
                            {getInitials(student.name_en)}
                        </div>
                        <div className="flex-1">
                            <div className="grid gap-4 md:grid-cols-3">
                                <div>
                                    <p className="text-sm text-muted-foreground">Full Name</p>
                                    <p className="font-medium">{student.name_en}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Student Number</p>
                                    <p className="font-medium">{student.student_no}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Gender</p>
                                    <Badge variant={student.gender === 'male' ? 'default' : 'secondary'}>
                                        {student.gender}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                                    <p className="font-medium">{new Date(student.dob).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Current Grade</p>
                                    <p className="font-medium">
                                        {currentEnrollment ? `${currentEnrollment.section.grade.name} - ${currentEnrollment.section.name}` : 'Not Enrolled'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <Badge variant={(student.status || 'active') === 'active' ? 'default' : 'secondary'}>
                                        {student.status || 'active'}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="enrollment" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="enrollment">
                        <GraduationCap className="h-4 w-4 mr-2" />
                        Enrollment
                    </TabsTrigger>
                    <TabsTrigger value="guardians">
                        <Users className="h-4 w-4 mr-2" />
                        Guardians
                    </TabsTrigger>
                    <TabsTrigger value="attendance">
                        <Calendar className="h-4 w-4 mr-2" />
                        Attendance
                    </TabsTrigger>
                    <TabsTrigger value="fees">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Fees
                    </TabsTrigger>
                    <TabsTrigger value="documents">
                        <FileText className="h-4 w-4 mr-2" />
                        Documents
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="enrollment" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Enrollment History</CardTitle>
                            <CardDescription>Student's academic enrollment records</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {student.enrollments && student.enrollments.length > 0 ? (
                                <div className="space-y-3">
                                    {student.enrollments.map((enrollment) => (
                                        <div key={enrollment.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div>
                                                <p className="font-medium">
                                                    {enrollment.section.grade.name} - {enrollment.section.name}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Academic Year: {enrollment.academic_year.name}
                                                </p>
                                            </div>
                                            <Badge>Current</Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    No enrollment records found
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="guardians" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Guardian Information</CardTitle>
                            <CardDescription>Parent/Guardian contact details</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {student.guardians && student.guardians.length > 0 ? (
                                <div className="space-y-4">
                                    {student.guardians.map((guardian) => (
                                        <div key={guardian.id} className="p-4 border rounded-lg">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-2">
                                                    <div>
                                                        <p className="font-medium">{guardian.name}</p>
                                                        <Badge variant="outline">{guardian.relationship}</Badge>
                                                    </div>
                                                    <div className="space-y-1 text-sm">
                                                        <div className="flex items-center gap-2 text-muted-foreground">
                                                            <Phone className="h-4 w-4" />
                                                            {guardian.phone}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-muted-foreground">
                                                            <Mail className="h-4 w-4" />
                                                            {guardian.email}
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button variant="outline" size="sm">Contact</Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    No guardian information available
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="attendance" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Attendance Records</CardTitle>
                            <CardDescription>Student attendance history</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8 text-muted-foreground">
                                Attendance records will be displayed here
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="fees" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Fee Status</CardTitle>
                            <CardDescription>Payment history and pending dues</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8 text-muted-foreground">
                                Fee records will be displayed here
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="documents" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Documents</CardTitle>
                            <CardDescription>Student documents and certificates</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8 text-muted-foreground">
                                Documents will be displayed here
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

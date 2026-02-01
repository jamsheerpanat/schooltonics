'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
    Search,
    UserPlus,
    Download,
    Upload,
    Filter,
    Users,
    GraduationCap,
    UserCheck,
    UserX
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { toast } from "sonner";

interface Student {
    id: number;
    name_en: string;
    student_no: string;
    dob: string;
    gender: string;
    status?: string;
    enrollments?: Array<{
        section: {
            name: string;
            grade: {
                name: string;
            };
        };
    }>;
}

export default function StudentMasterPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [genderFilter, setGenderFilter] = useState('all');
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        male: 0,
        female: 0
    });

    useEffect(() => {
        fetchStudents();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [students, searchQuery, statusFilter, genderFilter]);

    const fetchStudents = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/students');
            const studentData = response.data;
            setStudents(studentData);

            // Calculate stats
            setStats({
                total: studentData.length,
                active: studentData.filter((s: Student) => s.status === 'active' || !s.status).length,
                male: studentData.filter((s: Student) => s.gender === 'male').length,
                female: studentData.filter((s: Student) => s.gender === 'female').length,
            });
        } catch (error) {
            console.error('Failed to fetch students:', error);
            toast.error('Failed to load students');
        } finally {
            setIsLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = students;

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(student =>
                student.name_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                student.student_no?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(student =>
                (student.status || 'active') === statusFilter
            );
        }

        // Gender filter
        if (genderFilter !== 'all') {
            filtered = filtered.filter(student => student.gender === genderFilter);
        }

        setFilteredStudents(filtered);
    };

    const getStudentSection = (student: Student) => {
        if (student.enrollments && student.enrollments.length > 0) {
            const enrollment = student.enrollments[0];
            return `${enrollment.section.grade.name} - ${enrollment.section.name}`;
        }
        return 'Not Enrolled';
    };

    const getInitials = (name: string) => {
        const parts = name?.split(' ') || ['S'];
        return parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : parts[0][0];
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Student Master</h1>
                    <p className="text-muted-foreground">
                        Comprehensive student directory and management
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <Upload className="mr-2 h-4 w-4" />
                        Import
                    </Button>
                    <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                    <Link href="/office/students/new">
                        <Button size="sm">
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add Student
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground">
                            Across all grades
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Students</CardTitle>
                        <UserCheck className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.active}</div>
                        <p className="text-xs text-muted-foreground">
                            Currently enrolled
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Male Students</CardTitle>
                        <GraduationCap className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.male}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.total > 0 ? Math.round((stats.male / stats.total) * 100) : 0}% of total
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Female Students</CardTitle>
                        <GraduationCap className="h-4 w-4 text-pink-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.female}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.total > 0 ? Math.round((stats.female / stats.total) * 100) : 0}% of total
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Search & Filter</CardTitle>
                    <CardDescription>Find students using advanced filters</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="md:col-span-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name or student number..."
                                    className="pl-8"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                                <SelectItem value="graduated">Graduated</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={genderFilter} onValueChange={setGenderFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Gender" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Genders</SelectItem>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Student List */}
            <Card>
                <CardHeader>
                    <CardTitle>Student Directory</CardTitle>
                    <CardDescription>
                        Showing {filteredStudents.length} of {students.length} students
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Loading students...
                        </div>
                    ) : filteredStudents.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No students found matching your criteria
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {filteredStudents.map((student) => (
                                <Link
                                    key={student.id}
                                    href={`/office/students/${student.id}`}
                                    className="block"
                                >
                                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                        <CardContent className="pt-6">
                                            <div className="flex items-start gap-4">
                                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                                                    {getInitials(student.name_en)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold truncate">
                                                        {student.name_en}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {student.student_no}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Badge variant="outline" className="text-xs">
                                                            {getStudentSection(student)}
                                                        </Badge>
                                                        <Badge
                                                            variant={student.gender === 'male' ? 'default' : 'secondary'}
                                                            className="text-xs"
                                                        >
                                                            {student.gender}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

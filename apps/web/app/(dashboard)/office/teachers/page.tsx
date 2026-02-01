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
    Users,
    BookOpen,
    Award,
    Calendar
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

export default function TeacherMasterPage() {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        onLeave: 0,
        partTime: 0
    });

    useEffect(() => {
        fetchTeachers();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [teachers, searchQuery, statusFilter]);

    const fetchTeachers = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/teachers');
            const teacherData = response.data;
            setTeachers(teacherData);

            setStats({
                total: teacherData.length,
                active: teacherData.filter((t: Teacher) => t.status === 'active' || !t.status).length,
                onLeave: 0, // Would come from API
                partTime: 0 // Would come from API
            });
        } catch (error) {
            console.error('Failed to fetch teachers:', error);
            toast.error('Failed to load teachers');
        } finally {
            setIsLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = teachers;

        if (searchQuery) {
            filtered = filtered.filter(teacher =>
                teacher.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                teacher.email?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(teacher =>
                (teacher.status || 'active') === statusFilter
            );
        }

        setFilteredTeachers(filtered);
    };

    const getInitials = (name: string) => {
        const parts = name?.split(' ') || ['T'];
        return parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : parts[0][0];
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Teacher Master</h1>
                    <p className="text-muted-foreground">
                        Comprehensive teacher directory and management
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
                    <Link href="/office/teachers/new">
                        <Button size="sm">
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add Teacher
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground">
                            Teaching staff
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Teachers</CardTitle>
                        <BookOpen className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.active}</div>
                        <p className="text-xs text-muted-foreground">
                            Currently teaching
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">On Leave</CardTitle>
                        <Calendar className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.onLeave}</div>
                        <p className="text-xs text-muted-foreground">
                            Currently absent
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Departments</CardTitle>
                        <Award className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">8</div>
                        <p className="text-xs text-muted-foreground">
                            Academic departments
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Search & Filter</CardTitle>
                    <CardDescription>Find teachers using advanced filters</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="md:col-span-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name or email..."
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
                                <SelectItem value="on_leave">On Leave</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Teacher List */}
            <Card>
                <CardHeader>
                    <CardTitle>Teacher Directory</CardTitle>
                    <CardDescription>
                        Showing {filteredTeachers.length} of {teachers.length} teachers
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Loading teachers...
                        </div>
                    ) : filteredTeachers.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No teachers found matching your criteria
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {filteredTeachers.map((teacher) => (
                                <Link
                                    key={teacher.id}
                                    href={`/office/teachers/${teacher.id}`}
                                    className="block"
                                >
                                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                        <CardContent className="pt-6">
                                            <div className="flex items-start gap-4">
                                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg">
                                                    {getInitials(teacher.name)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold truncate">
                                                        {teacher.name}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground truncate">
                                                        {teacher.email}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Badge variant="outline" className="text-xs">
                                                            {teacher.role}
                                                        </Badge>
                                                        <Badge
                                                            variant={(teacher.status || 'active') === 'active' ? 'default' : 'secondary'}
                                                            className="text-xs"
                                                        >
                                                            {teacher.status || 'active'}
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

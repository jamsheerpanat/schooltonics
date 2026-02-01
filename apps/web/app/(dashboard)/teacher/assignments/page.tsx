'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Plus,
    Search,
    Clock,
    CheckCircle2,
    AlertCircle,
    Users,
    Award
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { toast } from "sonner";

interface Assignment {
    id: number;
    title: string;
    description: string;
    type: string;
    due_date: string;
    max_marks: number;
    section: string;
    subject: string;
    subject_code: string;
    total_students: number;
    submitted: number;
    graded: number;
    status: 'active' | 'due_soon' | 'overdue';
}

export default function TeacherAssignmentsPage() {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/teacher/assignments');
            setAssignments(response.data);
        } catch (error) {
            console.error('Failed to fetch assignments:', error);
            toast.error('Failed to load assignments');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredAssignments = assignments.filter(assignment => {
        const matchesSearch =
            assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            assignment.section.toLowerCase().includes(searchQuery.toLowerCase()) ||
            assignment.subject.toLowerCase().includes(searchQuery.toLowerCase());

        if (activeTab === 'all') return matchesSearch;
        if (activeTab === 'pending') return matchesSearch && assignment.submitted < assignment.total_students;
        if (activeTab === 'grading') return matchesSearch && assignment.submitted > assignment.graded;
        if (activeTab === 'overdue') return matchesSearch && assignment.status === 'overdue';

        return matchesSearch;
    });

    const stats = {
        total: assignments.length,
        pending: assignments.filter(a => a.submitted < a.total_students).length,
        grading: assignments.filter(a => a.submitted > a.graded).length,
        overdue: assignments.filter(a => a.status === 'overdue').length,
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>;
            case 'due_soon':
                return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Due Soon</Badge>;
            case 'overdue':
                return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Overdue</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getTypeBadge = (type: string) => {
        const colors: Record<string, string> = {
            homework: 'bg-blue-50 text-blue-700 border-blue-200',
            quiz: 'bg-purple-50 text-purple-700 border-purple-200',
            project: 'bg-orange-50 text-orange-700 border-orange-200',
            exam: 'bg-red-50 text-red-700 border-red-200',
        };

        return (
            <Badge variant="outline" className={colors[type] || ''}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
            </Badge>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
                    <p className="text-muted-foreground">
                        Create and manage homework, quizzes, and projects
                    </p>
                </div>
                <Link href="/teacher/assignments/new">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        New Assignment
                    </Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground">All assignments</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                        <Users className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pending}</div>
                        <p className="text-xs text-muted-foreground">Awaiting submissions</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">To Grade</CardTitle>
                        <Award className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.grading}</div>
                        <p className="text-xs text-muted-foreground">Need grading</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.overdue}</div>
                        <p className="text-xs text-muted-foreground">Past due date</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <Card>
                <CardContent className="pt-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search assignments..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
                    <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
                    <TabsTrigger value="grading">To Grade ({stats.grading})</TabsTrigger>
                    <TabsTrigger value="overdue">Overdue ({stats.overdue})</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="space-y-4 mt-6">
                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="text-lg font-medium">Loading assignments...</div>
                        </div>
                    ) : filteredAssignments.length > 0 ? (
                        <div className="space-y-3">
                            {filteredAssignments.map((assignment) => (
                                <Link key={assignment.id} href={`/teacher/assignments/${assignment.id}`}>
                                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                        <CardContent className="pt-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h3 className="text-lg font-semibold">{assignment.title}</h3>
                                                        {getTypeBadge(assignment.type)}
                                                        {getStatusBadge(assignment.status)}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mb-3">
                                                        {assignment.section} • {assignment.subject}
                                                    </p>
                                                    <div className="flex items-center gap-6 text-sm">
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                                            <span>Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Users className="h-4 w-4 text-muted-foreground" />
                                                            <span>{assignment.submitted}/{assignment.total_students} submitted</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Award className="h-4 w-4 text-muted-foreground" />
                                                            <span>{assignment.graded}/{assignment.submitted} graded</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                                                            <span>{assignment.max_marks} marks</span>
                                                        </div>
                                                    </div>
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
                                    {searchQuery ? 'No assignments match your search' : 'No assignments found'}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

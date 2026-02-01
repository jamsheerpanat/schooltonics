'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Search,
    Plus,
    BookOpen,
    Code,
    Award,
    Edit,
    Trash2
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

interface Subject {
    id: number;
    name: string;
    code: string;
    description?: string;
}

export default function SubjectsPage() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchSubjects();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [subjects, searchQuery]);

    const fetchSubjects = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/academic/structure');
            setSubjects(response.data.subjects || []);
        } catch (error) {
            console.error('Failed to fetch subjects:', error);
            toast.error('Failed to load subjects');
        } finally {
            setIsLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = subjects;

        if (searchQuery) {
            filtered = filtered.filter(subject =>
                subject.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                subject.code?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredSubjects(filtered);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Subjects Management</h1>
                    <p className="text-muted-foreground">
                        Manage curriculum subjects and courses
                    </p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Subject
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{subjects.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Active subjects
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Core Subjects</CardTitle>
                        <Award className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{Math.floor(subjects.length * 0.6)}</div>
                        <p className="text-xs text-muted-foreground">
                            Mandatory courses
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Electives</CardTitle>
                        <Code className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{Math.floor(subjects.length * 0.4)}</div>
                        <p className="text-xs text-muted-foreground">
                            Optional courses
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <Card>
                <CardHeader>
                    <CardTitle>Search Subjects</CardTitle>
                    <CardDescription>Find subjects by name or code</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by subject name or code..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Subjects List */}
            <Card>
                <CardHeader>
                    <CardTitle>Subject Catalog</CardTitle>
                    <CardDescription>
                        Showing {filteredSubjects.length} of {subjects.length} subjects
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Loading subjects...
                        </div>
                    ) : filteredSubjects.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No subjects found
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredSubjects.map((subject) => (
                                <div
                                    key={subject.id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold">
                                            {subject.code?.substring(0, 2) || 'SU'}
                                        </div>
                                        <div>
                                            <p className="font-medium">{subject.name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="outline" className="text-xs">
                                                    {subject.code}
                                                </Badge>
                                                <Badge variant="secondary" className="text-xs">
                                                    Active
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="sm">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

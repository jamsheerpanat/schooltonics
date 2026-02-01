'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Loader2,
    Download,
    Filter,
    Search,
    UserCircle,
    Info
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

interface GradebookData {
    section_info: {
        section_name: string;
        grade_name: string;
    };
    students: Array<{
        id: number;
        name_en: string;
        roll_no: string;
    }>;
    assignments: Array<{
        id: number;
        title: string;
        type: string;
        max_marks: number;
        due_date: string;
    }>;
    grades: Record<number, Record<number, number>>;
}

export default function GradebookPage() {
    const [classes, setClasses] = useState<any[]>([]);
    const [selectedSection, setSelectedSection] = useState<string>('');
    const [gradebookData, setGradebookData] = useState<GradebookData | null>(null);
    const [isFetchingClasses, setIsFetchingClasses] = useState(true);
    const [isFetchingData, setIsFetchingData] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        setIsFetchingClasses(true);
        try {
            const response = await api.get('/teacher/classes');
            setClasses(response.data);
            if (response.data.length > 0) {
                const firstSection = response.data[0].section_id.toString();
                setSelectedSection(firstSection);
                fetchGradebookData(firstSection);
            }
        } catch (error) {
            console.error('Failed to fetch classes:', error);
            toast.error('Failed to load classes');
        } finally {
            setIsFetchingClasses(false);
        }
    };

    const fetchGradebookData = async (sectionId: string) => {
        setIsFetchingData(true);
        try {
            const response = await api.get(`/teacher/gradebook?section_id=${sectionId}`);
            setGradebookData(response.data);
        } catch (error) {
            console.error('Failed to fetch gradebook:', error);
            toast.error('Failed to load gradebook data');
        } finally {
            setIsFetchingData(false);
        }
    };

    const filteredStudents = gradebookData?.students.filter(s =>
        s.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.roll_no.toString().includes(searchTerm)
    ) || [];

    const getAverage = (studentId: number) => {
        if (!gradebookData) return 0;
        const studentGrades = gradebookData.grades[studentId] || {};
        const totalPossible = gradebookData.assignments.reduce((sum, a) => sum + a.max_marks, 0);
        const totalEarned = Object.values(studentGrades).reduce((sum, g) => sum + g, 0);

        return totalPossible > 0 ? (totalEarned / totalPossible) * 100 : 0;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gradebook</h1>
                    <p className="text-muted-foreground">
                        Comprehensive view of student performance across all assessments
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="space-y-2 flex-1">
                            <label className="text-sm font-medium">Select Class</label>
                            <Select
                                value={selectedSection}
                                onValueChange={(val) => {
                                    setSelectedSection(val);
                                    fetchGradebookData(val);
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a class" />
                                </SelectTrigger>
                                <SelectContent>
                                    {classes.map(cls => (
                                        <SelectItem key={cls.section_id} value={cls.section_id.toString()}>
                                            {cls.section_name} ({cls.subject})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2 flex-[2]">
                            <label className="text-sm font-medium">Search Student</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Name or roll number..."
                                    className="pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <Button variant="ghost" size="icon">
                            <Filter className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Grade Table */}
            <Card className="overflow-hidden">
                <CardHeader className="bg-muted/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Performance Matrix</CardTitle>
                            <CardDescription>
                                {gradebookData?.section_info.grade_name} - {gradebookData?.section_info.section_name}
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Info className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground italic">Scroll horizontally to view all assignments</span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isFetchingData ? (
                        <div className="flex items-center justify-center py-24">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : gradebookData ? (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/20">
                                        <TableHead className="w-[80px] sticky left-0 bg-muted/20 z-10">Roll No</TableHead>
                                        <TableHead className="min-w-[200px] sticky left-[80px] bg-muted/20 z-10 border-r">Student Name</TableHead>
                                        {gradebookData.assignments.map(assignment => (
                                            <TableHead key={assignment.id} className="min-w-[150px] text-center border-r">
                                                <div className="flex flex-col items-center">
                                                    <span className="font-semibold text-xs uppercase tracking-wider">{assignment.type}</span>
                                                    <span className="text-sm truncate max-w-[140px]" title={assignment.title}>{assignment.title}</span>
                                                    <Badge variant="outline" className="mt-1 text-[10px] h-4">Max: {assignment.max_marks}</Badge>
                                                </div>
                                            </TableHead>
                                        ))}
                                        <TableHead className="min-w-[100px] text-center font-bold text-primary">Overall (%)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredStudents.length > 0 ? (
                                        filteredStudents.map(student => (
                                            <TableRow key={student.id} className="hover:bg-muted/50 transition-colors">
                                                <TableCell className="font-medium sticky left-0 bg-background z-10">{student.roll_no}</TableCell>
                                                <TableCell className="sticky left-[80px] bg-background z-10 border-r">
                                                    <div className="flex items-center gap-2">
                                                        <UserCircle className="h-5 w-5 text-muted-foreground" />
                                                        <span className="font-medium">{student.name_en}</span>
                                                    </div>
                                                </TableCell>
                                                {gradebookData.assignments.map(assignment => {
                                                    const grade = gradebookData.grades[student.id]?.[assignment.id];
                                                    return (
                                                        <TableCell key={assignment.id} className="text-center border-r">
                                                            {grade !== undefined ? (
                                                                <span className={grade / assignment.max_marks < 0.4 ? 'text-red-500 font-bold' : ''}>
                                                                    {grade}
                                                                </span>
                                                            ) : (
                                                                <span className="text-muted-foreground/30 italic text-xs">--</span>
                                                            )}
                                                        </TableCell>
                                                    );
                                                })}
                                                <TableCell className="text-center">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className={`font-bold ${getAverage(student.id) < 40 ? 'text-red-600' : 'text-primary'}`}>
                                                            {getAverage(student.id).toFixed(1)}%
                                                        </span>
                                                        <div className="w-12 bg-muted rounded-full h-1">
                                                            <div
                                                                className={`h-1 rounded-full ${getAverage(student.id) < 40 ? 'bg-red-500' : 'bg-primary'}`}
                                                                style={{ width: `${getAverage(student.id)}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={gradebookData.assignments.length + 3} className="h-24 text-center">
                                                No students found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="py-24 text-center text-muted-foreground">
                            {isFetchingClasses ? 'Loading classes...' : 'Select a class to view gradebook.'}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

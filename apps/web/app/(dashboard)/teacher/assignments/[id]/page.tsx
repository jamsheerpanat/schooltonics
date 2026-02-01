'use client';

import { use, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@/components/ui/sheet";
import {
    ArrowLeft,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Users,
    Award,
    Clock,
    UserCircle,
    Save
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { toast } from "sonner";

interface Submission {
    student_id: number;
    name: string;
    student_no: string;
    roll_no: string;
    submitted: boolean;
    submitted_at: string | null;
    grade: number | null;
    feedback: string | null;
    status: 'not_submitted' | 'submitted' | 'graded';
}

interface AssignmentDetail {
    assignment: {
        id: number;
        title: string;
        description: string;
        type: string;
        due_date: string;
        max_marks: number;
        instructions: string;
        section: string;
        subject: string;
        subject_code: string;
    };
    submissions: Submission[];
    stats: {
        total: number;
        submitted: number;
        graded: number;
        pending: number;
    };
}

export default function AssignmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [detail, setDetail] = useState<AssignmentDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState<Submission | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [gradingData, setGradingData] = useState({
        grade: '',
        feedback: ''
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchAssignmentDetail();
    }, [id]);

    const fetchAssignmentDetail = async () => {
        setIsLoading(true);
        try {
            const response = await api.get(`/teacher/assignments/${id}`);
            setDetail(response.data);
        } catch (error) {
            console.error('Failed to fetch assignment detail:', error);
            toast.error('Failed to load assignment detail');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenGrading = (student: Submission) => {
        setSelectedStudent(student);
        setGradingData({
            grade: student.grade?.toString() || '',
            feedback: student.feedback || ''
        });
        setIsSheetOpen(true);
    };

    const handleSaveGrade = async () => {
        if (!selectedStudent) return;

        const gradeValue = parseFloat(gradingData.grade);
        if (isNaN(gradeValue)) {
            toast.error('Please enter a valid grade');
            return;
        }

        if (gradeValue > (detail?.assignment.max_marks || 100)) {
            toast.error(`Grade cannot exceed max marks (${detail?.assignment.max_marks})`);
            return;
        }

        setIsSaving(true);
        try {
            await api.post(`/teacher/assignments/${id}/grade/${selectedStudent.student_id}`, {
                grade: gradeValue,
                feedback: gradingData.feedback
            });
            toast.success('Grade saved successfully!');
            setIsSheetOpen(false);
            fetchAssignmentDetail(); // Refresh data
        } catch (error: any) {
            console.error('Failed to save grade:', error);
            toast.error(error.response?.data?.message || 'Failed to save grade');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!detail) {
        return (
            <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">Assignment not found</p>
                <Link href="/teacher/assignments">
                    <Button variant="outline" className="mt-4">Back to Assignments</Button>
                </Link>
            </div>
        );
    }

    const { assignment, submissions, stats } = detail;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/teacher/assignments">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{assignment.title}</h1>
                        <p className="text-muted-foreground">
                            {assignment.section} • {assignment.subject}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className="px-3 py-1 text-sm bg-primary/5">
                        Max Marks: {assignment.max_marks}
                    </Badge>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
                {/* Stats Cards */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Submissions</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.submitted} / {stats.total}</div>
                        <p className="text-xs text-muted-foreground">Total students: {stats.total}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Graded</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.graded}</div>
                        <p className="text-xs text-muted-foreground">{stats.submitted - stats.graded} pending review</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Due Date</CardTitle>
                        <Clock className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{new Date(assignment.due_date).toLocaleDateString()}</div>
                        <p className="text-xs text-muted-foreground">Status: Active</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
                        <Award className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.graded > 0
                                ? (submissions.reduce((acc, curr) => acc + (curr.grade || 0), 0) / stats.graded).toFixed(1)
                                : 'N/A'
                            }
                        </div>
                        <p className="text-xs text-muted-foreground">Based on graded work</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Submissions Table */}
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Student Submissions</CardTitle>
                            <CardDescription>Click on a row to grade or view feedback</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">Roll No</TableHead>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Grade</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {submissions.map((student) => (
                                        <TableRow key={student.student_id}>
                                            <TableCell className="font-medium">{student.roll_no}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{student.name}</span>
                                                    <span className="text-xs text-muted-foreground">{student.student_no}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {student.status === 'graded' ? (
                                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Graded</Badge>
                                                ) : student.status === 'submitted' ? (
                                                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">Submitted</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-muted-foreground">Not Submitted</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {student.grade !== null ? (
                                                    <span className="font-bold">{student.grade} / {assignment.max_marks}</span>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">--</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleOpenGrading(student)}
                                                >
                                                    Grade
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                {/* Assignment Info */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>About Assignment</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="text-sm font-semibold mb-1">Description</h4>
                                <p className="text-sm text-muted-foreground italic">{assignment.description || 'No description provided'}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold mb-1">Instructions</h4>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{assignment.instructions || 'No detailed instructions'}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Grading Insight</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Completion Rate</span>
                                    <span className="font-medium">{Math.round((stats.submitted / stats.total) * 100)}%</span>
                                </div>
                                <div className="w-full bg-secondary rounded-full h-2">
                                    <div
                                        className="bg-primary h-2 rounded-full"
                                        style={{ width: `${(stats.submitted / stats.total) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Grading Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle>Grade Assignment</SheetTitle>
                        <SheetDescription>
                            Review student's work and provide feedback.
                        </SheetDescription>
                    </SheetHeader>

                    {selectedStudent && (
                        <div className="space-y-6 py-6">
                            <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                                <UserCircle className="h-10 w-10 text-muted-foreground" />
                                <div>
                                    <p className="font-bold">{selectedStudent.name}</p>
                                    <p className="text-sm text-muted-foreground">Roll No: {selectedStudent.roll_no}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="grade">Grade (Max: {assignment.max_marks})</Label>
                                <Input
                                    id="grade"
                                    type="number"
                                    step="0.5"
                                    placeholder="Enter marks"
                                    value={gradingData.grade}
                                    onChange={(e) => setGradingData({ ...gradingData, grade: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="feedback">Feedback</Label>
                                <Textarea
                                    id="feedback"
                                    placeholder="Great work! Keep it up."
                                    className="min-h-[150px]"
                                    value={gradingData.feedback}
                                    onChange={(e) => setGradingData({ ...gradingData, feedback: e.target.value })}
                                />
                            </div>

                            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                                <p className="text-xs text-blue-700 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    This grade will be immediately visible to the student and their parents.
                                </p>
                            </div>
                        </div>
                    )}

                    <SheetFooter>
                        <Button
                            className="w-full"
                            disabled={isSaving}
                            onClick={handleSaveGrade}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Grade
                                </>
                            )}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </div>
    );
}

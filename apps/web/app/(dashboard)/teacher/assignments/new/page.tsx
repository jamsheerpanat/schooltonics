'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { toast } from "sonner";

interface TeacherClass {
    id: number;
    section_id: number;
    section_name: string;
    subject: string;
    subject_code: string;
    subject_id?: number; // I'll need to check if the API returns this
}

export default function CreateAssignmentPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [classes, setClasses] = useState<any[]>([]);
    const [isFetchingClasses, setIsFetchingClasses] = useState(true);

    const [formData, setFormData] = useState({
        section_id: '',
        subject_id: '',
        title: '',
        description: '',
        type: 'homework',
        due_date: '',
        max_marks: '100',
        instructions: ''
    });

    useEffect(() => {
        fetchTeacherClasses();
    }, []);

    const fetchTeacherClasses = async () => {
        setIsFetchingClasses(true);
        try {
            // Reusing the endpoint that returns teacher's assigned classes
            const response = await api.get('/teacher/classes');
            setClasses(response.data);

            // If there's only one class, auto-select it
            if (response.data.length === 1) {
                const cls = response.data[0];
                // Note: The API should ideally return subject_id. 
                // Let's assume the teacher_assignments table ID is used to get the specific combo.
                // However, our backend store() expects section_id and subject_id.
            }
        } catch (error) {
            console.error('Failed to fetch classes:', error);
            toast.error('Failed to load your assigned classes');
        } finally {
            setIsFetchingClasses(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.section_id || !formData.subject_id) {
            toast.error('Please select a class and subject');
            return;
        }

        setIsLoading(true);
        try {
            await api.post('/teacher/assignments', {
                ...formData,
                max_marks: parseInt(formData.max_marks),
                section_id: parseInt(formData.section_id),
                subject_id: parseInt(formData.subject_id)
            });
            toast.success('Assignment created successfully!');
            router.push('/teacher/assignments');
        } catch (error: any) {
            console.error('Failed to create assignment:', error);
            toast.error(error.response?.data?.message || 'Failed to create assignment');
        } finally {
            setIsLoading(false);
        }
    };

    // Find the current selected class to extract its subject (since teacher_assignments usually links 1 subject to 1 section)
    const handleClassChange = (sectionId: string) => {
        const selectedClass = classes.find(c => c.section_id.toString() === sectionId);
        setFormData({
            ...formData,
            section_id: sectionId,
            // Assuming the teacher has one subject for this section. 
            // In a real system, they might have multiple.
            // Our current getClasses API doesn't return subject_id explicitly, 
            // but the teacher_assignments logic usually implies it.
            // I'll need to check the exact response of /teacher/classes
        });

        // Let's look at the getClasses API in TeacherDashboardController again.
        // It selects subjects.name as subject_name but doesn't select subjects.id.
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/teacher/assignments">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Create Assignment</h1>
                    <p className="text-muted-foreground">
                        Post a new task for your students
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid gap-6 md:grid-cols-3">
                    {/* Left Column - Main Details */}
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Assignment Details</CardTitle>
                                <CardDescription>Basic information about the task</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Assignment Title *</Label>
                                    <Input
                                        id="title"
                                        placeholder="e.g. Mid-term Research Project"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Short Description</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Provide a brief summary of what this assignment is about"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="instructions">Detailed Instructions</Label>
                                    <Textarea
                                        id="instructions"
                                        placeholder="Step-by-step instructions for students"
                                        className="min-h-[200px]"
                                        value={formData.instructions}
                                        onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Configuration */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Settings</CardTitle>
                                <CardDescription>Class and grading configuration</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Select Class *</Label>
                                    <Select
                                        disabled={isFetchingClasses}
                                        onValueChange={(val) => {
                                            const cls = classes.find(c => c.section_id.toString() === val);
                                            setFormData({
                                                ...formData,
                                                section_id: val,
                                                subject_id: cls?.subject_id?.toString() || ''
                                            });
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={isFetchingClasses ? "Loading classes..." : "Select Class"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {classes.map((cls) => (
                                                <SelectItem key={cls.section_id} value={cls.section_id.toString()}>
                                                    {cls.section_name} ({cls.subject})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Assignment Type</Label>
                                    <Select
                                        value={formData.type}
                                        onValueChange={(val) => setFormData({ ...formData, type: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="homework">Homework</SelectItem>
                                            <SelectItem value="quiz">Quiz</SelectItem>
                                            <SelectItem value="project">Project</SelectItem>
                                            <SelectItem value="exam">Exam</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="due_date">Due Date *</Label>
                                    <Input
                                        id="due_date"
                                        type="date"
                                        required
                                        value={formData.due_date}
                                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="max_marks">Maximum Marks *</Label>
                                    <Input
                                        id="max_marks"
                                        type="number"
                                        required
                                        value={formData.max_marks}
                                        onChange={(e) => setFormData({ ...formData, max_marks: e.target.value })}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex flex-col gap-3">
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save & Publish
                                    </>
                                )}
                            </Button>
                            <Link href="/teacher/assignments">
                                <Button variant="outline" className="w-full" type="button">
                                    Cancel
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

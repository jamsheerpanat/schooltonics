'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Loader2,
    CheckCircle2,
    XCircle,
    Save,
    Search,
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

interface StudentAttendance {
    id: number;
    student_id: number;
    roll_no: string;
    name_en: string;
    status: 'present' | 'absent' | 'not_marked';
}

interface AttendanceSession {
    id?: number;
    section_id: number;
    date: string;
    roster: StudentAttendance[];
}

function AttendanceContent() {
    const searchParams = useSearchParams();
    const sectionFromQuery = searchParams.get('section');

    const [classes, setClasses] = useState<any[]>([]);
    const [selectedSection, setSelectedSection] = useState<string>(sectionFromQuery || '');
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [session, setSession] = useState<AttendanceSession | null>(null);
    const [isLoadingClasses, setIsLoadingClasses] = useState(true);
    const [isLoadingSession, setIsLoadingSession] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        if (selectedSection) {
            initializeSession();
        }
    }, [selectedSection, selectedDate]);

    const fetchClasses = async () => {
        setIsLoadingClasses(true);
        try {
            const response = await api.get('/teacher/classes');
            setClasses(response.data);
            if (!selectedSection && response.data.length > 0) {
                setSelectedSection(response.data[0].section_id.toString());
            }
        } catch (error) {
            console.error('Failed to fetch classes:', error);
            toast.error('Failed to load classes');
        } finally {
            setIsLoadingClasses(false);
        }
    };

    const initializeSession = async () => {
        setIsLoadingSession(true);
        try {
            const response = await api.post('/attendance/sessions', {
                section_id: parseInt(selectedSection),
                date: selectedDate
            });

            // Map the API response to our state
            // API returns session object with roster
            setSession({
                id: response.data.session.id,
                section_id: response.data.session.section_id,
                date: response.data.session.date,
                roster: response.data.roster.map((r: any) => ({
                    ...r,
                    status: r.status || 'not_marked'
                }))
            });
        } catch (error) {
            console.error('Failed to initialize attendance session:', error);
            toast.error('Failed to load attendance roster');
        } finally {
            setIsLoadingSession(false);
        }
    };

    const handleStatusChange = (studentId: number, status: 'present' | 'absent') => {
        if (!session) return;

        const newRoster = session.roster.map(s =>
            s.student_id === studentId ? { ...s, status } : s
        );
        setSession({ ...session, roster: newRoster });
    };

    const markAllStatus = (status: 'present' | 'absent') => {
        if (!session) return;
        const newRoster = session.roster.map(s => ({ ...s, status }));
        setSession({ ...session, roster: newRoster });
    };

    const handleSave = async () => {
        if (!session || !session.id) return;

        const unmarkedCount = session.roster.filter(s => s.status === 'not_marked').length;
        if (unmarkedCount > 0) {
            toast.error(`Please mark attendance for all ${unmarkedCount} pending students`);
            return;
        }

        setIsSaving(true);
        try {
            await api.post(`/attendance/sessions/${session.id}/submit`, {
                records: session.roster.map(s => ({
                    student_id: s.student_id,
                    status: s.status
                }))
            });
            toast.success('Attendance submitted successfully!');
        } catch (error) {
            console.error('Failed to submit attendance:', error);
            toast.error('Failed to save attendance');
        } finally {
            setIsSaving(false);
        }
    };

    const filteredRoster = session?.roster.filter(s =>
        s.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.roll_no.toString().includes(searchTerm)
    ) || [];

    const presentCount = session?.roster.filter(s => s.status === 'present').length || 0;
    const absentCount = session?.roster.filter(s => s.status === 'absent').length || 0;
    const pendingCount = session?.roster.filter(s => s.status === 'not_marked').length || 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Record Attendance</h1>
                    <p className="text-muted-foreground">
                        Mark student presence for your assigned classes
                    </p>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Class Section</label>
                            <Select
                                value={selectedSection}
                                onValueChange={setSelectedSection}
                                disabled={isLoadingClasses}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select class" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.isArray(classes) && classes.map(cls => (
                                        <SelectItem key={cls.section_id} value={cls.section_id.toString()}>
                                            {cls.section_name} ({cls.subject})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Session Date</label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="date"
                                    className="pl-10"
                                    value={selectedDate}
                                    max={new Date().toISOString().split('T')[0]}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex items-end gap-2">
                            <Button variant="outline" className="flex-1" onClick={() => markAllStatus('present')}>
                                <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                                All Present
                            </Button>
                            <Button variant="outline" className="flex-1" onClick={() => markAllStatus('absent')}>
                                <XCircle className="mr-2 h-4 w-4 text-red-600" />
                                All Absent
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Attendance Roster */}
            <div className="grid md:grid-cols-4 gap-6">
                <div className="md:col-span-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Student Roster</CardTitle>
                                <CardDescription>Tap the status to toggle presence</CardDescription>
                            </div>
                            <div className="w-64 relative">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search student..."
                                    className="pl-10 h-9"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isLoadingSession ? (
                                <div className="py-24 flex justify-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : session ? (
                                <div className="space-y-2">
                                    {filteredRoster.map((student) => (
                                        <div key={student.student_id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold font-mono">
                                                    {student.roll_no}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{student.name_en}</p>
                                                    <p className="text-xs text-muted-foreground">ID: {student.student_id}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <Button
                                                    size="sm"
                                                    variant={student.status === 'present' ? 'default' : 'outline'}
                                                    className={student.status === 'present' ? 'bg-green-600 hover:bg-green-700' : 'text-green-600 border-green-200 hover:bg-green-50'}
                                                    onClick={() => handleStatusChange(student.student_id, 'present')}
                                                >
                                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                                    Present
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant={student.status === 'absent' ? 'default' : 'outline'}
                                                    className={student.status === 'absent' ? 'bg-red-600 hover:bg-red-700' : 'text-red-600 border-red-200 hover:bg-red-50'}
                                                    onClick={() => handleStatusChange(student.student_id, 'absent')}
                                                >
                                                    <XCircle className="h-4 w-4 mr-1" />
                                                    Absent
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {filteredRoster.length === 0 && (
                                        <div className="py-12 text-center text-muted-foreground">
                                            No students found.
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="py-24 text-center text-muted-foreground italic">
                                    Select a class section to load student list.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Summary Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center pb-2 border-b">
                                <span className="text-sm text-muted-foreground">Present</span>
                                <Badge variant="secondary" className="bg-green-100 text-green-700">{presentCount}</Badge>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b">
                                <span className="text-sm text-muted-foreground">Absent</span>
                                <Badge variant="secondary" className="bg-red-100 text-red-700">{absentCount}</Badge>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b">
                                <span className="text-sm text-muted-foreground">Pending</span>
                                <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 font-bold">{pendingCount}</Badge>
                            </div>
                            <div className="pt-4 space-y-3">
                                <Button
                                    className="w-full"
                                    disabled={isSaving || !session || pendingCount > 0}
                                    onClick={handleSave}
                                >
                                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                    Finalize Attendance
                                </Button>
                                <p className="text-[10px] text-muted-foreground text-center">
                                    By clicking finalize, SMS notifications will be sent to parents of absent students automatically.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-bold">Class Insight</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground">Average Attendance</span>
                                    <span className="font-bold">94.2%</span>
                                </div>
                                <div className="w-full bg-secondary h-1.5 rounded-full">
                                    <div className="bg-primary h-1.5 rounded-full w-[94.2%]"></div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default function AttendancePage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            <AttendanceContent />
        </Suspense>
    );
}

"use client";

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useParams, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, XCircle, Clock, User } from "lucide-react";
import Link from 'next/link';

interface AttendanceRecord {
    student_id: number;
    student_name: string;
    roll_no: string | null;
    status: 'present' | 'absent';
    reason: string | null;
}

interface AttendanceSession {
    id: number;
    section_id: number;
    date: string;
    status: string;
    submitted_at: string | null;
    creator: {
        name: string;
    };
    records: AttendanceRecord[];
}

interface SessionData {
    session: AttendanceSession;
    roster: AttendanceRecord[];
}

export default function SectionAttendanceDetailPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const sectionId = params.id;
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const { data, isLoading, isError } = useQuery<SessionData>({
        queryKey: ['section-attendance', sectionId, date],
        queryFn: async () => {
            const response = await api.get(`/attendance/section/${sectionId}?date=${date}`);
            return response.data;
        },
    });

    if (isLoading) return <div className="p-8">Loading attendance details...</div>;

    if (isError || !data) return (
        <div className="p-8 text-center">
            <h2 className="text-xl font-bold">No Records Found</h2>
            <p className="text-muted-foreground mb-4">Either attendance hasn't been started or there's an error.</p>
            <Link href="/principal/health" className="text-blue-600 flex items-center justify-center">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to School Health
            </Link>
        </div>
    );

    const { session, roster } = data;
    const presentCount = roster.filter(r => r.status === 'present').length;
    const absentCount = roster.filter(r => r.status === 'absent').length;

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link href="/principal/health">
                    <div className="p-2 border rounded-full hover:bg-slate-100 cursor-pointer">
                        <ArrowLeft className="h-4 w-4" />
                    </div>
                </Link>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Attendance Log</h2>
                    <p className="text-muted-foreground">Detailed daily log for Section {sectionId}, {date}</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Session Info</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-bold">{session.status.toUpperCase()}</span>
                        </div>
                        {session.submitted_at && (
                            <p className="text-xs text-muted-foreground">Submitted: {new Date(session.submitted_at).toLocaleTimeString()}</p>
                        )}
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                            <User className="h-3 w-3 mr-1" /> {session.creator?.name || 'Teacher'}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Present</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{presentCount}</div>
                        <p className="text-xs text-muted-foreground">Students in class</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Absent</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{absentCount}</div>
                        <p className="text-xs text-muted-foreground">Students missing</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Student Roster Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Roll No</TableHead>
                                <TableHead>Student Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Reason (if absent)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {roster.map((record) => (
                                <TableRow key={record.student_id}>
                                    <TableCell>{record.roll_no || '-'}</TableCell>
                                    <TableCell className="font-medium">{record.student_name}</TableCell>
                                    <TableCell>
                                        <Badge variant={record.status === 'present' ? 'default' : 'destructive'} className={record.status === 'present' ? 'bg-green-100 text-green-800' : ''}>
                                            {record.status === 'present' ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                                            {record.status.toUpperCase()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{record.reason || '-'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

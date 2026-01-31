"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Users, CheckCircle, AlertCircle, Clock, Search, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import Link from 'next/link';

import { HealthDashboardSkeleton } from "@/components/skeletons/HealthDashboardSkeleton";

interface SectionAttendance {
// ...
export default function PrincipalHealthPage() {
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    // ...
    const { data: summary, isLoading } = useQuery<SectionAttendance[]>({
        // ...
    });

    const stats = {
        totalSections: summary?.length || 0,
        submittedCount: summary?.filter(s => s.status === 'submitted' || s.status === 'locked').length || 0,
        overallAttendance: summary && summary.length > 0
            ? summary.reduce((acc, curr) => acc + curr.attendance_percentage, 0) / summary.length
            : 0,
        alerts: summary?.filter(s => s.status === 'no_session' || s.attendance_percentage < 85).length || 0
    };

    if (isLoading) return <HealthDashboardSkeleton />;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">School Health</h2>
                    <p className="text-muted-foreground">Attendance compliance and section-wise performance for {format(new Date(date), 'MMMM dd, yyyy')}.</p>
                </div>
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="border p-2 rounded-md"
                />
            </div>

            {/* Top Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Overall Attendance</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.overallAttendance.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">Average across all sections</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Submissions</CardTitle>
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.submittedCount} / {stats.totalSections}</div>
                        <p className="text-xs text-muted-foreground">Sections submitted today</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Alerts</CardTitle>
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.alerts}</div>
                        <p className="text-xs text-muted-foreground">Require attention</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
                {/* Attendance Matrix */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Section Attendance Matrix</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Section</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Attendance %</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {summary?.map((section) => (
                                        <TableRow key={section.section_id}>
                                            <TableCell className="font-medium">{section.section_name}</TableCell>
                                            <TableCell>
                                                <Badge variant={
                                                    section.status === 'submitted' || section.status === 'locked'
                                                        ? 'outline'
                                                        : section.status === 'draft' ? 'secondary' : 'default'
                                                } className={
                                                    section.status === 'submitted' || section.status === 'locked'
                                                        ? 'text-emerald-700 border-emerald-200 bg-emerald-50'
                                                        : section.status === 'draft'
                                                            ? 'text-blue-700 border-blue-200 bg-blue-50'
                                                            : 'text-amber-700 border-amber-200 bg-amber-50 hover:bg-amber-100'
                                                }>
                                                    {section.status === 'no_session' ? 'Pending' : section.status.toUpperCase()}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-mono">
                                                {section.attendance_percentage > 0 ? `${section.attendance_percentage}%` : '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Link href={`/principal/section/${section.section_id}?date=${date}`} className="text-sm text-blue-600 hover:underline flex items-center justify-end">
                                                    View Details <ChevronRight className="ml-1 h-3 w-3" />
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Alerts Panel */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-amber-700 flex items-center">
                                <AlertCircle className="h-5 w-5 mr-2" />
                                Attention Needed
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {summary?.filter(s => s.status === 'no_session').map(s => (
                                <Alert key={s.section_id} className="border-amber-200 bg-amber-50">
                                    <Clock className="h-4 w-4 text-amber-600" />
                                    <AlertTitle className="text-amber-800">Submission Pending</AlertTitle>
                                    <AlertDescription className="text-amber-700">
                                        {s.section_name} has not submitted attendance yet.
                                    </AlertDescription>
                                </Alert>
                            ))}
                            {summary?.filter(s => s.status !== 'no_session' && s.attendance_percentage < 85).map(s => (
                                <Alert key={s.section_id} variant="secondary" className="border-orange-200 bg-orange-50">
                                    <AlertCircle className="h-4 w-4 text-orange-600" />
                                    <AlertTitle>Low Attendance</AlertTitle>
                                    <AlertDescription>
                                        {s.section_name} is at {s.attendance_percentage}%.
                                    </AlertDescription>
                                </Alert>
                            ))}
                            {stats.alerts === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">All clear. No alerts found.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

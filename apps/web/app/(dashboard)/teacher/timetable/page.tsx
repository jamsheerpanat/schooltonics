'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Calendar as CalendarIcon, Download, Printer } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu'];

export default function TeacherTimetablePage() {
    const [timetable, setTimetable] = useState<any>({});
    const [periods, setPeriods] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [timetableRes, periodsRes] = await Promise.all([
                api.get('/timetable/mine'),
                api.get('/periods')
            ]);
            setTimetable(timetableRes.data);
            setPeriods(periodsRes.data);
        } catch (error) {
            console.error('Failed to fetch timetable:', error);
            toast.error('Failed to load your timetable');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-24">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Weekly Schedule</h1>
                    <p className="text-muted-foreground">
                        Your assigned classes and periods for the current academic year
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                    </Button>
                    <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Export PDF
                    </Button>
                </div>
            </div>

            <Card className="overflow-hidden border-none shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white pb-8">
                    <div className="flex items-center gap-3">
                        <CalendarIcon className="h-6 w-6" />
                        <CardTitle className="text-xl">Weekly Timetable</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-0 -mt-4">
                    <div className="overflow-x-auto bg-white rounded-t-xl mx-4 shadow-sm border">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr>
                                    <th className="border-b p-4 bg-slate-50 text-left font-semibold text-slate-600 w-32">Period</th>
                                    {DAYS.map(day => (
                                        <th key={day} className="border-b p-4 bg-slate-50 text-center font-semibold text-slate-600 uppercase tracking-wider">
                                            {day}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {periods.map((period) => (
                                    <tr key={period.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="border-b p-4 align-top">
                                            <div className="font-bold text-slate-700">{period.name}</div>
                                            <div className="text-xs text-slate-400 font-medium">
                                                {period.start_time.substring(0, 5)} - {period.end_time.substring(0, 5)}
                                            </div>
                                        </td>
                                        {DAYS.map(day => {
                                            const entries = timetable[day] || [];
                                            const entry = entries.find((e: any) => e.period_id === period.id);

                                            return (
                                                <td key={day} className="border-b border-l p-3 align-top min-w-[150px]">
                                                    {entry ? (
                                                        <div className="bg-gradient-to-br from-white to-slate-50 p-3 rounded-lg border border-slate-200 shadow-sm group-hover:border-blue-200 transition-all">
                                                            <p className="font-bold text-blue-700 text-sm leading-tight mb-1">
                                                                {entry.subject.name}
                                                            </p>
                                                            <div className="flex items-center gap-1.5 mt-2">
                                                                <div className="h-1.5 w-1.5 rounded-full bg-blue-400"></div>
                                                                <p className="text-[11px] font-semibold text-slate-500">
                                                                    {entry.section.grade.name} - {entry.section.name}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <span className="text-[10px] text-slate-300 font-medium">Free Period</span>
                                                        </div>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Class Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                <span className="text-sm font-medium text-slate-600">Total Weekly Periods</span>
                                <span className="font-bold text-blue-600">
                                    {Object.values(timetable).flat().length}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                <span className="text-sm font-medium text-slate-600">Active Sections</span>
                                <span className="font-bold text-indigo-600">
                                    {[...new Set(Object.values(timetable).flat().map((e: any) => e.section_id))].length}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Reminders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3 text-sm text-slate-600">
                            <li className="flex gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0"></div>
                                Please ensure all session notes are uploaded within 24 hours of the class.
                            </li>
                            <li className="flex gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0"></div>
                                Mark attendance immediately at the start of each period.
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

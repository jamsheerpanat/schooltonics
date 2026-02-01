'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Calendar as CalendarIcon, Clock, User, BookOpen } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu'];

export default function StudentTimetablePage() {
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
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Weekly Learning Schedule</h1>
                <p className="text-slate-500">
                    Stay on top of your classes and track your weekly educational journey
                </p>
            </div>

            {/* Matrix View (Desktop) */}
            <div className="hidden lg:block">
                <Card className="border-none shadow-xl overflow-hidden rounded-2xl">
                    <CardHeader className="bg-slate-900 text-white py-6">
                        <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-indigo-400" />
                            <CardTitle>Timetable Overview</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr>
                                    <th className="p-4 bg-slate-50 border-b text-left text-xs font-bold text-slate-400 uppercase tracking-widest w-24">Time</th>
                                    {DAYS.map(day => (
                                        <th key={day} className="p-4 bg-slate-50 border-b border-l text-center text-xs font-bold text-slate-900 uppercase tracking-widest">
                                            {day}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {periods.map((period) => (
                                    <tr key={period.id}>
                                        <td className="p-4 border-b text-center bg-slate-50/30">
                                            <span className="text-sm font-bold text-slate-700">{period.start_time.substring(0, 5)}</span>
                                            <span className="block text-[10px] text-slate-400">{period.name}</span>
                                        </td>
                                        {DAYS.map(day => {
                                            const entries = timetable[day] || [];
                                            const entry = entries.find((e: any) => e.period_id === period.id);

                                            return (
                                                <td key={day} className="p-2 border-b border-l align-top min-w-[140px] h-24">
                                                    {entry ? (
                                                        <div className="h-full bg-indigo-50/50 border border-indigo-100 rounded-xl p-3 flex flex-col justify-between hover:bg-indigo-50 transition-colors">
                                                            <div>
                                                                <p className="font-bold text-indigo-900 text-sm">{entry.subject.name}</p>
                                                                <div className="flex items-center gap-1 mt-1">
                                                                    <User className="h-3 w-3 text-indigo-400" />
                                                                    <p className="text-[10px] font-medium text-slate-500 italic">{entry.teacher.name}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : period.name === 'Break' ? (
                                                        <div className="h-full flex items-center justify-center bg-amber-50/30 border border-dashed border-amber-200 rounded-xl">
                                                            <span className="text-[10px] font-bold text-amber-500 tracking-widest uppercase">Break</span>
                                                        </div>
                                                    ) : null}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>

            {/* Mobile View (Stacked by Day) */}
            <div className="lg:hidden space-y-6">
                {DAYS.map(day => {
                    const entries = timetable[day] || [];
                    if (entries.length === 0) return null;

                    return (
                        <div key={day} className="space-y-3">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 pl-1">{day}</h3>
                            {periods.map(period => {
                                const entry = entries.find((e: any) => e.period_id === period.id);
                                if (!entry && period.name !== 'Break') return null;

                                return (
                                    <div key={period.id} className={`flex items-center gap-4 p-4 rounded-xl border ${period.name === 'Break' ? 'bg-amber-50/30 border-dashed border-amber-200' : 'bg-white shadow-sm'}`}>
                                        <div className="w-16 text-center shrink-0">
                                            <p className="text-sm font-bold text-slate-900">{period.start_time.substring(0, 5)}</p>
                                            <p className="text-[10px] text-slate-400 uppercase font-medium">{period.name}</p>
                                        </div>
                                        <div className="h-8 w-px bg-slate-100"></div>
                                        {entry ? (
                                            <div className="flex-1">
                                                <p className="font-bold text-slate-900">{entry.subject.name}</p>
                                                <p className="text-xs text-slate-500">{entry.teacher.name}</p>
                                            </div>
                                        ) : (
                                            <p className="flex-1 text-sm font-bold text-amber-500 uppercase tracking-widest">School Break</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

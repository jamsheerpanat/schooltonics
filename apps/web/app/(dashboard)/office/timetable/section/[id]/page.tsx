"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/api";
import { toast } from "sonner";

export default function SectionTimetablePage({ params }: { params: Promise<{ id: string }> }) {
    const { id: sectionId } = use(params);
    const [timetable, setTimetable] = useState<any>({});
    const [periods, setPeriods] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        day_of_week: "sun",
        period_id: "",
        subject_id: "",
        teacher_user_id: ""
    });

    const days = ['sun', 'mon', 'tue', 'wed', 'thu'];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [timetableRes, structureRes, teachersRes, periodsRes] = await Promise.all([
                    api.get(`/timetable/section/${sectionId}`),
                    api.get('/academic/structure'),
                    api.get('/teachers'),
                    api.get('/periods')
                ]);

                setTimetable(timetableRes.data);
                setSubjects(structureRes.data.subjects);
                setTeachers(teachersRes.data);
                setPeriods(periodsRes.data);
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Failed to load timetable data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [sectionId]);

    const handleAddEntry = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/timetable-entries', {
                ...formData,
                section_id: parseInt(sectionId)
            });
            toast.success("Entry added successfully");
            // Refresh timetable
            const response = await api.get(`/timetable/section/${sectionId}`);
            setTimetable(response.data);
        } catch (error: any) {
            const message = error.response?.data?.message || "Failed to add entry";
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8">Loading timetable...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Manage Timetable</h2>
                <Link href="/office/timetable" className="text-sm text-blue-500 hover:underline">← Back to Sections</Link>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Form Card */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Add Entry</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddEntry} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Day of Week</Label>
                                <Select value={formData.day_of_week} onValueChange={(v) => setFormData({ ...formData, day_of_week: v })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {days.map(day => <SelectItem key={day} value={day}>{day.toUpperCase()}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Period</Label>
                                <Select value={formData.period_id} onValueChange={(v) => setFormData({ ...formData, period_id: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select period" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {periods.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name} ({p.start_time.substring(0, 5)} - {p.end_time.substring(0, 5)})</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Subject</Label>
                                <Select value={formData.subject_id} onValueChange={(v) => setFormData({ ...formData, subject_id: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select subject" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subjects.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Teacher</Label>
                                <Select value={formData.teacher_user_id} onValueChange={(v) => setFormData({ ...formData, teacher_user_id: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select teacher" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {teachers.map(t => <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button type="submit" className="w-full" disabled={submitting}>
                                {submitting ? "Adding..." : "Add to Timetable"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Grid Card */}
                <Card className="lg:col-span-2 overflow-x-auto">
                    <CardHeader>
                        <CardTitle>Timetable Grid</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <table className="w-full border-collapse">
                            <thead>
                                <tr>
                                    <th className="border p-2 bg-muted text-left">Period</th>
                                    {days.map(day => <th key={day} className="border p-2 bg-muted text-center uppercase">{day}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {periods.map(period => (
                                    <tr key={period.id}>
                                        <td className="border p-2 font-medium">
                                            {period.name}<br />
                                            <span className="text-xs text-muted-foreground">{period.start_time.substring(0, 5)} - {period.end_time.substring(0, 5)}</span>
                                        </td>
                                        {days.map(day => {
                                            const entry = timetable[day]?.find((e: any) => e.period_id === period.id);
                                            return (
                                                <td key={day} className="border p-2 text-center align-middle">
                                                    {entry ? (
                                                        <div className="bg-blue-50 p-2 rounded border border-blue-100">
                                                            <p className="font-bold text-sm">{entry.subject.name}</p>
                                                            <p className="text-[10px] text-muted-foreground">{entry.teacher.name}</p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs italic">-</span>
                                                    )}
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
        </div>
    );
}

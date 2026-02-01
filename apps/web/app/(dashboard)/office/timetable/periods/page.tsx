'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { toast } from "sonner";
import { Plus, Trash2, ArrowLeft, Clock } from "lucide-react";

export default function ManagePeriodsPage() {
    const [periods, setPeriods] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        start_time: "",
        end_time: "",
        sort_order: 1
    });

    useEffect(() => {
        fetchPeriods();
    }, []);

    const fetchPeriods = async () => {
        setLoading(true);
        try {
            const response = await api.get('/periods');
            setPeriods(response.data);
        } catch (error) {
            toast.error("Failed to load periods");
        } finally {
            setLoading(false);
        }
    };

    const handleAddPeriod = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/periods', formData);
            toast.success("Period added successfully");
            setFormData({ name: "", start_time: "", end_time: "", sort_order: periods.length + 2 });
            fetchPeriods();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to add period");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Link href="/office/timetable">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Academic Periods</h2>
                        <p className="text-muted-foreground">Define the time slots for classes</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Add New Period</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddPeriod} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Period Name (e.g. P1, Break)</Label>
                                <Input
                                    placeholder="P1"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Start Time</Label>
                                    <Input
                                        type="time"
                                        value={formData.start_time}
                                        onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>End Time</Label>
                                    <Input
                                        type="time"
                                        value={formData.end_time}
                                        onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Sort Order</Label>
                                <Input
                                    type="number"
                                    value={formData.sort_order}
                                    onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={submitting}>
                                <Plus className="h-4 w-4 mr-2" />
                                {submitting ? "Adding..." : "Add Period"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Defined Periods</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {periods.map((period) => (
                                <div key={period.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold">
                                            {period.name}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-3 w-3 text-slate-400" />
                                                <span className="font-medium">
                                                    {period.start_time.substring(0, 5)} - {period.end_time.substring(0, 5)}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1">Order Index: {period.sort_order}</p>
                                        </div>
                                    </div>

                                    {/* Delete period logic could be added here if needed, 
                                        but deleting a period might break existing timetable entries. 
                                        So for now we just list them. */}
                                </div>
                            ))}
                            {periods.length === 0 && (
                                <div className="text-center py-12 text-slate-400">
                                    No periods defined yet.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

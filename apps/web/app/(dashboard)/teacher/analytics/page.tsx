'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Loader2,
    TrendingUp,
    TrendingDown,
    Users,
    Award,
    Calendar,
    Filter,
    Download
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    PieChart,
    Pie
} from 'recharts';

interface AnalyticsData {
    attendanceTrends: Array<{ date: string; rate: number }>;
    gradeDistribution: Array<{ letter: string; count: number }>;
    sectionPerformance: Array<{ name: string; average: number }>;
    summary: {
        avgAttendance: number;
        avgGrade: number;
        totalAssignments: number;
    };
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#6366f1'];

export default function TeacherAnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/teacher/analytics/overview');
            setData(response.data);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
            toast.error('Failed to lead analytics data');
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

    if (!data) return null;

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Academic Insights</h1>
                    <p className="text-muted-foreground">
                        Real-time analytics and performance trends for your classes
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={fetchAnalytics}>
                        <Calendar className="mr-2 h-4 w-4" />
                        Last 30 Days
                    </Button>
                    <Button size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download Report
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-blue-800">Average Attendance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-900">{data.summary.avgAttendance.toFixed(1)}%</div>
                        <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                            <TrendingUp className="h-3 w-3" />
                            <span>2.4% vs last month</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-800">Class Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-emerald-900">{data.summary.avgGrade.toFixed(1)}%</div>
                        <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                            <TrendingUp className="h-3 w-3" />
                            <span>1.5% improvement</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-purple-800">Active Assignments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-purple-900">{data.summary.totalAssignments}</div>
                        <p className="text-xs text-muted-foreground mt-1">For current academic year</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Attendance Trend */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Attendance Trends</CardTitle>
                                <CardDescription>Daily percentage of student presence</CardDescription>
                            </div>
                            <TrendingUp className="h-5 w-5 text-green-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data.attendanceTrends}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} domain={[70, 100]} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        formatter={(val) => [`${val}%`, 'Presence']}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="rate"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }}
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Section Comparison */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Class Performance Comparison</CardTitle>
                                <CardDescription>Mean percentage per section</CardDescription>
                            </div>
                            <Award className="h-5 w-5 text-yellow-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.sectionPerformance} layout="vertical">
                                    <XAxis type="number" domain={[0, 100]} hide />
                                    <YAxis dataKey="name" type="category" width={120} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#666' }} />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="average" radius={[0, 4, 4, 0]} barSize={20}>
                                        {data.sectionPerformance.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Grade Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Grade Distribution</CardTitle>
                        <CardDescription>Frequency of letter grades across all activities</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.gradeDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="count"
                                        nameKey="letter"
                                    >
                                        {data.gradeDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center gap-4 mt-2">
                            {data.gradeDistribution.map((g, idx) => (
                                <div key={g.letter} className="flex items-center gap-1.5">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                    <span className="text-xs font-medium text-muted-foreground">{g.letter} ({g.count})</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Action Items */}
                <Card>
                    <CardHeader>
                        <CardTitle>AI-Driven Action Items</CardTitle>
                        <CardDescription>Personalized recommendations for your classes</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-4 p-3 border rounded-lg bg-red-50/50 border-red-100">
                            <div className="h-10 w-10 h-10 w-10 shrink-0 bg-red-100 rounded-full flex items-center justify-center">
                                <TrendingDown className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-red-900">Attendance Drop in Grade 10 - B</h4>
                                <p className="text-xs text-red-700">Attendance has fallen by 8% this week. Consider sending a broadcast to parents.</p>
                                <Button size="sm" variant="ghost" className="mt-2 text-red-700 h-7 text-xs p-0 hover:bg-transparent hover:text-red-900 underline">Send Broadcast</Button>
                            </div>
                        </div>

                        <div className="flex gap-4 p-3 border rounded-lg bg-emerald-50/50 border-emerald-100">
                            <div className="h-10 w-10 h-10 w-10 shrink-0 bg-emerald-100 rounded-full flex items-center justify-center">
                                <Award className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-emerald-900">Top Performers Highlight</h4>
                                <p className="text-xs text-emerald-700">5 students in Mathematics achieved A+ in 3 consecutive assignments. Issue recognitions?</p>
                                <Button size="sm" variant="ghost" className="mt-2 text-emerald-700 h-7 text-xs p-0 hover:bg-transparent hover:text-emerald-900 underline">Issue Awards</Button>
                            </div>
                        </div>

                        <div className="flex gap-4 p-3 border rounded-lg bg-blue-50/50 border-blue-100">
                            <div className="h-10 w-10 h-10 w-10 shrink-0 bg-blue-100 rounded-full flex items-center justify-center">
                                <Calendar className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-blue-900">Assignment Fatigue Detected</h4>
                                <p className="text-xs text-blue-700">Next week has 4 due dates. Students might feel overwhelmed. Adjust dates?</p>
                                <Button size="sm" variant="ghost" className="mt-2 text-blue-700 h-7 text-xs p-0 hover:bg-transparent hover:text-blue-900 underline">View Calendar</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

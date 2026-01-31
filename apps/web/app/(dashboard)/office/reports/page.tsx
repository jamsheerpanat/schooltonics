'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from '@/components/ui/input';
import { Download, FileBarChart, Users, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { TableSkeleton } from '@/components/skeletons/TableSkeleton';

export default function ReportsPage() {
    const [activeTab, setActiveTab] = useState('attendance');
    const [data, setData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    const fetchReport = async (type: string) => {
        setIsLoading(true);
        let endpoint = '';

        switch (type) {
            case 'attendance':
                endpoint = `/reports/attendance?date=${date}`;
                break;
            case 'dues':
                endpoint = '/reports/fees/outstanding';
                break;
            case 'students':
                endpoint = '/reports/students';
                break;
        }

        try {
            const response = await api.get(endpoint);
            setData(response.data.data);
        } catch (error) {
            console.error('Failed to fetch report:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = () => {
        if (data.length === 0) return;

        // Simple CSV conversion
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(fieldName =>
                JSON.stringify(row[fieldName], (key, value) => value === null ? '' : value)
            ).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `report_${activeTab}_${format(new Date(), 'yyyyMMdd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Operational Reports</h1>
                    <p className="text-muted-foreground">Real-time data for school management.</p>
                </div>
                <Button onClick={handleDownload} disabled={data.length === 0} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                </Button>
            </div>

            <Tabs defaultValue="attendance" onValueChange={(v) => { setActiveTab(v); setData([]); }}>
                <TabsList className="grid w-full grid-cols-3 max-w-md">
                    <TabsTrigger value="attendance">Attendance</TabsTrigger>
                    <TabsTrigger value="dues">Dues</TabsTrigger>
                    <TabsTrigger value="students">Students</TabsTrigger>
                </TabsList>

                <div className="mt-6">
                    {activeTab === 'attendance' && (
                        <div className="flex items-center gap-4 mb-4">
                            <Input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-48"
                            />
                            <Button onClick={() => fetchReport('attendance')}>Generate Report</Button>
                        </div>
                    )}

                    {(activeTab === 'dues' || activeTab === 'students') && (
                        <div className="mb-4">
                            <Button onClick={() => fetchReport(activeTab)}>Generate Report</Button>
                        </div>
                    )}

                    <Card>
                        <CardContent className="p-0">
                            {isLoading ? (
                                <div className="p-4">
                                    <TableSkeleton rows={8} />
                                </div>
                            ) : data.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground">No data available. Click 'Generate Report' to view.</div>
                            ) : (
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                {Object.keys(data[0]).map((head) => (
                                                    <TableHead key={head} className="capitalize">{head.replace('_', ' ')}</TableHead>
                                                ))}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {data.map((row, i) => (
                                                <TableRow key={i}>
                                                    {Object.values(row).map((cell: any, j) => (
                                                        <TableCell key={j} className="font-medium">
                                                            {typeof cell === 'object' ? JSON.stringify(cell) : cell}
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </Tabs>
        </div>
    );
}

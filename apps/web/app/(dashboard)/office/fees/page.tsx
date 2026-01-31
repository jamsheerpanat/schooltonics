'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, ChevronRight, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default function OfficeFeesPage() {
    const [students, setStudents] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/students');
            setStudents(response.data);
        } catch (error) {
            console.error('Failed to fetch students:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredStudents = students.filter(student =>
        student.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.admission_number.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Fee Management</h1>
                    <p className="text-muted-foreground">Manage student dues and record fee receipts.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Find Student</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or admission number..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        {isLoading ? (
                            <div className="text-center py-4 text-muted-foreground">Loading student records...</div>
                        ) : filteredStudents.length === 0 ? (
                            <div className="text-center py-4 text-muted-foreground">No students found matching your criteria.</div>
                        ) : (
                            <div className="grid gap-2">
                                {filteredStudents.map((student) => (
                                    <div
                                        key={student.id}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
                                                {student.first_name[0]}{student.last_name[0]}
                                            </div>
                                            <div>
                                                <div className="font-medium">{student.first_name} {student.last_name}</div>
                                                <div className="text-sm text-muted-foreground">ID: {student.admission_number}</div>
                                            </div>
                                        </div>
                                        <Link href={`/office/fees/student/${student.id}`}>
                                            <Button variant="outline" size="sm">
                                                View Dues <ChevronRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function AddTeacherPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // API call would go here
            toast.info('Teacher creation feature coming soon!');
            setTimeout(() => router.push('/office/teachers'), 1500);
        } catch (error: any) {
            console.error('Failed to add teacher:', error);
            toast.error('Failed to add teacher');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/office/teachers">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Add New Teacher</h1>
                    <p className="text-muted-foreground">
                        Create a new teacher record
                    </p>
                </div>
            </div>

            {/* Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Teacher Information</CardTitle>
                    <CardDescription>
                        Enter the basic details for the new teacher
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name *</Label>
                                <Input
                                    id="name"
                                    placeholder="Enter teacher's full name"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="teacher@school.com"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="+1 234 567 8900"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="subject">Primary Subject</Label>
                                <Input
                                    id="subject"
                                    placeholder="e.g., Mathematics"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? 'Adding...' : 'Add Teacher'}
                            </Button>
                            <Link href="/office/teachers">
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Info Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Next Steps</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        After creating the teacher record, you'll be able to:
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground list-disc list-inside">
                        <li>Assign subjects and classes</li>
                        <li>Create timetable entries</li>
                        <li>Upload qualifications</li>
                        <li>Set permissions and access</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}

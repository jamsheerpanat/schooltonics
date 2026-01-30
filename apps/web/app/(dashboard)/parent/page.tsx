"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ParentPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Parent Portal</h2>
                <p className="text-muted-foreground">View your child's progress and school updates.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Notices</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="font-semibold">Parent-Teacher Meeting</p>
                        <p className="text-sm text-muted-foreground">Friday, 10:00 AM</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

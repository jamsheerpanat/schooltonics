"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OfficePage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Office Dashboard</h2>
                <p className="text-muted-foreground">Manage administrative tasks and records.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Admissions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">12</p>
                        <p className="text-muted-foreground">Pending Applications</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Fees Collected</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">$12,450</p>
                        <p className="text-muted-foreground">This Month</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

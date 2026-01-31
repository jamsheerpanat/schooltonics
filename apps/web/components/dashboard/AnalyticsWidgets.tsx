'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Dynamic Chart
const AttendanceTrendChart = dynamic(
    () => import('@/components/charts/AttendanceTrendChart').catch(() => () => <div>Chart Unavailable</div>),
    {
        loading: () => <Skeleton className="h-[300px] w-full" />,
        ssr: false
    }
);

export default function AnalyticsWidgets() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Trends</CardTitle>
            </CardHeader>
            <CardContent>
                <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
                    {/* Placeholder for future charting component */}
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                        Analytics Viz Loading...
                    </div>
                </Suspense>
            </CardContent>
        </Card>
    );
}

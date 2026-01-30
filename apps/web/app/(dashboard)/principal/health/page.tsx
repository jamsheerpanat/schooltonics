"use client";

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, CheckCircle, Server, Shield } from "lucide-react";

interface HealthData {
    status: string;
    app: string;
    version: string;
}

export default function PrincipalHealthPage() {
    const { data, isLoading, isError, error } = useQuery<HealthData>({
        queryKey: ['health'],
        queryFn: async () => {
            const response = await api.get('/health');
            return response.data;
        },
    });

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">System Status</h2>
                <p className="text-muted-foreground">Monitor the health of the OctoSchool Engine.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">API Status</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="text-2xl font-bold animate-pulse">Checking...</div>
                        ) : isError ? (
                            <div className="text-2xl font-bold text-red-500">Error</div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <div className="text-2xl font-bold">{data?.status === 'ok' ? 'Operational' : 'Issues'}</div>
                                <Badge variant={data?.status === 'ok' ? "default" : "destructive"}>{data?.status}</Badge>
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                            Backend connectivity check
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Version</CardTitle>
                        <Server className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data?.version || 'Unknown'}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {data?.app || 'N/A'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {isError && (
                <Card className="border-red-200 bg-red-50 dark:bg-red-900/10">
                    <CardHeader>
                        <CardTitle className="text-red-500 flex items-center">
                            <Shield className="h-5 w-5 mr-2" />
                            Connection Failure
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-red-600 dark:text-red-400">
                        <p>Could not connect to the API server at <code>{process.env.NEXT_PUBLIC_API_URL}</code></p>
                        <p className="text-sm mt-2 opacity-80">{(error as Error).message}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

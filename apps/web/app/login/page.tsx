'use client';

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const getRoleDashboard = (role: string) => {
        const dashboards: Record<string, string> = {
            'principal': '/principal/health',
            'office': '/office/announcements',
            'teacher': '/teacher/attendance',
            'student': '/student/today',
            'parent': '/parent',
        };
        return dashboards[role] || '/principal/health';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await api.post('/auth/login', {
                email,
                password,
                device_name: 'web'
            });

            // Validate response structure
            if (!response.data) {
                throw new Error('Invalid response from server');
            }

            if (!response.data.token) {
                throw new Error('No token received from server');
            }

            if (!response.data.user || !response.data.user.role) {
                throw new Error('Invalid user data received from server');
            }

            // Store token and user data
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            // Redirect based on user role
            const dashboard = getRoleDashboard(response.data.user.role);
            router.push(dashboard);
        } catch (err: any) {
            console.error('Login failed:', err);
            console.error('Error details:', {
                status: err.response?.status,
                data: err.response?.data,
                message: err.message
            });

            if (err.response?.status === 422) {
                setError('Invalid email or password');
            } else if (err.response?.status === 403) {
                setError(err.response.data?.message || 'Your account is inactive');
            } else if (err.message) {
                setError(err.message);
            } else {
                setError('Login failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Login</CardTitle>
                    <CardDescription>
                        Enter your credentials to access your account.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="grid gap-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="principal@octoschool.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="text-xs text-muted-foreground">
                            <p className="font-medium mb-1">Demo Accounts:</p>
                            <p>Principal: principal@octoschool.com</p>
                            <p>Office: office@octoschool.com</p>
                            <p>Teacher: teacher1@octoschool.com</p>
                            <p>Student: student1@octoschool.com</p>
                            <p>Parent: parent1@octoschool.com</p>
                            <p className="mt-1">Password: <span className="font-mono">password</span></p>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign in'
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}

'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Plus, Send } from 'lucide-react';
import { format } from 'date-fns';

export default function AnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [audience, setAudience] = useState('all');

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const response = await api.get('/announcements');
            setAnnouncements(response.data);
        } catch (error) {
            console.error('Failed to fetch announcements:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !body) return;

        setIsSubmitting(true);
        try {
            await api.post('/announcements', {
                title,
                body,
                audience,
                publish_at: new Date().toISOString(),
            });
            setTitle('');
            setBody('');
            setAudience('all');
            setShowForm(false);
            fetchAnnouncements();
        } catch (error) {
            console.error('Failed to create announcement:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
                    <p className="text-muted-foreground">Broadcast school-wide information and updates.</p>
                </div>
                <Button onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : (
                        <>
                            <Plus className="mr-2 h-4 w-4" />
                            New Announcement
                        </>
                    )}
                </Button>
            </div>

            {showForm && (
                <Card className="border-blue-200 bg-blue-50/30">
                    <CardHeader>
                        <CardTitle>Create Announcement</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    placeholder="Academic Holiday Notice"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="audience">Audience</Label>
                                <select
                                    id="audience"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={audience}
                                    onChange={(e) => setAudience(e.target.value)}
                                >
                                    <option value="all">All</option>
                                    <option value="teacher">Teachers</option>
                                    <option value="student">Students</option>
                                    <option value="parent">Parents</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="body">Content</Label>
                                <textarea
                                    id="body"
                                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Enter the announcement details..."
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" disabled={isSubmitting} className="w-full">
                                {isSubmitting ? 'Publishing...' : (
                                    <>
                                        <Send className="mr-2 h-4 w-4" />
                                        Publish Now
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            {isLoading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : (
                <div className="grid gap-4">
                    {announcements.length === 0 ? (
                        <div className="text-center p-12 bg-muted/20 rounded-lg border-2 border-dashed">
                            <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No announcements have been published yet.</p>
                        </div>
                    ) : (
                        announcements.map((ann) => (
                            <Card key={ann.id}>
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <CardTitle className="text-xl">{ann.title}</CardTitle>
                                            <div className="text-xs text-muted-foreground">
                                                Published on {format(new Date(ann.publish_at), 'PPP')}
                                            </div>
                                        </div>
                                        <Badge variant={ann.audience === 'all' ? 'default' : 'secondary'}>
                                            {ann.audience.toUpperCase()}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{ann.body}</p>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

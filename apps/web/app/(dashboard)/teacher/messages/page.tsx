'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Megaphone,
    Plus,
    Search,
    Loader2,
    Send,
    Users,
    Calendar,
    AlertTriangle,
    Bell
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@/components/ui/sheet";

interface Announcement {
    id: number;
    title: string;
    body: string;
    priority: 'low' | 'medium' | 'high';
    audience: string;
    target_name: string;
    created_at: string;
}

export default function CommunicationPage() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        body: '',
        section_id: 'all',
        priority: 'medium',
        audience: 'all'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [annRes, classRes] = await Promise.all([
                api.get('/teacher/announcements'),
                api.get('/teacher/classes')
            ]);
            setAnnouncements(annRes.data);
            setClasses(classRes.data);
        } catch (error) {
            console.error('Failed to fetch communication data:', error);
            toast.error('Failed to lead announcements');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = async () => {
        if (!formData.title || !formData.body) {
            toast.error('Please provide both title and content');
            return;
        }

        setIsSending(true);
        try {
            await api.post('/teacher/announcements', {
                ...formData,
                section_id: formData.section_id === 'all' ? null : parseInt(formData.section_id)
            });
            toast.success('Announcement posted successfully!');
            setIsSheetOpen(false);
            setFormData({
                title: '',
                body: '',
                section_id: 'all',
                priority: 'medium',
                audience: 'all'
            });
            fetchData();
        } catch (error) {
            console.error('Failed to post announcement:', error);
            toast.error('Failed to post announcement');
        } finally {
            setIsSending(false);
        }
    };

    const filteredAnnouncements = announcements.filter(a =>
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.body.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'high': return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none">High Priority</Badge>;
            case 'medium': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">Medium</Badge>;
            default: return <Badge variant="outline">Low</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Communication Hub</h1>
                    <p className="text-muted-foreground">
                        Post announcements and updates to your students and parents
                    </p>
                </div>
                <Button onClick={() => setIsSheetOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Announcement
                </Button>
            </div>

            {/* Sub-header Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Posts</CardTitle>
                        <Megaphone className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{announcements.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Read Rate</CardTitle>
                        <Bell className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">82%</div>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search announcements..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Announcements List */}
            {isLoading ? (
                <div className="flex justify-center py-24">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredAnnouncements.length > 0 ? (
                        filteredAnnouncements.map((ann) => (
                            <Card key={ann.id} className="overflow-hidden hover:shadow-md transition-shadow">
                                <div className={`h-1 w-full ${ann.priority === 'high' ? 'bg-red-500' : ann.priority === 'medium' ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <CardTitle className="text-lg">{ann.title}</CardTitle>
                                                {getPriorityBadge(ann.priority)}
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Users className="h-3 w-3" />
                                                    {ann.target_name}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(ann.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3">
                                        {ann.body}
                                    </p>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="py-24 text-center text-muted-foreground">
                            No announcements found. Start by creating one!
                        </div>
                    )}
                </div>
            )}

            {/* New Announcement Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="sm:max-w-xl overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>New Announcement</SheetTitle>
                        <SheetDescription>
                            Broadcast a message to your students and their parents.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="space-y-6 py-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Broadcasting To</label>
                            <Select
                                value={formData.section_id}
                                onValueChange={(val) => setFormData({ ...formData, section_id: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All My Classes</SelectItem>
                                    {classes.map(cls => (
                                        <SelectItem key={cls.section_id} value={cls.section_id.toString()}>
                                            {cls.section_name} ({cls.subject})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Audience</label>
                                <Select
                                    value={formData.audience}
                                    onValueChange={(val) => setFormData({ ...formData, audience: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Students & Parents</SelectItem>
                                        <SelectItem value="student">Students Only</SelectItem>
                                        <SelectItem value="parent">Parents Only</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Priority</label>
                                <Select
                                    value={formData.priority}
                                    onValueChange={(val: any) => setFormData({ ...formData, priority: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Subject / Title</label>
                            <Input
                                placeholder="Important update: Parent-teacher meeting"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Content</label>
                            <Textarea
                                placeholder="Dear parents and students, please note that..."
                                className="min-h-[200px]"
                                value={formData.body}
                                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                            />
                        </div>

                        <div className="p-4 bg-orange-50 border border-orange-100 rounded-lg flex gap-3">
                            <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0" />
                            <p className="text-xs text-orange-700">
                                Selecting "High Priority" will trigger a push notification to all mobile app users in the selected audience.
                            </p>
                        </div>
                    </div>

                    <SheetFooter>
                        <Button className="w-full" onClick={handleSend} disabled={isSending}>
                            {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                            Post Announcement
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </div>
    );
}

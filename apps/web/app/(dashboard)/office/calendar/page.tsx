'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Plus,
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Clock
} from 'lucide-react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths
} from 'date-fns';

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [visibility, setVisibility] = useState('all');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchEvents();
    }, [currentDate]);

    const fetchEvents = async () => {
        setIsLoading(true);
        try {
            const from = format(startOfWeek(startOfMonth(currentDate)), 'yyyy-MM-dd');
            const to = format(endOfWeek(endOfMonth(currentDate)), 'yyyy-MM-dd');
            const response = await api.get(`/calendar/events?from=${from}&to=${to}`);
            setEvents(response.data);
        } catch (error) {
            console.error('Failed to fetch events:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !startDate || !endDate) return;

        setIsSubmitting(true);
        try {
            await api.post('/calendar/events', {
                title,
                description,
                start_date: startDate,
                end_date: endDate,
                visibility,
            });
            setTitle('');
            setDescription('');
            setVisibility('all');
            setShowModal(false);
            fetchEvents();
        } catch (error) {
            console.error('Failed to create event:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Calendar logic
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDateCalendar = startOfWeek(monthStart);
    const endDateCalendar = endOfWeek(monthEnd);
    const calendarDays = eachDayOfInterval({
        start: startDateCalendar,
        end: endDateCalendar,
    });

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Academic Calendar</h1>
                    <p className="text-muted-foreground">Manage holidays, events, and important deadlines.</p>
                </div>
                <Button onClick={() => setShowModal(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Event
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Calendar Grid */}
                <Card className="lg:col-span-3">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <CardTitle className="text-xl font-bold">
                            {format(currentDate, 'MMMM yyyy')}
                        </CardTitle>
                        <div className="flex space-x-2">
                            <Button variant="outline" size="icon" onClick={prevMonth}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={nextMonth}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-7 text-center font-bold text-sm text-muted-foreground mb-2">
                            <div>Sun</div>
                            <div>Mon</div>
                            <div>Tue</div>
                            <div>Wed</div>
                            <div>Thu</div>
                            <div>Fri</div>
                            <div>Sat</div>
                        </div>
                        <div className="grid grid-cols-7 border-t border-l">
                            {calendarDays.map((day, i) => {
                                const dayEvents = events.filter(event =>
                                    isSameDay(new Date(event.start_date), day) ||
                                    (day >= new Date(event.start_date) && day <= new Date(event.end_date))
                                );

                                return (
                                    <div
                                        key={i}
                                        className={`min-h-[100px] border-r border-b p-2 ${!isSameMonth(day, monthStart) ? 'bg-muted/30 text-muted-foreground' : ''
                                            }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <span className={`text-sm font-medium ${isSameDay(day, new Date()) ? 'bg-primary text-primary-foreground px-1.5 rounded-full' : ''}`}>
                                                {format(day, 'd')}
                                            </span>
                                        </div>
                                        <div className="mt-1 space-y-1">
                                            {dayEvents.map((event, idx) => (
                                                <div
                                                    key={idx}
                                                    title={event.title}
                                                    className={`text-[10px] truncate p-1 rounded border-l-2 ${event.visibility === 'all' ? 'bg-blue-100/50 border-blue-500 text-blue-700' :
                                                            event.visibility === 'teacher' ? 'bg-purple-100/50 border-purple-500 text-purple-700' :
                                                                'bg-orange-100/50 border-orange-500 text-orange-700'
                                                        }`}
                                                >
                                                    {event.title}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Sidebar: Event Form or List */}
                <div className="space-y-6">
                    {showModal && (
                        <Card className="border-blue-200">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">Add New Event</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="title" className="text-xs">Title</Label>
                                        <Input
                                            id="title"
                                            size={1}
                                            className="h-8 text-sm"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="from" className="text-xs">From</Label>
                                            <Input
                                                id="from"
                                                type="date"
                                                size={1}
                                                className="h-8 text-[10px]"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="to" className="text-xs">To</Label>
                                            <Input
                                                id="to"
                                                type="date"
                                                size={1}
                                                className="h-8 text-[10px]"
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="visibility" className="text-xs">Visibility</Label>
                                        <select
                                            id="visibility"
                                            className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                            value={visibility}
                                            onChange={(e) => setVisibility(e.target.value)}
                                        >
                                            <option value="all">All</option>
                                            <option value="teacher">Teachers</option>
                                            <option value="student">Students</option>
                                            <option value="parent">Parents</option>
                                        </select>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button type="button" variant="ghost" size="sm" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
                                        <Button type="submit" size="sm" disabled={isSubmitting} className="flex-1">
                                            {isSubmitting ? 'Saving...' : 'Save'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Upcoming</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {isLoading ? (
                                <div className="p-4 text-center text-xs text-muted-foreground">Loading events...</div>
                            ) : events.length === 0 ? (
                                <div className="p-4 text-center text-xs text-muted-foreground">No events found.</div>
                            ) : (
                                <div className="divide-y">
                                    {events.slice(0, 5).map((event, i) => (
                                        <div key={i} className="px-4 py-3 space-y-1">
                                            <div className="font-medium text-sm">{event.title}</div>
                                            <div className="flex items-center text-[10px] text-muted-foreground">
                                                <Clock className="mr-1 h-3 w-3" />
                                                {format(new Date(event.start_date), 'MMM d')} - {format(new Date(event.end_date), 'MMM d')}
                                            </div>
                                            <Badge variant="outline" className="text-[8px] h-4 py-0">
                                                {event.visibility.toUpperCase()}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

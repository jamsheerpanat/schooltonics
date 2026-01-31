'use client';

import { useState, useEffect, use } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from '@/components/ui/separator';
import {
    ArrowLeft,
    DollarSign,
    CreditCard,
    Banknote,
    Calendar as CalendarIcon,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function StudentFeesPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    // Unwrap params using React.use()
    const { id: studentId } = use(params);

    const [student, setStudent] = useState<any>(null);
    const [dues, setDues] = useState<any[]>([]);
    const [receipts, setReceipts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Receipt Form State
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState('cash');
    const [reference, setReference] = useState('');
    const [notes, setNotes] = useState('');
    const [receiptDate, setReceiptDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (studentId) {
            fetchData();
        }
    }, [studentId]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [studentRes, duesRes, receiptsRes] = await Promise.all([
                api.get(`/students/${studentId}`),
                api.get(`/fees/student/${studentId}`),
                api.get(`/fees/receipts/student/${studentId}`)
            ]);
            setStudent(studentRes.data);
            setDues(duesRes.data);
            setReceipts(receiptsRes.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReceiptSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount) return;

        if (!confirm(`Confirm receipt generation of $${amount}? This action cannot be undone.`)) {
            return;
        }

        setIsSubmitting(true);
        try {
            await api.post('/fees/receipts', {
                student_id: studentId,
                amount: parseFloat(amount),
                method,
                reference,
                notes,
                receipt_date: receiptDate
            });

            // Reset form and reload data
            setAmount('');
            setReference('');
            setNotes('');
            fetchData();
        } catch (error) {
            console.error('Failed to create receipt:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const calculateTotals = () => {
        const totalDues = dues.reduce((sum, d) => sum + parseFloat(d.amount), 0);
        const unpaidDues = dues
            .filter(d => d.status !== 'paid')
            .reduce((sum, d) => sum + parseFloat(d.amount), 0);
        // Note: This matches simple API logic where partial isn't fully tracked yet.
        // Ideally we subtract partial payments, but V1 implementation marks status.

        // Better approximation for display if we have specific "paid_amount" later:
        // For now, if status is 'paid', balance is 0. If 'partial' or 'unpaid', take full amount (conservative).

        return { totalDues, unpaidDues };
    };

    const { totalDues, unpaidDues } = calculateTotals();

    if (isLoading) {
        return <div className="p-12 text-center text-muted-foreground">Loading fee records...</div>;
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/office/fees">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {student?.first_name} {student?.last_name}
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Admission No: {student?.admission_number}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Summary & Receipt Form */}
                <div className="space-y-6">
                    <Card className={`${unpaidDues > 0 ? 'border-red-200 bg-red-50/20' : 'border-green-200 bg-green-50/20'}`}>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium uppercase text-muted-foreground">Outstanding Balance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold flex items-center">
                                <DollarSign className="h-6 w-6 text-muted-foreground mr-1" />
                                {unpaidDues.toFixed(2)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                Total Billed: ${totalDues.toFixed(2)}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-blue-200 shadow-md">
                        <CardHeader className="bg-blue-50/50 pb-4">
                            <CardTitle className="flex items-center gap-2">
                                <Banknote className="h-5 w-5 text-blue-600" />
                                New Payment
                            </CardTitle>
                            <CardDescription>Record a payment for this student.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form onSubmit={handleReceiptSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="amount">Amount ($)</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="text-lg font-bold"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="method">Method</Label>
                                        <select
                                            id="method"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={method}
                                            onChange={(e) => setMethod(e.target.value)}
                                        >
                                            <option value="cash">Cash</option>
                                            <option value="bank">Bank Transfer</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="date">Date</Label>
                                        <Input
                                            id="date"
                                            type="date"
                                            value={receiptDate}
                                            onChange={(e) => setReceiptDate(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="reference">Reference / Check No.</Label>
                                    <Input
                                        id="reference"
                                        placeholder="e.g. TRF-123456"
                                        value={reference}
                                        onChange={(e) => setReference(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notes</Label>
                                    <Input
                                        id="notes"
                                        placeholder="Optional remarks"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                    />
                                </div>

                                <Button type="submit" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting ? 'generating...' : 'Generate Receipt'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Lists */}
                <div className="lg:col-span-2">
                    <Tabs defaultValue="dues" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="dues">Dues Statement</TabsTrigger>
                            <TabsTrigger value="receipts">Payment History</TabsTrigger>
                        </TabsList>

                        <TabsContent value="dues" className="space-y-4 mt-4">
                            {dues.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
                                    No dues assigned to this student.
                                </div>
                            ) : (
                                <Card>
                                    <CardContent className="p-0">
                                        <div className="border-b px-4 py-3 bg-muted/30 font-medium text-sm grid grid-cols-4 gap-4">
                                            <div>Fee Item</div>
                                            <div>Due Date</div>
                                            <div>Status</div>
                                            <div className="text-right">Amount</div>
                                        </div>
                                        <div className="divide-y">
                                            {dues.map((due) => (
                                                <div key={due.id} className="px-4 py-3 text-sm grid grid-cols-4 gap-4 items-center">
                                                    <div className="font-medium">{due.fee_item.name}</div>
                                                    <div className="text-muted-foreground">{format(new Date(due.due_date), 'MMM d, yyyy')}</div>
                                                    <div>
                                                        <Badge variant={
                                                            due.status === 'paid' ? 'default' :
                                                                due.status === 'partial' ? 'secondary' : 'destructive'
                                                        } className="capitalize">
                                                            {due.status}
                                                        </Badge>
                                                    </div>
                                                    <div className="text-right font-medium">${parseFloat(due.amount).toFixed(2)}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="receipts" className="space-y-4 mt-4">
                            {receipts.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
                                    No receipts recorded yet.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {receipts.map((receipt) => (
                                        <Card key={receipt.id}>
                                            <CardContent className="p-4 flex justify-between items-center">
                                                <div className="flex items-start gap-3">
                                                    <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-700">
                                                        <CheckCircle2 className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-lg">
                                                            ${parseFloat(receipt.amount).toFixed(2)}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground flex gap-2">
                                                            <span>{format(new Date(receipt.receipt_date), 'PPP')}</span>
                                                            <span>•</span>
                                                            <span className="capitalize">{receipt.method}</span>
                                                            {receipt.reference && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span className="font-mono text-xs">{receipt.reference}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button variant="outline" size="sm">
                                                    Print
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}

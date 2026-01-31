import { Skeleton } from "@/components/ui/skeleton";

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-8 w-32" />
            </div>
            <div className="border rounded-md p-4 space-y-4">
                <Skeleton className="h-10 w-full" />
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="flex gap-4">
                        <Skeleton className="h-12 w-full" />
                    </div>
                ))}
            </div>
        </div>
    );
}

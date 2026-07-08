export function StatSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5" role="status" aria-label="Loading statistics">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-line bg-surface p-4">
          <div className="skeleton h-3 w-20" />
          <div className="skeleton mt-3 h-6 w-16" />
          <div className="skeleton mt-2 h-2.5 w-24" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface" role="status" aria-label="Loading table">
      <div className="border-b border-line px-5 py-4">
        <div className="skeleton h-4 w-40" />
      </div>
      <div className="divide-y divide-line/60">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-3.5">
            <div className="skeleton h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-3.5 w-1/3" />
              <div className="skeleton h-2.5 w-1/2" />
            </div>
            <div className="skeleton h-5 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Loading cards">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-line bg-surface p-5">
          <div className="skeleton h-10 w-10 rounded-xl" />
          <div className="skeleton mt-4 h-4 w-2/3" />
          <div className="skeleton mt-2 h-3 w-full" />
          <div className="skeleton mt-1.5 h-3 w-4/5" />
          <div className="mt-4 flex justify-between border-t border-line pt-3">
            <div className="skeleton h-5 w-16 rounded-full" />
            <div className="skeleton h-5 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading page">
      <StatSkeleton />
      <TableSkeleton />
    </div>
  );
}

import clsx from 'clsx';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circle' | 'card' | 'button';
  count?: number;
}

/**
 * Animated loading skeleton for content placeholders.
 * Improves perceived performance during data loading.
 */
export default function Skeleton({ className, variant = 'text', count = 1 }: SkeletonProps) {
  const base = 'animate-pulse bg-gray-200 rounded';

  const variants: Record<string, string> = {
    text: 'h-4 w-full rounded',
    circle: 'h-12 w-12 rounded-full',
    card: 'h-32 w-full rounded-xl',
    button: 'h-10 w-24 rounded-lg',
  };

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={clsx(base, variants[variant], className)}
          role="status"
          aria-label="Loading..."
        />
      ))}
    </>
  );
}

/** Pre-built skeleton for a lesson card */
export function LessonCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 bg-gray-200 rounded-full" />
        <div className="flex-1">
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
      <div className="h-2 bg-gray-200 rounded-full w-full mb-3" />
      <div className="h-3 bg-gray-200 rounded w-2/3" />
    </div>
  );
}

/** Pre-built skeleton for the dashboard stats row */
export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
          <div className="h-8 bg-gray-200 rounded w-3/4" />
        </div>
      ))}
    </div>
  );
}

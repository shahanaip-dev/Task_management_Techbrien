import React from 'react';
import clsx from 'clsx';

// ── Table shell ────────────────────────────────────────────────────────────
export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx('w-full overflow-x-auto rounded-lg border border-[#E8DDD4] bg-white', className)}>
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  );
}

// ── Head ───────────────────────────────────────────────────────────────────
export function Thead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="bg-[#FAF7F2] border-b border-[#E8DDD4]">
      {children}
    </thead>
  );
}

// ── Body ───────────────────────────────────────────────────────────────────
export function Tbody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-[#F0E9E2]">{children}</tbody>;
}

// ── Header cell ───────────────────────────────────────────────────────────
export function Th({
  children,
  className,
  sortable,
  sorted,
  direction,
  onClick,
}: {
  children:    React.ReactNode;
  className?:  string;
  sortable?:   boolean;
  sorted?:     boolean;
  direction?:  'asc' | 'desc';
  onClick?:    () => void;
}) {
  return (
    <th
      onClick={sortable ? onClick : undefined}
      className={clsx(
        'px-4 py-3 text-left text-[10px] font-semibold tracking-widest uppercase text-[#8A8278]',
        'whitespace-nowrap select-none',
        sortable && 'cursor-pointer hover:text-[#1C1A18] transition-colors',
        className
      )}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {sortable && (
          <svg
            className={clsx('w-3 h-3 transition-transform', sorted && direction === 'desc' && 'rotate-180',
              sorted ? 'text-[#7D1F1F]' : 'text-[#C4B8AD]')}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        )}
      </span>
    </th>
  );
}

// ── Row ───────────────────────────────────────────────────────────────────
export function Tr({
  children,
  onClick,
  className,
}: {
  children:   React.ReactNode;
  onClick?:   () => void;
  className?: string;
}) {
  return (
    <tr
      onClick={onClick}
      className={clsx(
        'transition-colors duration-100',
        onClick ? 'cursor-pointer hover:bg-[#FAF7F2]' : 'hover:bg-[#FDFBF8]',
        className
      )}
    >
      {children}
    </tr>
  );
}

// ── Data cell ─────────────────────────────────────────────────────────────
export function Td({
  children,
  className,
}: {
  children:   React.ReactNode;
  className?: string;
}) {
  return (
    <td className={clsx('px-4 py-3 text-[#1C1A18] font-light align-middle', className)}>
      {children}
    </td>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────
export function TableEmpty({ message = 'No records found', action }: { message?: string; action?: React.ReactNode }) {
  return (
    <tr>
      <td colSpan={100} className="px-4 py-16 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 bg-[#F5E6DC] rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-[#7D1F1F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p className="text-sm text-[#8A8278]">{message}</p>
          {action}
        </div>
      </td>
    </tr>
  );
}

// ── Skeleton rows ─────────────────────────────────────────────────────────
export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b border-[#F0E9E2]">
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-4 py-3">
              <div className="h-4 bg-[#F0E9E2] rounded animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

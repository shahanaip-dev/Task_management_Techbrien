import clsx from 'clsx';
import type { TaskStatus } from '@/types';

const STATUS_STYLES: Record<TaskStatus, string> = {
  TODO:        'bg-[#F5F5F0] text-[#6B6860] border border-[#E8DDD4]',
  IN_PROGRESS: 'bg-[#EBF0FF] text-[#3B5BDB] border border-[#3B5BDB]/20',
  DONE:        'bg-[#EBFAF0] text-[#2F9E44] border border-[#2F9E44]/20',
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO:        'To Do',
  IN_PROGRESS: 'In Progress',
  DONE:        'Done',
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span className={clsx(
      'inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium tracking-wide',
      STATUS_STYLES[status]
    )}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export function RoleBadge({ role }: { role: string }) {
  return (
    <span className={clsx(
      'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-widest',
      role === 'ADMIN'
        ? 'bg-[#F5E6DC] text-[#7D1F1F] border border-[#7D1F1F]/20'
        : 'bg-[#EDF2FF] text-[#3B5BDB] border border-[#3B5BDB]/20'
    )}>
      {role}
    </span>
  );
}

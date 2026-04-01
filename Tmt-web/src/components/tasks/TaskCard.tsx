'use client';

import type { Task, TaskStatus } from '@/types';
import { StatusBadge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Input';

interface TaskCardProps {
  task:           Task;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete:       (id: string) => void;
  onEdit:         (task: Task) => void;
}

const STATUS_OPTIONS = [
  { value: 'TODO',        label: 'To Do'       },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'DONE',        label: 'Done'        },
];

export default function TaskCard({ task, onStatusChange, onDelete, onEdit }: TaskCardProps) {
  const dueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;
  const isOverdue = task.dueDate && task.status !== 'DONE' && new Date(task.dueDate) < new Date();

  return (
    <div className="bg-white rounded-lg border border-[#E8DDD4] p-5 hover:shadow-md hover:border-[#C4B8AD] transition-all duration-200 group">
      {/* Title + actions */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-medium text-[#1C1A18] text-sm leading-snug">{task.title}</h4>
        <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200">
          <button
            onClick={() => onEdit(task)}
            className="flex-shrink-0 p-1 text-[#8A8278] hover:text-[#1C1A18] rounded"
            title="Edit task"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232a2.828 2.828 0 014 4L7 21H3v-4L15.232 5.232z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="flex-shrink-0 p-1 text-[#C4B8AD] hover:text-red-500 rounded"
            title="Delete task"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-xs text-[#8A8278] mb-3 line-clamp-2 leading-relaxed">{task.description}</p>
      )}

      {/* Project pill */}
      {task.project && (
        <span className="inline-block text-[11px] bg-[#FAF7F2] text-[#8A8278] border border-[#E8DDD4] rounded px-2 py-0.5 mb-3">
          {task.project.name}
        </span>
      )}

      {/* Status selector */}
      <div className="mb-4">
        <Select
          options={STATUS_OPTIONS}
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
          className="text-xs py-1.5"
        />
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <StatusBadge status={task.status} />
        {dueDate && (
          <span className={`text-[11px] ${isOverdue ? 'text-[#7D1F1F] font-medium' : 'text-[#8A8278]'}`}>
            {isOverdue ? '⚠ ' : ''}Due {dueDate}
          </span>
        )}
      </div>

      {/* Assignee */}
      {task.assignee && (
        <div className="mt-3 pt-3 border-t border-[#F5F0EB] flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[#F5E6DC] flex items-center justify-center text-[#7D1F1F] text-[10px] font-semibold flex-shrink-0">
            {task.assignee.name.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs text-[#8A8278]">{task.assignee.name}</span>
        </div>
      )}
    </div>
  );
}

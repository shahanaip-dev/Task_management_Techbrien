'use client';

import Input, { Select } from '@/components/ui/Input';
import type { Project, User, TaskFilters as Filters } from '@/types';

interface TaskFiltersProps {
  filters:  Filters;
  onChange: (filters: Filters) => void;
  onReset:  () => void;
  projects: Project[];
  users:    User[];
}

const STATUS_OPTIONS = [
  { value: 'TODO',        label: 'To Do'       },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'DONE',        label: 'Done'        },
];

export default function TaskFilters({ filters, onChange, onReset, projects, users }: TaskFiltersProps) {
  const projectOptions = projects.map((p) => ({ value: p.id, label: p.name }));
  const userOptions    = users.map((u)    => ({ value: u.id, label: u.name }));

  const hasActive = !!(filters.projectId || filters.status || filters.dueDate);

  const searchIcon = (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m1.85-5.4a7.25 7.25 0 11-14.5 0 7.25 7.25 0 0114.5 0z" />
    </svg>
  );

  return (
    <div className="bg-white rounded-xl border border-[#E8DDD4] px-5 py-3 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-[#1C1A18] tracking-wide">Filters</span>
        {hasActive && (
          <button
            onClick={onReset}
            className="text-xs text-[#7D1F1F] hover:text-[#5C1616] tracking-wide transition-colors"
          >
            Clear all
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Select
          label="Project"
          options={projectOptions}
          value={filters.projectId ?? ''}
          placeholder="All projects"
          onChange={(e) => onChange({ ...filters, projectId: e.target.value || undefined })}
          leftIcon={searchIcon}
        />
        <Select
          label="Status"
          options={STATUS_OPTIONS}
          value={filters.status ?? ''}
          placeholder="All statuses"
          onChange={(e) => onChange({ ...filters, status: (e.target.value as any) || undefined })}
          leftIcon={searchIcon}
        />
        <Input
          label="Due date"
          type="date"
          value={filters.dueDate ?? ''}
          onChange={(e) => onChange({ ...filters, dueDate: e.target.value || undefined })}
          leftIcon={searchIcon}
        />
      </div>
    </div>
  );
}

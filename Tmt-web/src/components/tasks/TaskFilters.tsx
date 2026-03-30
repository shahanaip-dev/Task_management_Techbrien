'use client';

import { Select } from '@/components/ui/Input';
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
  const hasActive      = !!(filters.projectId || filters.status || filters.assignedTo);

  return (
    <div className="bg-white rounded-lg border border-[#E8DDD4] px-6 py-5">
      <div className="flex items-center justify-between mb-5">
        <span className="text-sm font-medium text-[#1C1A18] tracking-wide">Filters</span>
        {hasActive && (
          <button
            onClick={onReset}
            className="text-xs text-[#7D1F1F] hover:text-[#5C1616] tracking-wide transition-colors"
          >
            Clear all
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Select
          label="Project"
          options={projectOptions}
          value={filters.projectId ?? ''}
          placeholder="All projects"
          onChange={(e) => onChange({ ...filters, projectId: e.target.value || undefined })}
        />
        <Select
          label="Status"
          options={STATUS_OPTIONS}
          value={filters.status ?? ''}
          placeholder="All statuses"
          onChange={(e) => onChange({ ...filters, status: (e.target.value as any) || undefined })}
        />
        <Select
          label="Assignee"
          options={userOptions}
          value={filters.assignedTo ?? ''}
          placeholder="All assignees"
          onChange={(e) => onChange({ ...filters, assignedTo: e.target.value || undefined })}
        />
      </div>
    </div>
  );
}

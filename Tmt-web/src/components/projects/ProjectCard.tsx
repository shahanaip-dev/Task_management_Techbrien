'use client';

import Link from 'next/link';
import type { Project } from '@/types';
import Button from '@/components/ui/Button';

interface ProjectCardProps {
  project:  Project;
  onDelete: (id: string) => void;
  onEdit:   (project: Project) => void;
  isAdmin:  boolean;
}

export default function ProjectCard({ project, onDelete, onEdit, isAdmin }: ProjectCardProps) {
  const taskCount = project._count?.tasks ?? 0;

  return (
    <div className="bg-white rounded-lg border border-[#E8DDD4] p-6 hover:shadow-md hover:border-[#C4B8AD] transition-all duration-200 group">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-serif font-semibold text-[#1C1A18] text-base leading-snug line-clamp-1">
          {project.name}
        </h3>
        {isAdmin && (
          <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200">
            <button
              onClick={() => onEdit(project)}
              className="p-1 text-[#C4B8AD] hover:text-[#7D1F1F] rounded"
              title="Edit project"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(project.id)}
              className="p-1 text-[#C4B8AD] hover:text-red-500 rounded"
              title="Delete project"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <p className="text-sm text-[#8A8278] line-clamp-2 mb-5 min-h-[2.5rem] leading-relaxed font-light">
        {project.description ?? 'No description provided.'}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-[#F5F0EB]">
        <div className="flex items-center gap-1.5 text-xs text-[#8A8278]">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
          </svg>
          <span>{taskCount} task{taskCount !== 1 ? 's' : ''}</span>
        </div>
        <Link href={`/tasks?projectId=${project.id}`}>
          <Button variant="ghost" size="sm" className="text-[#7D1F1F] hover:text-[#5C1616]">
            View Tasks →
          </Button>
        </Link>
      </div>
    </div>
  );
}

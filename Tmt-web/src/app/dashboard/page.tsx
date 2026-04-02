'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import AppLayout from '@/components/layout/AppLayout';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { dashboardApi } from '@/lib/api';
import type { DashboardSummary } from '@/types';
import StatCard from '@/components/dashboard/StatCard';
import TaskOverviewCharts from '@/components/dashboard/TaskOverviewCharts';

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    dashboardApi.summary()
      .then((res) => {
        if (isMounted) setSummary(res.data.data);
      })
      .catch(() => {
        if (isMounted) toast.error('Failed to load dashboard data');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  const statusCounts = summary?.statusCounts ?? { TODO: 0, IN_PROGRESS: 0, DONE: 0 };
  const statusData = [
    { name: 'To Do',       value: statusCounts.TODO },
    { name: 'In Progress', value: statusCounts.IN_PROGRESS },
    { name: 'Done',        value: statusCounts.DONE },
  ];

  const projectTaskCounts = summary?.projectTaskCounts ?? [];
  const totals = summary?.totals;

  if (loading) {
    return (
      <AppLayout>
        <div className="animate-pulse space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-[#F5E6DC] rounded-xl" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-[#F5E6DC] rounded-xl" />
            <div className="h-80 bg-[#F5E6DC] rounded-xl" />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-semibold text-[#4B1414]">Dashboard</h1>
        <p className="text-sm text-[#8A8278] mt-0.5 font-light">
          Welcome back, {user?.name}. Here's what's happening.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label={isAdmin ? 'Total Tasks' : 'My Tasks'}
          value={totals?.tasks ?? 0}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <StatCard
          label={isAdmin ? 'Active Projects' : 'My Projects'}
          value={totals?.projects ?? 0}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          }
        />
        <StatCard
          label="Tasks Done"
          value={totals?.tasksDone ?? 0}
          className="border-green-100"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        {isAdmin ? (
          <StatCard
            label="Team Members"
            value={totals?.teamMembers ?? 0}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
          />
        ) : (
          <StatCard
            label="In Progress"
            value={totals?.tasksInProgress ?? 0}
            className="border-orange-100"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        )}
      </div>

      <TaskOverviewCharts statusData={statusData} projectData={projectTaskCounts} />

      {!isAdmin && (
        <div className="bg-white rounded-xl border border-[#E8DDD4] p-6 shadow-sm">
          <h3 className="font-serif text-lg font-semibold text-[#1C1A18] mb-4">Task Quick View</h3>
          <p className="text-sm text-[#8A8278] mb-4">Go to the Tasks page to manage your assignments in detail.</p>
          <div className="flex gap-3">
            <Link href="/tasks">
              <Button size="sm">Go to Tasks</Button>
            </Link>
            <Link href="/projects">
              <Button variant="secondary" size="sm">View Projects</Button>
            </Link>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
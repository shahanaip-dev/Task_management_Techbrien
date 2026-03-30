'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { RoleBadge } from '@/components/ui/Badge';

const NAV_ITEMS = [
  {
    href:  '/dashboard',
    label: 'Projects',
    icon:  (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M3 7a2 2 0 012-2h4a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7zM13 5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM13 15a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    href:  '/tasks',
    label: 'Tasks',
    icon:  (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
];

const ADMIN_ITEMS = [
  {
    href:  '/users',
    label: 'Team',
    icon:  (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname  = usePathname();
  const { user, logout, isAdmin } = useAuth();

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-[240px] bg-white border-r border-[#E8DDD4] flex flex-col">

      {/* ── Logo ────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-5 h-[60px] border-b border-[#E8DDD4] flex-shrink-0">
        <div className="w-8 h-8 bg-[#7D1F1F] rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-4.5 h-4.5 text-white w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <span className="font-serif font-semibold text-[17px] text-[#1C1A18] tracking-wide">TMT</span>
      </div>

      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">

        <p className="px-3 text-[10px] font-semibold tracking-widest text-[#C4B8AD] uppercase mb-2">
          Workspace
        </p>

        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150
              ${isActive(item.href)
                ? 'bg-[#F5E6DC] text-[#7D1F1F] font-medium'
                : 'text-[#6B6860] hover:bg-[#FAF7F2] hover:text-[#1C1A18]'
              }`}
          >
            <span className={isActive(item.href) ? 'text-[#7D1F1F]' : 'text-[#8A8278]'}>
              {item.icon}
            </span>
            {item.label}
          </Link>
        ))}

        {isAdmin && (
          <>
            <p className="px-3 text-[10px] font-semibold tracking-widest text-[#C4B8AD] uppercase mt-5 mb-2">
              Admin
            </p>
            {ADMIN_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150
                  ${isActive(item.href)
                    ? 'bg-[#F5E6DC] text-[#7D1F1F] font-medium'
                    : 'text-[#6B6860] hover:bg-[#FAF7F2] hover:text-[#1C1A18]'
                  }`}
              >
                <span className={isActive(item.href) ? 'text-[#7D1F1F]' : 'text-[#8A8278]'}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* ── User footer ─────────────────────────────────────── */}
      {user && (
        <div className="border-t border-[#E8DDD4] px-4 py-4 flex-shrink-0">
          <div className="flex items-center gap-3 mb-3">
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-[#F5E6DC] flex items-center justify-center
              text-[#7D1F1F] text-sm font-semibold flex-shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#1C1A18] truncate leading-tight">{user.name}</p>
              <p className="text-xs text-[#8A8278] truncate leading-tight">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <RoleBadge role={user.role} />
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-xs text-[#8A8278] hover:text-[#7D1F1F] transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}

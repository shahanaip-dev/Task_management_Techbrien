'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      className={`text-sm font-normal tracking-wide transition-colors duration-200
        ${pathname.startsWith(href)
          ? 'text-[#1C1A18] border-b border-[#7D1F1F] pb-0.5'
          : 'text-[#8A8278] hover:text-[#1C1A18]'
        }`}
    >
      {label}
    </Link>
  );

  return (
    <header className="bg-white border-b border-[#E8DDD4] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-[64px] flex items-center justify-between">

        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-[#7D1F1F] rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <span className="font-serif font-semibold text-lg text-[#1C1A18] tracking-wide">TMT</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden sm:flex items-center gap-8">
          {navLink('/dashboard', 'Projects')}
          {navLink('/tasks', 'Tasks')}
        </nav>

        {/* User area */}
        {user && (
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end gap-0.5">
              <span className="text-sm font-medium text-[#1C1A18] leading-none">{user.name}</span>
              <span className={`text-[10px] font-semibold tracking-widest px-2 py-0.5 rounded
                ${user.role === 'ADMIN'
                  ? 'bg-[#F5E6DC] text-[#7D1F1F] border border-[#7D1F1F]/20'
                  : 'bg-[#EDF2FF] text-[#3B5BDB] border border-[#3B5BDB]/20'
                }`}>
                {user.role}
              </span>
            </div>
            <button
              onClick={logout}
              className="text-sm text-[#8A8278] hover:text-[#7D1F1F] transition-colors duration-200 tracking-wide"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

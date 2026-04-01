'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#FAF7F2]">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      {/* Main content — offset by sidebar width only on desktop */}
      <div className="flex-1 ml-0 md:ml-[240px] min-h-screen flex flex-col w-full">
        {/* Top bar */}
        <header className="h-[60px] bg-white border-b border-[#E8DDD4] flex items-center px-4 md:px-8 flex-shrink-0 sticky top-0 z-30">
          <div className="md:hidden flex-shrink-0 mr-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-1.5 -ml-1.5 rounded-md text-[#8A8278] hover:text-[#1C1A18] hover:bg-[#F5E6DC] transition-colors"
              aria-label="Open sidebar"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2 text-xs text-[#8A8278] truncate">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="truncate">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 md:px-8 py-6 md:py-8 w-full max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

'use client';

import Sidebar from './Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#FAF7F2]">
      <Sidebar />
      {/* Main content — offset by sidebar width */}
      <div className="flex-1 ml-[240px] min-h-screen flex flex-col">
        {/* Top bar */}
        <header className="h-[60px] bg-white border-b border-[#E8DDD4] flex items-center px-8 flex-shrink-0 sticky top-0 z-40">
          <div className="flex-1" />
          <div className="flex items-center gap-2 text-xs text-[#8A8278]">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-8 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

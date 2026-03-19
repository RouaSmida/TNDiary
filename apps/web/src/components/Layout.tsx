import React from 'react';
import BottomNav from './BottomNav';

interface LayoutProps {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export default function Layout({ title, children, action }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto">
      {/* Top bar */}
      <header className="sticky top-0 bg-white border-b border-gray-200 z-40 flex items-center justify-between px-4 py-3">
        <h1 className="text-lg font-bold text-gray-900">{title}</h1>
        {action && <div>{action}</div>}
      </header>

      {/* Page content */}
      <main className="flex-1 overflow-y-auto pb-20 px-4 pt-4">{children}</main>

      <BottomNav />
    </div>
  );
}

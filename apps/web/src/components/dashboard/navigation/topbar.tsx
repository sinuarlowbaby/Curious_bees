'use client';

import React, { useState } from 'react';
import { SearchCommand } from '@/components/shared/search-command';
import { NotificationDropdown } from '@/components/shared/notification-dropdown';
import { ProfileDropdown } from '@/components/shared/profile-dropdown';
import { Search, Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function Topbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();

  // Generate breadcrumbs from pathname
  const paths = pathname.split('/').filter(Boolean);
  const breadcrumbs = paths.map((path, index) => {
    const isLast = index === paths.length - 1;
    const title = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
    return (
      <React.Fragment key={path}>
        <span className={isLast ? 'text-foreground font-semibold' : 'text-muted-foreground'}>
          {title}
        </span>
        {!isLast && <span className="text-muted-foreground mx-2">/</span>}
      </React.Fragment>
    );
  });

  return (
    <>
      <header className="sticky top-0 z-20 h-16 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 flex items-center justify-between px-4 lg:px-8">
        
        {/* Left Side: Mobile Menu & Breadcrumbs */}
        <div className="flex items-center gap-4">
          <button className="lg:hidden p-2 -ml-2 text-muted-foreground hover:bg-muted rounded-md transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden lg:flex items-center text-sm">
            {breadcrumbs}
          </div>
        </div>

        {/* Right Side: Search, Notifications, Profile */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden sm:flex items-center gap-2 bg-muted/50 hover:bg-muted border border-outline-variant/20 rounded-full px-4 py-1.5 text-sm text-muted-foreground transition-colors w-64 justify-between group"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 group-hover:text-foreground transition-colors" />
              <span>Search...</span>
            </div>
            <span className="text-[10px] font-bold border border-outline-variant/40 rounded px-1.5 py-0.5 bg-surface shadow-sm">
              ⌘K
            </span>
          </button>

          {/* Mobile search icon */}
          <button
            onClick={() => setSearchOpen(true)}
            className="sm:hidden p-2 rounded-full hover:bg-muted text-muted-foreground"
          >
            <Search className="w-5 h-5" />
          </button>

          <div className="h-6 w-px bg-outline-variant/30 mx-1 hidden sm:block" />

          <NotificationDropdown />
          <ProfileDropdown />
        </div>
      </header>

      <SearchCommand isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

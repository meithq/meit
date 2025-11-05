'use client';

import * as React from 'react';
import { useCallback } from 'react';
import { Menu, Bell, User, LogOut } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  title?: string;
  user?: {
    name: string;
    email: string;
    avatar?: string;
    role?: string;
  };
  notifications?: number;
  onMenuClick?: () => void;
  onNotificationClick?: () => void;
  onProfileClick?: () => void;
  onLogout?: () => void;
  actions?: React.ReactNode;
}

const HeaderComponent = React.forwardRef<HTMLElement, HeaderProps>(
  (
    {
      className,
      title,
      user,
      notifications = 0,
      onMenuClick,
      onNotificationClick,
      onProfileClick,
      onLogout,
      actions,
      ...props
    },
    ref
  ) => {
    const [showUserMenu, setShowUserMenu] = React.useState(false);

    // Memoize handlers to prevent unnecessary re-renders
    const handleToggleUserMenu = useCallback(() => {
      setShowUserMenu((prev) => !prev);
    }, []);

    const handleCloseUserMenu = useCallback(() => {
      setShowUserMenu(false);
    }, []);

    const handleProfileClickWithClose = useCallback(() => {
      if (onProfileClick) {
        onProfileClick();
        setShowUserMenu(false);
      }
    }, [onProfileClick]);

    const handleLogoutWithClose = useCallback(() => {
      if (onLogout) {
        onLogout();
        setShowUserMenu(false);
      }
    }, [onLogout]);

    return (
      <header
        ref={ref}
        className={cn(
          'sticky top-0 z-40 flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-4 shadow-sm sm:px-6',
          className
        )}
        {...props}
      >
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          {onMenuClick && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          {/* Title */}
          {title && (
            <h1 className="text-lg font-semibold text-neutral-900 hidden sm:block">
              {title}
            </h1>
          )}
        </div>

        {/* Center Section - Custom Actions */}
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          {onNotificationClick && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onNotificationClick}
              className="relative"
              aria-label={
                notifications > 0
                  ? `${notifications} unread notifications`
                  : 'Notifications'
              }
            >
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-semantic-error text-[10px] font-semibold text-white">
                  {notifications > 9 ? '9+' : notifications}
                </span>
              )}
            </Button>
          )}

          {/* User Menu */}
          {user && (
            <div className="relative">
              <Button
                variant="ghost"
                onClick={handleToggleUserMenu}
                className="flex items-center gap-2 px-2"
                aria-expanded={showUserMenu}
                aria-haspopup="true"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                    <User className="h-4 w-4" />
                  </div>
                )}
                <div className="hidden flex-col items-start sm:flex">
                  <span className="text-sm font-medium text-neutral-900">
                    {user.name}
                  </span>
                  {user.role && (
                    <span className="text-xs text-neutral-600">
                      {user.role}
                    </span>
                  )}
                </div>
              </Button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={handleCloseUserMenu}
                    aria-hidden="true"
                  />

                  {/* Menu */}
                  <div
                    className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border border-neutral-200 bg-white shadow-lg"
                    role="menu"
                  >
                    {/* User Info */}
                    <div className="border-b border-neutral-200 p-4">
                      <p className="font-medium text-neutral-900">
                        {user.name}
                      </p>
                      <p className="text-sm text-neutral-600">{user.email}</p>
                      {user.role && (
                        <Badge variant="outline" size="sm" className="mt-2">
                          {user.role}
                        </Badge>
                      )}
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                      {onProfileClick && (
                        <button
                          onClick={handleProfileClickWithClose}
                          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                          role="menuitem"
                        >
                          <User className="h-4 w-4" />
                          Profile
                        </button>
                      )}
                      {onLogout && (
                        <button
                          onClick={handleLogoutWithClose}
                          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-semantic-error hover:bg-red-50"
                          role="menuitem"
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </header>
    );
  }
);

HeaderComponent.displayName = 'HeaderComponent';

// Memoize the Header component to prevent unnecessary re-renders
const Header = React.memo(HeaderComponent, (prevProps, nextProps) => {
  // Only re-render if these props change
  return (
    prevProps.title === nextProps.title &&
    prevProps.user === nextProps.user &&
    prevProps.notifications === nextProps.notifications &&
    prevProps.onMenuClick === nextProps.onMenuClick &&
    prevProps.onNotificationClick === nextProps.onNotificationClick &&
    prevProps.onProfileClick === nextProps.onProfileClick &&
    prevProps.onLogout === nextProps.onLogout &&
    prevProps.actions === nextProps.actions &&
    prevProps.className === nextProps.className
  );
});

Header.displayName = 'Header';

export { Header };

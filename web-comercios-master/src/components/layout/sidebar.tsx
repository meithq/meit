'use client';

import * as React from 'react';
import { useMemo, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LucideIcon, ChevronLeft } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/auth-store';
import { queryKeys } from '@/lib/react-query';
import { fetchDashboardMetrics } from '@/lib/api/analytics';
import { fetchCustomers } from '@/lib/api/customers';

export interface SidebarItem {
  href: string;
  label: string;
  icon?: LucideIcon;
  badge?: string;
  disabled?: boolean;
}

export interface SidebarSection {
  title?: string;
  items: SidebarItem[];
}

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  sections: SidebarSection[];
  logo?: React.ReactNode;
  footer?: React.ReactNode;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

/**
 * Componente individual de item del sidebar con prefetching real
 */
const SidebarItemComponent = React.memo<{
  item: SidebarItem;
  isActive: boolean;
  collapsed: boolean;
  onPrefetch: (href: string) => void;
}>(({ item, isActive, collapsed, onPrefetch }) => {
  const Icon = item.icon;

  const handleMouseEnter = useCallback(() => {
    onPrefetch(item.href);
  }, [item.href, onPrefetch]);

  return (
    <Link
      href={item.href}
      onMouseEnter={handleMouseEnter}
      prefetch={true}
      className={cn(
        'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
        isActive
          ? 'bg-primary-50 text-primary-700'
          : 'text-neutral-700 hover:bg-neutral-100',
        item.disabled && 'pointer-events-none opacity-50',
        collapsed && 'justify-center'
      )}
      aria-current={isActive ? 'page' : undefined}
      aria-label={collapsed ? item.label : undefined}
      title={collapsed ? item.label : undefined}
    >
      {Icon && (
        <Icon
          className={cn(
            'h-5 w-5 flex-shrink-0 transition-colors',
            isActive ? 'text-primary-700' : 'text-neutral-500'
          )}
          aria-hidden="true"
        />
      )}
      {!collapsed && (
        <>
          <span className="flex-1">{item.label}</span>
          {item.badge && (
            <Badge size="sm" variant="primary">
              {item.badge}
            </Badge>
          )}
        </>
      )}
    </Link>
  );
});

SidebarItemComponent.displayName = 'SidebarItemComponent';

const SidebarComponent = React.forwardRef<HTMLElement, SidebarProps>(
  (
    {
      className,
      sections,
      logo,
      footer,
      collapsed = false,
      onToggleCollapse,
      ...props
    },
    ref
  ) => {
    const pathname = usePathname();
    const queryClient = useQueryClient();
    const merchantId = useAuthStore((state) => state.merchantId);

    // Memoize active state calculation
    const activeStates = useMemo(() => {
      const states = new Map<string, boolean>();
      sections.forEach(section => {
        section.items.forEach(item => {
          states.set(item.href, pathname === item.href);
        });
      });
      return states;
    }, [pathname, sections]);

    // Prefetch data based on route
    const prefetchPageData = useCallback((href: string) => {
      if (!merchantId) return;

      // Prefetch según la página
      if (href === '/dashboard') {
        // Prefetch dashboard metrics
        queryClient.prefetchQuery({
          queryKey: queryKeys.analytics.metrics(merchantId),
          queryFn: () => fetchDashboardMetrics(merchantId),
        });
      } else if (href === '/dashboard/customers') {
        // Prefetch customers list
        queryClient.prefetchQuery({
          queryKey: queryKeys.customers.list(merchantId, undefined),
          queryFn: () => fetchCustomers(merchantId, undefined, undefined, 1, 20),
        });
      } else if (href === '/dashboard/analytics') {
        // Prefetch full analytics (last 30 days)
        const toDate = new Date();
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - 30);

        const fromStr = fromDate.toISOString().split('T')[0];
        const toStr = toDate.toISOString().split('T')[0];

        queryClient.prefetchQuery({
          queryKey: queryKeys.analytics.fullAnalytics(merchantId, fromStr, toStr),
          queryFn: async () => {
            const { fetchFullAnalytics } = await import('@/lib/api/analytics');
            return fetchFullAnalytics(merchantId, fromDate, toDate);
          },
        });
      }
      // NOTE: branches, challenges, gift-cards, pos use legacy useState hooks
      // They need to be migrated to React Query for prefetching support
    }, [merchantId, queryClient]);

    return (
      <aside
        ref={ref}
        className={cn(
          'flex h-screen flex-col border-r border-neutral-200 bg-white transition-all duration-300',
          collapsed ? 'w-16' : 'w-64',
          className
        )}
        aria-label="Sidebar navigation"
        {...props}
      >
        {/* Logo Section */}
        {logo && (
          <div
            className={cn(
              'flex h-16 items-center border-b border-neutral-200 px-4',
              collapsed && 'justify-center px-2'
            )}
          >
            {logo}
          </div>
        )}

        {/* Navigation */}
        <nav
          className="flex-1 space-y-6 overflow-y-auto px-3 py-4"
          role="navigation"
        >
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="space-y-1">
              {/* Section Title */}
              {section.title && !collapsed && (
                <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  {section.title}
                </h3>
              )}

              {/* Section Items */}
              {section.items.map((item) => {
                const isActive = activeStates.get(item.href) || false;

                return (
                  <SidebarItemComponent
                    key={item.href}
                    item={item}
                    isActive={isActive}
                    collapsed={collapsed}
                    onPrefetch={prefetchPageData}
                  />
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        {footer && (
          <div
            className={cn(
              'border-t border-neutral-200 p-4',
              collapsed && 'px-2'
            )}
          >
            {footer}
          </div>
        )}

        {/* Collapse Toggle */}
        {onToggleCollapse && (
          <div className="border-t border-neutral-200 p-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className={cn('w-full', collapsed && 'justify-center px-2')}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <ChevronLeft
                className={cn(
                  'h-4 w-4 transition-transform',
                  collapsed && 'rotate-180'
                )}
              />
              {!collapsed && <span className="ml-2">Collapse</span>}
            </Button>
          </div>
        )}
      </aside>
    );
  }
);

SidebarComponent.displayName = 'SidebarComponent';

// Memoize the Sidebar component to prevent unnecessary re-renders
const Sidebar = React.memo(SidebarComponent, (prevProps, nextProps) => {
  // Only re-render if these props change
  return (
    prevProps.collapsed === nextProps.collapsed &&
    prevProps.sections === nextProps.sections &&
    prevProps.logo === nextProps.logo &&
    prevProps.footer === nextProps.footer &&
    prevProps.onToggleCollapse === nextProps.onToggleCollapse &&
    prevProps.className === nextProps.className
  );
});

Sidebar.displayName = 'Sidebar';

export { Sidebar };

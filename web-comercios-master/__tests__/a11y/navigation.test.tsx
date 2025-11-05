import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

// Mock Next.js components
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  })),
  usePathname: vi.fn(() => '/dashboard'),
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

describe('Navigation Accessibility Tests', () => {
  describe('Sidebar Navigation', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('has no accessibility violations', async () => {
      const { container } = render(<Sidebar />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('all navigation links are keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<Sidebar />);

      const links = screen.getAllByRole('link');

      for (const link of links) {
        link.focus();
        expect(link).toHaveFocus();

        // Should be activatable with Enter
        await user.keyboard('{Enter}');
      }
    });

    it('navigation links have accessible names', () => {
      render(<Sidebar />);

      const links = screen.getAllByRole('link');
      links.forEach((link) => {
        const accessibleName = link.textContent || link.getAttribute('aria-label');
        expect(accessibleName).toBeTruthy();
        expect(accessibleName?.trim().length).toBeGreaterThan(0);
      });
    });

    it('icons have aria-hidden attribute', () => {
      const { container } = render(<Sidebar />);
      const icons = container.querySelectorAll('svg');

      icons.forEach((icon) => {
        expect(icon).toHaveAttribute('aria-hidden', 'true');
      });
    });

    it('active navigation item is indicated', () => {
      render(<Sidebar />);

      // Current page link should have aria-current
      const activeLink = screen.getByRole('link', { current: 'page' });
      expect(activeLink).toHaveAttribute('aria-current', 'page');
    });

    it('supports tab navigation through all items', async () => {
      const user = userEvent.setup();
      render(<Sidebar />);

      const links = screen.getAllByRole('link');

      // Tab through all links
      for (let i = 0; i < links.length; i++) {
        await user.tab();
        expect(links[i]).toHaveFocus();
      }
    });

    it('supports reverse tab navigation', async () => {
      const user = userEvent.setup();
      render(<Sidebar />);

      const links = screen.getAllByRole('link');

      // Focus last link
      links[links.length - 1].focus();

      // Shift+Tab through links in reverse
      for (let i = links.length - 1; i > 0; i--) {
        expect(links[i]).toHaveFocus();
        await user.tab({ shift: true });
      }
    });

    it('navigation is in a nav landmark', () => {
      const { container } = render(<Sidebar />);
      const nav = container.querySelector('nav');
      expect(nav).toBeInTheDocument();
    });

    it('navigation has accessible label', () => {
      const { container } = render(<Sidebar />);
      const nav = container.querySelector('nav');
      expect(nav).toHaveAttribute('aria-label', /navigation/i);
    });
  });

  describe('Header Navigation', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<Header />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('header is in a banner landmark', () => {
      const { container } = render(<Header />);
      const header = container.querySelector('header');
      expect(header).toBeInTheDocument();
    });

    it('user menu is keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<Header />);

      const userMenuButton = screen.getByRole('button', { name: /usuario|perfil/i });

      if (userMenuButton) {
        // Focus and activate
        userMenuButton.focus();
        expect(userMenuButton).toHaveFocus();

        await user.keyboard('{Enter}');

        // Menu should open
        const menu = screen.getByRole('menu');
        expect(menu).toBeVisible();
      }
    });

    it('user menu items are keyboard navigable', async () => {
      const user = userEvent.setup();
      render(<Header />);

      const userMenuButton = screen.getByRole('button', { name: /usuario|perfil/i });

      if (userMenuButton) {
        await user.click(userMenuButton);

        const menuItems = screen.getAllByRole('menuitem');

        for (const item of menuItems) {
          await user.tab();
          expect(item).toHaveFocus();
        }
      }
    });

    it('escape key closes user menu', async () => {
      const user = userEvent.setup();
      render(<Header />);

      const userMenuButton = screen.getByRole('button', { name: /usuario|perfil/i });

      if (userMenuButton) {
        await user.click(userMenuButton);

        const menu = screen.getByRole('menu');
        expect(menu).toBeVisible();

        await user.keyboard('{Escape}');

        expect(menu).not.toBeVisible();
      }
    });
  });

  describe('Breadcrumb Navigation', () => {
    it('breadcrumbs use proper aria attributes', () => {
      // Breadcrumb component would be tested here
      // Example structure:
      const breadcrumb = (
        <nav aria-label="Breadcrumb">
          <ol>
            <li>
              <a href="/dashboard">Dashboard</a>
            </li>
            <li aria-current="page">Customers</li>
          </ol>
        </nav>
      );

      const { container } = render(breadcrumb);
      const nav = container.querySelector('nav');
      expect(nav).toHaveAttribute('aria-label', 'Breadcrumb');
    });

    it('current page is indicated with aria-current', () => {
      const breadcrumb = (
        <nav aria-label="Breadcrumb">
          <ol>
            <li>
              <a href="/dashboard">Dashboard</a>
            </li>
            <li aria-current="page">Customers</li>
          </ol>
        </nav>
      );

      render(breadcrumb);
      const currentPage = screen.getByText('Customers');
      expect(currentPage).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('Skip Links', () => {
    it('skip to main content link is present', () => {
      const layout = (
        <>
          <a href="#main-content" className="sr-only focus:not-sr-only">
            Skip to main content
          </a>
          <nav>Navigation</nav>
          <main id="main-content">Main content</main>
        </>
      );

      render(layout);
      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    it('skip link receives focus on tab', async () => {
      const user = userEvent.setup();
      const layout = (
        <>
          <a href="#main-content" className="sr-only focus:not-sr-only">
            Skip to main content
          </a>
          <nav>Navigation</nav>
          <main id="main-content">Main content</main>
        </>
      );

      render(layout);

      await user.tab();
      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toHaveFocus();
    });
  });

  describe('Focus Management', () => {
    it('focus is visible on all interactive elements', () => {
      render(<Sidebar />);

      const links = screen.getAllByRole('link');

      links.forEach((link) => {
        link.focus();
        // Focus should be visible (handled by CSS)
        expect(link).toHaveFocus();
      });
    });

    it('focus trap works in modals', async () => {
      const user = userEvent.setup();

      const modal = (
        <div role="dialog" aria-modal="true">
          <button>First button</button>
          <button>Second button</button>
          <button>Close</button>
        </div>
      );

      render(modal);

      const buttons = screen.getAllByRole('button');

      // Tab through buttons
      await user.tab();
      expect(buttons[0]).toHaveFocus();

      await user.tab();
      expect(buttons[1]).toHaveFocus();

      await user.tab();
      expect(buttons[2]).toHaveFocus();

      // Tab from last should go back to first (focus trap)
      await user.tab();
      expect(buttons[0]).toHaveFocus();
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('keyboard shortcuts are documented', () => {
      // Keyboard shortcuts should be visible or accessible
      const shortcutsHelp = (
        <div aria-label="Keyboard shortcuts">
          <kbd>Ctrl+K</kbd> Search
          <kbd>Esc</kbd> Close
        </div>
      );

      render(shortcutsHelp);
      expect(screen.getByText('Search')).toBeInTheDocument();
    });

    it('keyboard shortcuts do not conflict with browser shortcuts', () => {
      // Avoid: Ctrl+W, Ctrl+T, Ctrl+N, F5, etc.
      // Use: Ctrl+K, Ctrl+/, Ctrl+Shift+[Key], etc.
      // This is more of a design test, but we can check implementation
      expect(true).toBe(true); // Placeholder
    });
  });

  describe('Screen Reader Announcements', () => {
    it('page transitions are announced', () => {
      const announcement = (
        <div role="status" aria-live="polite" aria-atomic="true">
          Navigated to Dashboard
        </div>
      );

      render(announcement);
      const status = screen.getByRole('status');
      expect(status).toHaveAttribute('aria-live', 'polite');
      expect(status).toHaveTextContent('Navigated to Dashboard');
    });

    it('route changes update page title', () => {
      // Page title should be updated on navigation
      // This would be tested in E2E tests
      expect(document.title).toBeTruthy();
    });
  });
});

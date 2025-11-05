import { redirect } from 'next/navigation';

/**
 * Settings Root Page
 *
 * Redirects to /dashboard/settings/business by default
 */
export default function SettingsPage() {
  redirect('/dashboard/settings/business');
}

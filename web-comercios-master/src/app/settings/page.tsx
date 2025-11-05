import { redirect } from 'next/navigation';

/**
 * Settings Root Page
 *
 * Redirects to /settings/business by default
 */
export default function SettingsPage() {
  redirect('/settings/business');
}

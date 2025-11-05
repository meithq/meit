import { redirect } from 'next/navigation';

export default function Home() {
  // Middleware handles auth checks and redirects
  // This page just redirects to login by default
  // Authenticated users will be redirected to /dashboard by middleware
  redirect('/login');
}

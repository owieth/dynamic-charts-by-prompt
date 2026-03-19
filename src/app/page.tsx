import { DEFAULT_DASHBOARD_ID } from '@/lib/default-dashboard';
import { redirect } from 'next/navigation';

export default function Home() {
  redirect(`/dashboard/${DEFAULT_DASHBOARD_ID}`);
}

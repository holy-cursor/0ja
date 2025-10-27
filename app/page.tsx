import { redirect } from 'next/navigation';

export default async function Home() {
  // Redirect to landing page
  redirect('/landing');
}
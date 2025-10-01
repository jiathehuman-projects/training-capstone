import DefaultLayout from '@/layouts/default';
import { title } from '@/components/primitives';
import { Link } from '@heroui/link';

export default function NoRoutePage() {
  return (
    <DefaultLayout>
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className={title({ size: 'lg', class: 'text-white mb-4' })}>Route Not Available</h1>
        <p className="text-gray-300 max-w-xl mb-6">The page you attempted to access is not available for your role or does not exist. If you believe this is an error, contact a manager.</p>
        <div className="flex gap-4">
          <Link href="/" className="text-blue-400 hover:text-blue-300">Home</Link>
          <Link href="/dashboard" className="text-blue-400 hover:text-blue-300">Customer Dashboard</Link>
        </div>
      </div>
    </DefaultLayout>
  );
}

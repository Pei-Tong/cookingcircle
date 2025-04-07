import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Cooking Circle',
  description: 'Manage recipes, users, and site content',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold">CookingCircle Admin</h1>
            <nav>
              <a href="/" className="text-blue-600 hover:text-blue-800">
                Back to Site
              </a>
            </nav>
          </div>
        </div>
      </header>
      <main className="py-6">
        {children}
      </main>
    </div>
  );
} 
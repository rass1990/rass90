import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import Header from '../components/Header'; // Assuming we want to keep the main header, or maybe a dedicated admin header?
// For now, reusing Header as it handles auth state well.
// We might want to pass a 'variant' to Header if we want it to look different, but for now standard is fine.

export function AdminLayout() {
    return (
        <div className="min-h-screen bg-gray-100">
            <Header />
            <div className="flex max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <AdminSidebar />
                <main className="flex-1 ml-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

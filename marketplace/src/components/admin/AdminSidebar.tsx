import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Briefcase, Settings, LogOut } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';

export function AdminSidebar() {
    const location = useLocation();
    const { t } = useLanguage();
    const { signOut } = useAuth(); // Assuming useAuth exposes signOut

    const navigation = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Users', href: '/admin/users', icon: Users },
        { name: 'Services', href: '/admin/services', icon: Briefcase },
        // { name: 'Settings', href: '/admin/settings', icon: Settings },
    ];

    const handleSignOut = async () => {
        await signOut();
        // Redirect handled by AuthProvider or manual redirect if needed
        window.location.href = '/';
    };

    return (
        <div className="flex flex-col w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)]">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                <nav className="mt-5 flex-1 px-2 space-y-1">
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={cn(
                                    isActive
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors'
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500',
                                        'mr-3 flex-shrink-0 h-6 w-6'
                                    )}
                                    aria-hidden="true"
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                <button
                    onClick={handleSignOut}
                    className="flex-shrink-0 w-full group block"
                >
                    <div className="flex items-center">
                        <LogOut className="inline-block h-5 w-5 text-gray-500 group-hover:text-gray-700" />
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                                Sign Out
                            </p>
                        </div>
                    </div>
                </button>
            </div>
        </div>
    );
}

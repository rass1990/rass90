import { Users, Briefcase, DollarSign, Activity, TrendingUp } from 'lucide-react';
import { StatCard } from '../../components/admin/StatCard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Mon', revenue: 4000, users: 24 },
    { name: 'Tue', revenue: 3000, users: 18 },
    { name: 'Wed', revenue: 2000, users: 35 },
    { name: 'Thu', revenue: 2780, users: 42 },
    { name: 'Fri', revenue: 1890, users: 28 },
    { name: 'Sat', revenue: 2390, users: 55 },
    { name: 'Sun', revenue: 3490, users: 60 },
];

export default function AdminDashboardPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-3 py-1 rounded-md shadow-sm border border-gray-200">
                    <Activity className="w-4 h-4" />
                    Last updated: Just now
                </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Users"
                    value="12,345"
                    icon={Users}
                    trend={{ value: 12, label: 'vs last month' }}
                />
                <StatCard
                    title="Active Services"
                    value="1,432"
                    icon={Briefcase}
                    trend={{ value: 5.4, label: 'vs last month' }}
                />
                <StatCard
                    title="Total Revenue"
                    value="$84,232"
                    icon={DollarSign}
                    trend={{ value: 18.2, label: 'vs last month' }}
                />
                <StatCard
                    title="Platform Growth"
                    value="24.5%"
                    icon={TrendingUp}
                    trend={{ value: 2.1, label: 'vs last month' }}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h2>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} tickFormatter={(value) => `$${value}`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
                    <div className="flow-root">
                        <ul role="list" className="-mb-8">
                            {[1, 2, 3, 4, 5].map((item, itemIdx) => (
                                <li key={item}>
                                    <div className="relative pb-8">
                                        {itemIdx !== 4 ? (
                                            <span
                                                className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                                                aria-hidden="true"
                                            />
                                        ) : null}
                                        <div className="relative flex space-x-3">
                                            <div>
                                                <span className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center ring-8 ring-white">
                                                    <Users className="h-4 w-4 text-blue-600" aria-hidden="true" />
                                                </span>
                                            </div>
                                            <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                                <div>
                                                    <p className="text-sm text-gray-500">
                                                        New user <span className="font-medium text-gray-900">John Doe</span> registered
                                                    </p>
                                                </div>
                                                <div className="whitespace-nowrap text-right text-sm text-gray-500">
                                                    {item}h ago
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

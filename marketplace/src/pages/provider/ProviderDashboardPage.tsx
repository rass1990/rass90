import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  DollarSign, 
  Users, 
  Calendar, 
  Star, 
  TrendingUp,
  Clock
} from 'lucide-react';

interface DashboardStats {
  totalEarnings: number;
  totalBookings: number;
  activeServices: number;
  averageRating: number;
  pendingBookings: number;
  completedBookings: number;
}

interface RecentBooking {
  id: string;
  customer_name: string;
  service_name: string;
  scheduled_date: string;
  status: string;
  total_amount: number;
}

export default function ProviderDashboardPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalEarnings: 0,
    totalBookings: 0,
    activeServices: 0,
    averageRating: 0,
    pendingBookings: 0,
    completedBookings: 0,
  });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    if (!user || user.user_type !== 'provider') {
      navigate('/');
      return;
    }
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load provider profile for rating
      const { data: providerProfile } = await supabase
        .from('provider_profiles')
        .select('rating, total_reviews')
        .eq('user_id', user?.id)
        .maybeSingle();

      // Load bookings
      const { data: bookings } = await supabase
        .from('bookings')
        .select('*')
        .eq('provider_id', user?.id);

      // Load active services
      const { data: services } = await supabase
        .from('services')
        .select('*')
        .eq('provider_id', user?.id)
        .eq('is_active', true);

      if (bookings) {
        const totalEarnings = bookings
          .filter(b => b.payment_status === 'paid')
          .reduce((sum, b) => sum + (b.total_price || 0), 0);

        const pendingCount = bookings.filter(b => b.status === 'pending').length;
        const completedCount = bookings.filter(b => b.status === 'completed').length;

        setStats({
          totalEarnings,
          totalBookings: bookings.length,
          activeServices: services?.length || 0,
          averageRating: providerProfile?.rating || 0,
          pendingBookings: pendingCount,
          completedBookings: completedCount,
        });

        // Load recent bookings with customer and service names
        const recentBookingsData = await Promise.all(
          bookings
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5)
            .map(async (booking) => {
              const { data: customer } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', booking.customer_id)
                .maybeSingle();

              const { data: service } = await supabase
                .from('services')
                .select('name_en, name_ar')
                .eq('id', booking.service_id)
                .maybeSingle();

              return {
                id: booking.id,
                customer_name: customer?.full_name || 'Unknown',
                service_name: i18n.language === 'ar' ? service?.name_ar : service?.name_en || 'Service',
                scheduled_date: booking.scheduled_date,
                status: booking.status,
                total_amount: booking.total_price || 0,
              };
            })
        );

        setRecentBookings(recentBookingsData);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: t('provider.totalEarnings'),
      value: `$${stats.totalEarnings.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: t('provider.totalBookings'),
      value: stats.totalBookings.toString(),
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: t('provider.activeServices'),
      value: stats.activeServices.toString(),
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: t('provider.averageRating'),
      value: stats.averageRating.toFixed(1),
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('provider.dashboard')}</h1>
          <p className="text-gray-600 mt-2">{t('provider.welcomeMessage')}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-sm text-gray-600">{stat.title}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Bookings */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">{t('provider.recentBookings')}</h2>
                <button
                  onClick={() => navigate('/provider/bookings')}
                  className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
                >
                  {t('common.viewAll')}
                </button>
              </div>

              {recentBookings.length === 0 ? (
                <p className="text-gray-500 text-center py-8">{t('provider.noBookings')}</p>
              ) : (
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{booking.service_name}</h3>
                        <p className="text-sm text-gray-600">{booking.customer_name}</p>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(booking.scheduled_date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">${booking.total_amount}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {t(`booking.${booking.status}`)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{t('provider.quickActions')}</h2>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/provider/services')}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  {t('provider.manageServices')}
                </button>
                <button
                  onClick={() => navigate('/provider/bookings')}
                  className="w-full px-4 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold"
                >
                  {t('provider.viewBookings')}
                </button>
                <button
                  onClick={() => navigate('/profile')}
                  className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
                >
                  {t('provider.editProfile')}
                </button>
              </div>
            </div>

            {/* Pending Bookings Alert */}
            {stats.pendingBookings > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Users className="w-5 h-5 text-yellow-600 mr-2" />
                  <h3 className="font-semibold text-yellow-900">{t('provider.pendingRequests')}</h3>
                </div>
                <p className="text-sm text-yellow-800 mb-3">
                  {t('provider.pendingMessage', { count: stats.pendingBookings })}
                </p>
                <button
                  onClick={() => navigate('/provider/bookings?status=pending')}
                  className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition font-semibold text-sm"
                >
                  {t('provider.reviewRequests')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, Booking } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { BookingCard } from '../components/BookingCard';
import { Calendar } from 'lucide-react';

export function BookingsPage() {
  const { user } = useAuth();
  const { t, getLocalizedText } = useLanguage();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<(Booking & { service_name?: string; provider_name?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    if (user) {
      loadBookings();
    }
  }, [user, filter]);

  const loadBookings = async () => {
    if (!user) return;
    setLoading(true);

    try {
      let query = supabase
        .from('bookings')
        .select('*')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data: bookingsData } = await query;

      if (bookingsData && bookingsData.length > 0) {
        const serviceIds = [...new Set(bookingsData.map(b => b.service_id))];
        const providerIds = [...new Set(bookingsData.map(b => b.provider_id))];

        const [servicesResult, providersResult] = await Promise.all([
          supabase.from('services').select('id, name_en, name_ar').in('id', serviceIds),
          supabase.from('profiles').select('id, full_name').in('id', providerIds)
        ]);

        const enrichedBookings = bookingsData.map(booking => ({
          ...booking,
          service_name: getLocalizedText(
            servicesResult.data?.find(s => s.id === booking.service_id)?.name_en || '',
            servicesResult.data?.find(s => s.id === booking.service_id)?.name_ar || ''
          ),
          provider_name: providersResult.data?.find(p => p.id === booking.provider_id)?.full_name || 'Provider'
        }));

        setBookings(enrichedBookings);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Please log in</h2>
          <p className="text-gray-500 mb-4">You need to be logged in to view your bookings</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
          >
            {t('login')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{t('my_bookings')}</h1>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {t(status)}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl h-48 animate-pulse" />
            ))}
          </div>
        ) : bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onClick={() => navigate(`/bookings/${booking.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('no_bookings')}</h3>
            <p className="text-gray-500 mb-4">Start by browsing our services</p>
            <button
              onClick={() => navigate('/services')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
            >
              {t('browse_services')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookingsPage;

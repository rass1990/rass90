import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Filter } from 'lucide-react';

interface Booking {
  id: string;
  customer_id: string;
  service_id: string;
  scheduled_date: string;
  status: string;
  total_price: number;
  notes: string;
  customer_name?: string;
  service_name?: string;
}

export default function ProviderBookingsPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(searchParams.get('status') || 'all');
  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    if (!user || user.user_type !== 'provider') {
      navigate('/');
      return;
    }
    loadBookings();
  }, [user, filter]);

  const loadBookings = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('bookings')
        .select('*')
        .eq('provider_id', user?.id)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data: bookingsData, error } = await query;

      if (error) throw error;

      if (bookingsData) {
        // Load customer and service names
        const bookingsWithDetails = await Promise.all(
          bookingsData.map(async (booking) => {
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
              ...booking,
              customer_name: customer?.full_name || 'Unknown',
              service_name: i18n.language === 'ar' ? service?.name_ar : service?.name_en || 'Service',
            };
          })
        );

        setBookings(bookingsWithDetails);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: 'confirmed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId);

      if (error) throw error;

      loadBookings();
      alert(t('provider.bookingAccepted'));
    } catch (error) {
      console.error('Error accepting booking:', error);
      alert(t('provider.bookingError'));
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    if (!confirm(t('provider.confirmReject'))) return;

    try {
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId);

      if (error) throw error;

      loadBookings();
      alert(t('provider.bookingRejected'));
    } catch (error) {
      console.error('Error rejecting booking:', error);
      alert(t('provider.bookingError'));
    }
  };

  const handleCompleteBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId);

      if (error) throw error;

      loadBookings();
      alert(t('provider.bookingCompleted'));
    } catch (error) {
      console.error('Error completing booking:', error);
      alert(t('provider.bookingError'));
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

  const statusFilters = [
    { value: 'all', label: t('common.all') },
    { value: 'pending', label: t('booking.pending') },
    { value: 'confirmed', label: t('booking.confirmed') },
    { value: 'completed', label: t('booking.completed') },
    { value: 'cancelled', label: t('booking.cancelled') },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('provider.bookingsManagement')}</h1>
            <p className="text-gray-600 mt-2">{t('provider.manageYourBookings')}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">{t('common.filter')}:</span>
            <div className="flex flex-wrap gap-2">
              {statusFilters.map((statusFilter) => (
                <button
                  key={statusFilter.value}
                  onClick={() => setFilter(statusFilter.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    filter === statusFilter.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {statusFilter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">{t('provider.noBookingsFound')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {booking.service_name}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">{t('booking.customer')}:</span>{' '}
                        {booking.customer_name}
                      </p>
                      <p>
                        <span className="font-medium">{t('booking.date')}:</span>{' '}
                        {new Date(booking.scheduled_date).toLocaleString()}
                      </p>
                      <p>
                        <span className="font-medium">{t('booking.amount')}:</span>{' '}
                        ${booking.total_price}
                      </p>
                      {booking.notes && (
                        <p>
                          <span className="font-medium">{t('booking.notes')}:</span>{' '}
                          {booking.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : booking.status === 'confirmed'
                          ? 'bg-blue-100 text-blue-800'
                          : booking.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {t(`booking.${booking.status}`)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  {booking.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleAcceptBooking(booking.id)}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                      >
                        {t('provider.accept')}
                      </button>
                      <button
                        onClick={() => handleRejectBooking(booking.id)}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
                      >
                        {t('provider.reject')}
                      </button>
                    </>
                  )}

                  {booking.status === 'confirmed' && (
                    <button
                      onClick={() => handleCompleteBooking(booking.id)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                    >
                      {t('provider.markComplete')}
                    </button>
                  )}

                  {booking.status === 'completed' && (
                    <div className="flex-1 text-center text-green-600 font-semibold py-2">
                      {t('provider.completed')}
                    </div>
                  )}

                  {booking.status === 'cancelled' && (
                    <div className="flex-1 text-center text-red-600 font-semibold py-2">
                      {t('provider.cancelled')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

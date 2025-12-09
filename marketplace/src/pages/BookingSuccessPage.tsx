import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { CheckCircle, Calendar, MapPin, User } from 'lucide-react';

interface Booking {
  id: string;
  scheduled_date: string;
  total_price: number;
  service_id: string;
}

interface Service {
  name_en: string;
  name_ar: string;
}

export default function BookingSuccessPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    loadBookingDetails();
  }, [bookingId]);

  const loadBookingDetails = async () => {
    try {
      setLoading(true);

      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .maybeSingle();

      if (bookingError) throw bookingError;
      if (!bookingData) {
        navigate('/bookings');
        return;
      }

      setBooking(bookingData);

      // Load service details
      const { data: serviceData } = await supabase
        .from('services')
        .select('name_en, name_ar')
        .eq('id', bookingData.service_id)
        .maybeSingle();

      setService(serviceData);
    } catch (error) {
      console.error('Error loading booking details:', error);
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

  if (!booking || !service) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {t('booking.successTitle')}
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            {t('booking.successMessage')}
          </p>

          {/* Booking Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('booking.details')}
            </h2>

            <div className="space-y-3">
              <div className="flex items-start">
                <User className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">{t('booking.service')}</p>
                  <p className="font-semibold text-gray-900">
                    {isRTL ? service.name_ar : service.name_en}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">{t('booking.scheduledDate')}</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(booking.scheduled_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">{t('booking.totalPaid')}</p>
                  <p className="font-semibold text-gray-900">${booking.total_price}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Reference */}
          <div className="mb-8">
            <p className="text-sm text-gray-500 mb-1">{t('booking.referenceNumber')}</p>
            <p className="text-lg font-mono font-semibold text-gray-900">
              {booking.id.substring(0, 8).toUpperCase()}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={() => navigate('/bookings')}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 font-semibold"
            >
              {t('booking.viewBookings')}
            </button>

            <button
              onClick={() => navigate('/')}
              className="w-full px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200 font-semibold"
            >
              {t('booking.backToHome')}
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              {t('booking.confirmationEmail')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

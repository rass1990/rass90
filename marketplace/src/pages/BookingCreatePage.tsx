import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Service {
  id: string;
  name_en: string;
  name_ar: string;
  price: number;
  provider_id: string;
}

interface Address {
  id: string;
  street_address: string;
  city: string;
  state: string;
  country: string;
}

export default function BookingCreatePage() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const isRTL = i18n.language === 'ar';

  const [formData, setFormData] = useState({
    address_id: '',
    scheduled_date: '',
    scheduled_time: '',
    notes: '',
    payment_method: 'paypal', // Default to PayPal
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadData();
  }, [serviceId, user]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load service
      const { data: serviceData, error: serviceError } = await supabase
        .from('services')
        .select('id, name_en, name_ar, price, provider_id')
        .eq('id', serviceId)
        .maybeSingle();

      if (serviceError) throw serviceError;
      setService(serviceData);

      // Load user addresses
      const { data: addressesData } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true);

      setAddresses(addressesData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!service || !user) return;

    try {
      setSubmitting(true);

      // Calculate commission
      const commissionAmount = service.price * 0.15; // 15% commission
      const totalAmount = service.price;

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          customer_id: user.id,
          provider_id: service.provider_id,
          service_id: service.id,
          address: 'Address from form', // Will be updated when address system is fully implemented
          scheduled_date: formData.scheduled_date,
          scheduled_time: formData.scheduled_time,
          total_amount: totalAmount,
          commission_amount: commissionAmount,
          payment_method: formData.payment_method,
          payment_status: formData.payment_method === 'cash_on_delivery' ? 'cod_pending' : 'pending',
          status: 'pending',
          notes: formData.notes || null,
        })
        .select()
        .single();

      if (error) throw error;

      // For COD, confirm booking directly; for PayPal, go to payment page
      if (formData.payment_method === 'cash_on_delivery') {
        navigate(`/booking/success/${data.id}`);
      } else {
        navigate(`/booking/payment/${data.id}`);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert(t('bookings.createError'));
    } finally {
      setSubmitting(false);
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

  if (!service) {
    return null;
  }

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {t('bookings.createBooking')}
          </h1>

          {/* Service Info */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {isRTL ? service.name_ar : service.name_en}
            </h2>
            <p className="text-2xl font-bold text-blue-600">${service.price}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Address Selection */}
            <div>
              <label htmlFor="address_id" className="block text-sm font-medium text-gray-700 mb-2">
                {t('bookings.serviceAddress')} *
              </label>

              {addresses.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 mb-3">{t('bookings.noAddresses')}</p>
                  <button
                    type="button"
                    onClick={() => navigate('/profile/addresses')}
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    {t('bookings.addAddress')}
                  </button>
                </div>
              ) : (
                <select
                  id="address_id"
                  name="address_id"
                  value={formData.address_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">{t('bookings.selectAddress')}</option>
                  {addresses.map((address) => (
                    <option key={address.id} value={address.id}>
                      {address.street_address}, {address.city}, {address.state}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Date Selection */}
            <div>
              <label htmlFor="scheduled_date" className="block text-sm font-medium text-gray-700 mb-2">
                {t('bookings.date')} *
              </label>
              <input
                type="date"
                id="scheduled_date"
                name="scheduled_date"
                value={formData.scheduled_date}
                onChange={handleInputChange}
                min={minDate}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Time Selection */}
            <div>
              <label htmlFor="scheduled_time" className="block text-sm font-medium text-gray-700 mb-2">
                {t('bookings.time')} *
              </label>
              <input
                type="time"
                id="scheduled_time"
                name="scheduled_time"
                value={formData.scheduled_time}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                {t('bookings.notes')}
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={4}
                placeholder={t('bookings.notesPlaceholder')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Payment Method Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {t('payment_method')} *
              </label>
              <div className="space-y-3">
                {/* PayPal Option */}
                <div
                  onClick={() => setFormData({ ...formData, payment_method: 'paypal' })}
                  className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                    formData.payment_method === 'paypal'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value="paypal"
                    checked={formData.payment_method === 'paypal'}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center">
                      <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="#003087">
                        <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 2.394A.77.77 0 0 1 5.7 1.77h6.327c2.775 0 4.7.58 5.736 1.728.978 1.09 1.388 2.677 1.219 4.717-.19 2.286-.89 3.9-2.078 4.797-1.17.884-2.956 1.328-5.31 1.328H9.58a.77.77 0 0 0-.758.624l-1.746 7.173z"/>
                      </svg>
                      <span className="font-semibold text-gray-900">{t('paypal')}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{t('secure_payment')}</p>
                  </div>
                  {formData.payment_method === 'paypal' && (
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>

                {/* Cash on Delivery Option */}
                <div
                  onClick={() => setFormData({ ...formData, payment_method: 'cash_on_delivery' })}
                  className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                    formData.payment_method === 'cash_on_delivery'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value="cash_on_delivery"
                    checked={formData.payment_method === 'cash_on_delivery'}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-green-600"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center">
                      <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="font-semibold text-gray-900">{t('cash_on_delivery')}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{t('cod_instructions')}</p>
                  </div>
                  {formData.payment_method === 'cash_on_delivery' && (
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('bookings.summary')}
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('bookings.servicePrice')}</span>
                  <span className="font-semibold">${service.price}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between">
                  <span className="text-lg font-bold text-gray-900">{t('bookings.total')}</span>
                  <span className="text-lg font-bold text-blue-600">${service.price}</span>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200 font-semibold"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={submitting || addresses.length === 0}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 font-semibold"
              >
                {submitting ? t('common.processing') : t('bookings.proceedToPayment')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

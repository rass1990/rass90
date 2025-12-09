import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { CreditCard, Lock, CheckCircle, AlertCircle } from 'lucide-react';

interface Booking {
  id: string;
  service_id: string;
  provider_id: string;
  total_price: number;
  payment_method: string;
  payment_status: string;
  scheduled_date: string;
  status: string;
}

interface Service {
  name_en: string;
  name_ar: string;
}

// PayPal SDK types
declare global {
  interface Window {
    paypal?: any;
  }
}

const COMMISSION_RATE = 0.15; // 15% marketplace commission

export default function PaymentPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const paypalRef = useRef<HTMLDivElement>(null);
  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadBooking();
  }, [bookingId, user]);

  useEffect(() => {
    // Load PayPal SDK
    if (booking && booking.payment_method === 'paypal' && !window.paypal) {
      const script = document.createElement('script');
      // Using sandbox client ID for development - should be replaced with real credentials
      script.src = `https://www.paypal.com/sdk/js?client-id=test&currency=USD`;
      script.addEventListener('load', () => {
        setPaypalLoaded(true);
      });
      document.body.appendChild(script);
    } else if (window.paypal) {
      setPaypalLoaded(true);
    }
  }, [booking]);

  useEffect(() => {
    // Render PayPal buttons when SDK is loaded
    if (paypalLoaded && booking && paypalRef.current && window.paypal) {
      renderPayPalButtons();
    }
  }, [paypalLoaded, booking]);

  const loadBooking = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .eq('customer_id', user?.id)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        navigate('/bookings');
        return;
      }

      // Check if payment method is PayPal
      if (data.payment_method !== 'paypal') {
        // Redirect COD bookings
        navigate(`/booking/success/${bookingId}`);
        return;
      }

      setBooking(data);

      // Load service details
      const { data: serviceData } = await supabase
        .from('services')
        .select('name_en, name_ar')
        .eq('id', data.service_id)
        .maybeSingle();

      setService(serviceData);
    } catch (error) {
      console.error('Error loading booking:', error);
      setError(t('payment_failed'));
    } finally {
      setLoading(false);
    }
  };

  const renderPayPalButtons = () => {
    if (!paypalRef.current || !booking || !window.paypal) return;

    // Clear existing buttons
    paypalRef.current.innerHTML = '';

    const commissionAmount = booking.total_price * COMMISSION_RATE;
    const providerAmount = booking.total_price - commissionAmount;

    window.paypal.Buttons({
      style: {
        layout: 'vertical',
        color: 'blue',
        shape: 'rect',
        label: 'paypal'
      },
      createOrder: async (data: any, actions: any) => {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: booking.total_price.toFixed(2),
              currency_code: 'USD',
              breakdown: {
                item_total: {
                  value: booking.total_price.toFixed(2),
                  currency_code: 'USD'
                }
              }
            },
            description: `Booking: ${service ? (isRTL ? service.name_ar : service.name_en) : 'Service'}`,
            items: [{
              name: service ? (isRTL ? service.name_ar : service.name_en) : 'Service',
              unit_amount: {
                value: booking.total_price.toFixed(2),
                currency_code: 'USD'
              },
              quantity: '1'
            }]
          }],
          application_context: {
            shipping_preference: 'NO_SHIPPING'
          }
        });
      },
      onApprove: async (data: any, actions: any) => {
        setProcessing(true);
        try {
          const order = await actions.order.capture();
          
          // Save payment transaction
          const { error: transactionError } = await supabase
            .from('payment_transactions')
            .insert({
              booking_id: booking.id,
              payment_method: 'paypal',
              transaction_id: order.id,
              payer_id: order.payer.payer_id,
              payer_email: order.payer.email_address,
              amount: booking.total_price,
              commission_amount: commissionAmount,
              provider_amount: providerAmount,
              currency: 'USD',
              status: 'completed',
              payment_data: order
            });

          if (transactionError) throw transactionError;

          // Update booking
          const { error: bookingError } = await supabase
            .from('bookings')
            .update({
              payment_status: 'paid',
              paypal_order_id: order.id,
              payment_completed_at: new Date().toISOString(),
              status: 'confirmed',
              updated_at: new Date().toISOString()
            })
            .eq('id', booking.id);

          if (bookingError) throw bookingError;

          // Navigate to success page
          navigate(`/booking/success/${booking.id}`);
        } catch (error) {
          console.error('Payment processing error:', error);
          setError(t('payment_failed'));
          setProcessing(false);
        }
      },
      onError: (err: any) => {
        console.error('PayPal error:', err);
        setError(t('payment_failed'));
      },
      onCancel: () => {
        setError('Payment cancelled. Please try again.');
      }
    }).render(paypalRef.current);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!booking || !service) {
    return null;
  }

  const commissionAmount = booking.total_price * COMMISSION_RATE;
  const providerAmount = booking.total_price - commissionAmount;

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex items-center mb-6">
                <CreditCard className="w-6 h-6 text-blue-600 mr-2" />
                <h1 className="text-2xl font-bold text-gray-900">
                  {t('payment')}
                </h1>
              </div>

              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              {/* PayPal Payment */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">{t('pay_with_paypal')}</h2>
                  <svg className="w-24 h-8" viewBox="0 0 101 32" fill="none">
                    <path d="M12.237 4.447c.798-5.01-4.737-4.447-9.476-4.447H.007L0 .253C5.748.507 10.23 2.387 12.237 4.447z" fill="#139AD6"/>
                    <path d="M42.337 5.447c-.798 5.01 4.737 4.447 9.476 4.447h2.754l.007-.253c-5.748-.254-10.23-2.134-12.237-4.194z" fill="#263B80"/>
                  </svg>
                </div>

                {processing ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-blue-900 font-semibold">{t('payment_processing')}</p>
                  </div>
                ) : (
                  <>
                    {/* PayPal Buttons Container */}
                    <div ref={paypalRef} className="min-h-[200px]"></div>
                    
                    {!paypalLoaded && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-3"></div>
                        <p className="text-gray-600">Loading PayPal...</p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Security Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start mt-6">
                <Lock className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-900 font-semibold mb-1">{t('secure_payment')}</p>
                  <p className="text-sm text-blue-800">
                    Your payment information is encrypted and secure.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={processing}
                className="w-full mt-6 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition duration-200 font-semibold"
              >
                {t('back')}
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {t('booking_details')}
              </h2>

              <div className="space-y-3 mb-6">
                <div>
                  <p className="text-sm text-gray-500">{t('services')}</p>
                  <p className="font-semibold text-gray-900">
                    {isRTL ? service.name_ar : service.name_en}
                  </p>
                </div>

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">{t('subtotal')}</span>
                    <span className="font-semibold">${booking.total_price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">{t('service_fee')}</span>
                    <span className="font-semibold">${commissionAmount.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex justify-between">
                    <span className="font-bold text-gray-900">{t('total_amount')}</span>
                    <span className="font-bold text-blue-600 text-lg">${booking.total_price.toFixed(2)}</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-3">
                  <p className="text-xs text-gray-500">
                    {t('provider_earnings')}: ${providerAmount.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {t('marketplace_commission')}: ${commissionAmount.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-green-800">
                  Booking will be confirmed after successful payment
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

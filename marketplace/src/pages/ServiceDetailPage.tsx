import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Service {
  id: string;
  provider_id: string;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  price: number;
  category_id: string;
  image_url: string;
  is_active: boolean;
}

interface Provider {
  id: string;
  bio_en: string;
  bio_ar: string;
  rating: number;
  total_reviews: number;
  profile?: {
    full_name: string;
    avatar_url: string;
  };
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  customer?: {
    full_name: string;
    avatar_url: string;
  };
}

export default function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    loadServiceDetails();
  }, [id]);

  const loadServiceDetails = async () => {
    try {
      setLoading(true);

      // Load service
      const { data: serviceData, error: serviceError } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (serviceError) throw serviceError;
      if (!serviceData) {
        navigate('/services');
        return;
      }

      setService(serviceData);

      // Load provider profile
      const { data: providerData } = await supabase
        .from('provider_profiles')
        .select('id, bio_en, bio_ar, rating, total_reviews')
        .eq('user_id', serviceData.provider_id)
        .maybeSingle();

      if (providerData) {
        // Load provider user profile
        const { data: userData } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', serviceData.provider_id)
          .maybeSingle();

        setProvider({
          ...providerData,
          profile: userData || undefined,
        });
      }

      // Load reviews
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('id, rating, comment, created_at, customer_id')
        .eq('service_id', id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (reviewsData) {
        // Load customer profiles for reviews
        const reviewsWithCustomers = await Promise.all(
          reviewsData.map(async (review) => {
            const { data: customerData } = await supabase
              .from('profiles')
              .select('full_name, avatar_url')
              .eq('id', review.customer_id)
              .maybeSingle();

            return {
              ...review,
              customer: customerData || undefined,
            };
          })
        );

        setReviews(reviewsWithCustomers);
      }
    } catch (error) {
      console.error('Error loading service details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/booking/create/${id}`);
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

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Image */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src={service.image_url || '/placeholder-service.jpg'}
                alt={isRTL ? service.name_ar : service.name_en}
                className="w-full h-96 object-cover"
              />
            </div>

            {/* Service Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {isRTL ? service.name_ar : service.name_en}
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed">
                {isRTL ? service.description_ar : service.description_en}
              </p>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {t('reviews.title')}
              </h2>

              {reviews.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  {t('reviews.noReviews')}
                </p>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
                      <div className="flex items-start space-x-4">
                        <img
                          src={review.customer?.avatar_url || '/default-avatar.png'}
                          alt={review.customer?.full_name || 'User'}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-900">
                              {review.customer?.full_name || 'Anonymous'}
                            </h3>
                            <span className="text-sm text-gray-500">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center mb-2">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-5 h-5 ${
                                  i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <p className="text-gray-600">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <div className="mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  ${service.price}
                </div>
                <p className="text-gray-600">{t('services.perService')}</p>
              </div>

              <button
                onClick={handleBookNow}
                disabled={!service.is_active}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 font-semibold"
              >
                {service.is_active ? t('bookings.bookNow') : t('services.unavailable')}
              </button>
            </div>

            {/* Provider Card */}
            {provider && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {t('providers.aboutProvider')}
                </h3>

                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src={provider.profile?.avatar_url || '/default-avatar.png'}
                    alt={provider.profile?.full_name || 'Provider'}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {provider.profile?.full_name}
                    </h4>
                    <div className="flex items-center mt-1">
                      <svg className="w-5 h-5 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-gray-600">
                        {provider.rating.toFixed(1)} ({provider.total_reviews} {t('reviews.reviews')})
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4">
                  {isRTL ? provider.bio_ar : provider.bio_en}
                </p>

                <button
                  onClick={() => navigate(`/providers/${service.provider_id}`)}
                  className="w-full border border-blue-600 text-blue-600 py-2 px-4 rounded-lg hover:bg-blue-50 transition duration-200 font-semibold"
                >
                  {t('providers.viewProfile')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

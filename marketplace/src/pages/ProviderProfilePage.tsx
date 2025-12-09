import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase, Service } from '../lib/supabase';
import ServiceCard from '../components/ServiceCard';

interface Provider {
  id: string;
  bio_en: string;
  bio_ar: string;
  rating: number;
  total_reviews: number;
  years_experience: number;
  profile?: {
    full_name: string;
    avatar_url: string;
    phone: string;
    email: string;
  };
}

interface GalleryImage {
  id: string;
  image_url: string;
  description: string;
}

export default function ProviderProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    loadProviderData();
  }, [id]);

  const loadProviderData = async () => {
    try {
      setLoading(true);

      // Load provider profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, phone, email')
        .eq('id', id)
        .maybeSingle();

      const { data: providerData } = await supabase
        .from('provider_profiles')
        .select('*')
        .eq('user_id', id)
        .maybeSingle();

      if (providerData) {
        setProvider({
          ...providerData,
          profile: profileData || undefined,
        });
      }

      // Load services
      const { data: servicesData } = await supabase
        .from('services')
        .select('*')
        .eq('provider_id', id)
        .eq('is_active', true);

      setServices(servicesData || []);

      // Load gallery
      const { data: galleryData } = await supabase
        .from('provider_gallery')
        .select('*')
        .eq('provider_id', providerData?.id)
        .order('created_at', { ascending: false });

      setGallery(galleryData || []);
    } catch (error) {
      console.error('Error loading provider data:', error);
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

  if (!provider) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">{t('providers.notFound')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Provider Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            <img
              src={provider.profile?.avatar_url || '/default-avatar.png'}
              alt={provider.profile?.full_name || 'Provider'}
              className="w-32 h-32 rounded-full object-cover border-4 border-blue-100"
            />

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {provider.profile?.full_name}
              </h1>

              <div className="flex items-center justify-center md:justify-start space-x-4 mb-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-gray-700 font-semibold">
                    {provider.rating.toFixed(1)}
                  </span>
                  <span className="text-gray-500 ml-1">
                    ({provider.total_reviews} {t('reviews.reviews')})
                  </span>
                </div>

                <div className="text-gray-600">
                  {provider.years_experience} {t('providers.yearsExperience')}
                </div>
              </div>

              <p className="text-gray-600 mb-4 max-w-2xl">
                {isRTL ? provider.bio_ar : provider.bio_en}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {provider.profile?.phone}
                </div>

                <div className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {provider.profile?.email}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('providers.services')}
          </h2>

          {services.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-500">{t('services.noServices')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={{
                    ...service,
                    provider_name: provider.profile?.full_name || '',
                  }}
                  onClick={() => navigate(`/services/${service.id}`)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Gallery */}
        {gallery.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t('providers.gallery')}
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {gallery.map((image) => (
                <div
                  key={image.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden aspect-square"
                >
                  <img
                    src={image.image_url}
                    alt={image.description}
                    className="w-full h-full object-cover hover:scale-105 transition duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

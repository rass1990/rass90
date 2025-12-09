import { useLanguage } from '../contexts/LanguageContext';
import { Service } from '../lib/supabase';
import { Clock, Star } from 'lucide-react';

type Props = {
  service: Service & { 
    provider_name?: string;
    provider_rating?: number;
    category_name?: string;
  };
  onClick: () => void;
};

export function ServiceCard({ service, onClick }: Props) {
  const { getLocalizedText, t } = useLanguage();

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300 cursor-pointer"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-900 text-lg">
          {getLocalizedText(service.name_en, service.name_ar)}
        </h3>
        {service.provider_rating && (
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-medium">{service.provider_rating.toFixed(1)}</span>
          </div>
        )}
      </div>
      
      <p className="text-gray-500 text-sm mb-4 line-clamp-2">
        {getLocalizedText(service.description_en, service.description_ar)}
      </p>

      {service.provider_name && (
        <p className="text-sm text-gray-600 mb-3">
          {service.provider_name}
        </p>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          {service.duration_minutes && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{service.duration_minutes} min</span>
            </div>
          )}
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-blue-600">
            ${service.base_price}
          </span>
          <span className="text-sm text-gray-500 ml-1">
            {service.price_type === 'hourly' ? t('per_hour') : t('fixed')}
          </span>
        </div>
      </div>
    </div>
  );
}

export default ServiceCard;

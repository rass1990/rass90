import { useLanguage } from '../contexts/LanguageContext';
import { ServiceCategory } from '../lib/supabase';
import { Wrench, Zap, Sparkles, Hammer, Car, Thermometer, Truck } from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  wrench: Wrench,
  zap: Zap,
  sparkles: Sparkles,
  hammer: Hammer,
  car: Car,
  thermometer: Thermometer,
  truck: Truck,
};

type Props = {
  category: ServiceCategory;
  onClick: () => void;
};

export function CategoryCard({ category, onClick }: Props) {
  const { getLocalizedText } = useLanguage();
  const Icon = iconMap[category.icon] || Wrench;

  return (
    <button
      onClick={onClick}
      className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300 text-left w-full"
    >
      <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
        <Icon className="w-7 h-7 text-blue-600" />
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">
        {getLocalizedText(category.name_en, category.name_ar)}
      </h3>
      <p className="text-sm text-gray-500 line-clamp-2">
        {getLocalizedText(category.description_en, category.description_ar)}
      </p>
    </button>
  );
}

export default CategoryCard;

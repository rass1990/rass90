import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase, ServiceCategory, Service } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { Header } from '../components/Header';
import { ServiceCard } from '../components/ServiceCard';
import { Search, Filter, X } from 'lucide-react';

export function ServicesPage() {
  const { t, getLocalizedText } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<(Service & { provider_name?: string; category_name?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadServices();
  }, [selectedCategory, searchQuery]);

  const loadCategories = async () => {
    const { data } = await supabase
      .from('service_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
    if (data) setCategories(data);
  };

  const loadServices = async () => {
    setLoading(true);
    try {
      let query = supabase.from('services').select('*').eq('is_active', true);

      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory);
      }

      const { data: servicesData } = await query;

      if (servicesData && servicesData.length > 0) {
        const providerIds = [...new Set(servicesData.map(s => s.provider_id))];
        const categoryIds = [...new Set(servicesData.map(s => s.category_id))];

        const [profilesResult, categoriesResult] = await Promise.all([
          supabase.from('profiles').select('id, full_name').in('id', providerIds),
          supabase.from('service_categories').select('id, name_en, name_ar').in('id', categoryIds)
        ]);

        let filteredServices = servicesData.map(service => ({
          ...service,
          provider_name: profilesResult.data?.find(p => p.id === service.provider_id)?.full_name || 'Provider',
          category_name: getLocalizedText(
            categoriesResult.data?.find(c => c.id === service.category_id)?.name_en || '',
            categoriesResult.data?.find(c => c.id === service.category_id)?.name_ar || ''
          )
        }));

        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filteredServices = filteredServices.filter(s =>
            s.name_en.toLowerCase().includes(query) ||
            s.name_ar.toLowerCase().includes(query) ||
            s.description_en?.toLowerCase().includes(query) ||
            s.description_ar?.toLowerCase().includes(query)
          );
        }

        setServices(filteredServices);
      } else {
        setServices([]);
      }
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (categoryId) {
      setSearchParams({ category: categoryId });
    } else {
      setSearchParams({});
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadServices();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">{t('browse_services')}</h1>

          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search services..."
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </form>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t('all')} {t('categories')}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {getLocalizedText(cat.name_en, cat.name_ar)}
                  </option>
                ))}
              </select>
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Active Filters */}
          {(selectedCategory || searchQuery) && (
            <div className="flex gap-2 mt-4">
              {selectedCategory && (
                <button
                  onClick={() => handleCategoryChange('')}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                >
                  {getLocalizedText(
                    categories.find(c => c.id === selectedCategory)?.name_en || '',
                    categories.find(c => c.id === selectedCategory)?.name_ar || ''
                  )}
                  <X className="w-4 h-4" />
                </button>
              )}
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                >
                  "{searchQuery}"
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl h-64 animate-pulse" />
            ))}
          </div>
        ) : services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onClick={() => navigate(`/services/${service.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('no_services')}</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ServicesPage;

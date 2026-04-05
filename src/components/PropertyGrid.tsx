import { useEffect, useState } from 'react';
import { PropertyCard } from './PropertyCard';
import { ChevronLeft, ChevronRight, Loader2, SearchX } from 'lucide-react';
import { propertyApi } from '../api/propertyApi';
import { useSearch } from '../context/SearchContext';
import { useTranslation } from 'react-i18next';

const PROPERTIES_PER_PAGE = 8;

export function PropertyGrid() {
  const [currentPage, setCurrentPage] = useState(1);
  const [properties, setProperties] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

  const { t } = useTranslation();
  const { filters, searchVersion } = useSearch();

  // Reset to page 1 when a new search is triggered
  useEffect(() => {
    setCurrentPage(1);
  }, [searchVersion]);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);

        const params: any = {
          page: currentPage - 1,
          size: PROPERTIES_PER_PAGE,
        };

        // Only add non-undefined filter values
        if (filters.areaId) params.areaId = filters.areaId;
        if (filters.roomTypeId) params.roomTypeId = filters.roomTypeId;
        if (filters.minPrice) params.minPrice = filters.minPrice;
        if (filters.maxPrice) params.maxPrice = filters.maxPrice;
        if (filters.bedrooms) params.bedrooms = filters.bedrooms;
        if (filters.allowPets) params.allowPets = filters.allowPets;

        const hasFilters = filters.areaId || filters.roomTypeId ||
                          filters.minPrice || filters.maxPrice ||
                          filters.bedrooms || filters.allowPets;

        let res;
        if (hasFilters || searchVersion > 0) {
          // Use search endpoint when filters exist or user explicitly searched
          res = await propertyApi.searchProperties(params);
        } else {
          // Default: use approved endpoint for initial page load
          res = await propertyApi.getApprovedProperties(currentPage - 1, PROPERTIES_PER_PAGE);
        }

        const pageData = res.data || res;

        // Backend Page object uses 'content', but custom SearchResponse uses 'properties'
        const rawProperties = pageData.properties || pageData.content || [];

        // Map backend PropertyResponse to frontend Property type
        const mappedProperties = rawProperties.map((p: any) => ({
          id: p.id,
          image: p.images?.find((img: any) => img.isThumbnail)?.imageUrl || p.images?.[0]?.imageUrl || '/placeholder-property.jpg',
          title: p.title,
          translations: p.translations || [],
          priceValue: p.monthlyPrice,
          location: p.areaName ? `${p.addressLine}, ${p.areaName}` : p.addressLine,
          beds: p.bedrooms || 0,
          baths: 1, // Defaulting to 1 as not in DTO yet
          area: p.areaM2 || 0,
          rating: 4.8,
          reviewCount: Math.floor(Math.random() * 50) + 10,
          propertyType: (p.roomTypeName?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '') === 'chungcu' ? 'chungcu' : 
                         p.roomTypeName?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '') === 'canho' ? 'canho' : 'nha'),
        }));

        setProperties(mappedProperties);
        setTotalPages(pageData.totalPages || 0);
        setTotalElements(pageData.totalElements || 0);
      } catch (error) {
        console.error("Failed to fetch properties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [currentPage, searchVersion, filters]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {searchVersion > 0 ? t('grid.searchResults', 'Kết quả tìm kiếm') : t('grid.featured', 'Bất động sản nổi bật')}
          </h2>
          <p className="text-gray-500">
            {searchVersion > 0
              ? `${t('grid.found', 'Tìm thấy')} ${totalElements} ${t('grid.matchingProperties', 'bất động sản phù hợp')}`
              : t('grid.discover', 'Khám phá các không gian sống tuyệt vời dành cho bạn')}
          </p>
        </div>
      </div>

      {/* Property Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {properties.length > 0 ? (
          properties.map((property) => (
            <PropertyCard key={property.id} {...property} />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
            <SearchX size={48} className="mb-4" />
            <p className="text-lg font-medium text-gray-500">{t('grid.noResults', 'Không tìm thấy bất động sản nào')}</p>
            <p className="text-sm mt-1">{t('grid.tryDifferent', 'Thử thay đổi bộ lọc tìm kiếm')}</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-8">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label={t('grid.prevPage', 'Trang trước')}
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>

          <div className="flex space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-teal-600 text-white'
                    : 'hover:bg-gray-50 text-gray-700 border border-transparent'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label={t('grid.nextPage', 'Trang tiếp theo')}
          >
            <ChevronRight size={20} className="text-gray-600" />
          </button>
        </div>
      )}
    </div>
  );
}

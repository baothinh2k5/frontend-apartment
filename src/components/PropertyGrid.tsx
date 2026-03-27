import { useEffect, useState } from 'react';
import { PropertyCard } from './PropertyCard';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { propertyApi } from '../api/propertyApi';

const PROPERTIES_PER_PAGE = 8;

export function PropertyGrid() {
  const [currentPage, setCurrentPage] = useState(1);
  const [properties, setProperties] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const res = await propertyApi.getApprovedProperties(currentPage - 1, PROPERTIES_PER_PAGE);
        const pageData = res.data || res;
        
        // Map backend PropertyResponse to frontend Property type
        const mappedProperties = (pageData.content || []).map((p: any) => ({
          id: p.id,
          image: p.images?.find((img: any) => img.isThumbnail)?.imageUrl || p.images?.[0]?.imageUrl || '/placeholder-property.jpg',
          title: p.title,
          price: new Intl.NumberFormat('vi-VN', { 
            style: 'currency', 
            currency: 'VND' 
          }).format(p.monthlyPrice) + ' / tháng',
          priceValue: p.monthlyPrice,
          location: `${p.addressLine}, ${p.areaName}`,
          beds: p.bedrooms || 0,
          baths: 1, // Defaulting as backend doesn't have baths yet
          area: p.areaM2 || 0,
          rating: 4.8, // Mocked
          reviewCount: Math.floor(Math.random() * 50) + 10, // Mocked
          propertyType: 'canho', // Defaulting as mapping is complex
        }));

        setProperties(mappedProperties);
        setTotalPages(pageData.totalPages || 0);
      } catch (error) {
        console.error("Failed to fetch properties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [currentPage]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  const currentProperties = properties;

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Bất động sản nổi bật</h2>
          <p className="text-gray-500">Khám phá các không gian sống tuyệt vời dành cho bạn</p>
        </div>
      </div>

      {/* Property Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {currentProperties.length > 0 ? (
          currentProperties.map((property) => (
            <PropertyCard key={property.id} {...property} />
          ))
        ) : (
          <div className="col-span-full text-center py-20 text-gray-500">
            Không có bất động sản nào được tìm thấy.
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
            aria-label="Trang trước"
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
            aria-label="Trang tiếp theo"
          >
            <ChevronRight size={20} className="text-gray-600" />
          </button>
        </div>
      )}
    </div>
  );
}

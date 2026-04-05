import { useState } from 'react';
import { Heart } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Property } from '../types/property';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getLocalizedText } from '../utils/langUtils';

export function PropertyCard(property: Property) {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const [isFavorite, setIsFavorite] = useState(false);
  const { id, image, title, priceValue, location, beds, baths, area, badge, translations } = property;
  
  const localizedTitle = getLocalizedText(translations, 'title', i18n.language) || title;
  
  const formattedPrice = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(priceValue || 0) + (i18n.language?.startsWith('en') ? ' / month' : ' / tháng');

  return (
    <div 
      onClick={() => navigate(`/property/${id}`)}
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100 group cursor-pointer flex flex-col h-full"
    >
      <div className="relative overflow-hidden aspect-[4/3]">
        <ImageWithFallback
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {badge && (
          <div className="absolute top-3 left-3 bg-teal-600 text-white px-3 py-1 rounded text-sm font-medium z-10 shadow-sm">
            {badge}
          </div>
        )}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white backdrop-blur-sm transition-colors z-10 shadow-sm"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart 
            size={18} 
            className={`transition-colors ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-gray-600'}`} 
          />
        </button>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 pr-2">{localizedTitle}</h3>
        </div>
        <p className="text-gray-500 text-sm mb-3 flex-grow">{location}</p>
        
        <div className="flex items-center justify-between py-3 border-y border-gray-100 my-2">
          <div className="flex items-center space-x-3 text-sm text-gray-700">
            <span className="flex items-center"><span className="font-semibold mr-1">{beds}</span> {i18n.language?.startsWith('en') ? 'BD' : 'PN'}</span>
            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
            <span className="flex items-center"><span className="font-semibold mr-1">{baths}</span> {i18n.language?.startsWith('en') ? 'BA' : 'PT'}</span>
            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
            <span className="flex items-center"><span className="font-semibold mr-1">{area}</span> m²</span>
          </div>
        </div>

        <div className="mt-auto pt-2">
          <p className="text-teal-600 text-xl font-bold">{formattedPrice}</p>
        </div>
      </div>
    </div>
  );
}

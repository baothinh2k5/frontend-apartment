import { Search, MapPin, Building2, BedDouble, DollarSign, PawPrint, X, Check, Filter, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSearch } from '../context/SearchContext';
import { amenityApi, Amenity } from '../api/amenityApi';
import { useTranslation } from 'react-i18next';
import { removeDiacritics } from '../utils/langUtils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';

export function MapSection() {
  // Local filter state
  const [keyword, setKeyword] = useState<string>('');
  const [areaId, setAreaId] = useState<string>('');
  const [roomTypeId, setRoomTypeId] = useState<string>('');
  const [bedrooms, setBedrooms] = useState<string>('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000000]);
  const [allowPets, setAllowPets] = useState<string>('any');

  const { t, i18n } = useTranslation();

  const { 
    setFilters, 
    triggerSearch, 
    resetSearch,
    areas, 
    roomTypes
  } = useSearch();

  // Price display helper
  const formatPrice = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}tr`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return value.toString();
  };

  // Commit filters to context and trigger search
  const handleSearch = () => {
    setFilters({
      keyword: keyword.trim() || undefined,
      areaId: areaId && areaId !== 'all' ? Number(areaId) : undefined,
      roomTypeId: roomTypeId && roomTypeId !== 'all' ? Number(roomTypeId) : undefined,
      bedrooms: bedrooms && bedrooms !== 'all' ? Number(bedrooms) : undefined,
      minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
      maxPrice: priceRange[1] < 100000000 ? priceRange[1] : undefined,
      allowPets: allowPets !== 'any' ? allowPets : undefined,
    });
    triggerSearch();
  };

  // Reset all filters
  const handleReset = () => {
    setKeyword('');
    setAreaId('');
    setRoomTypeId('');
    setBedrooms('');
    setPriceRange([0, 100000000]);
    setAllowPets('any');
    resetSearch();
  };

  const hasActiveFilters = 
    keyword || areaId || roomTypeId || bedrooms || 
    priceRange[0] > 0 || priceRange[1] < 100000000 || 
    allowPets !== 'any';

  return (
    <div className="relative">
      {/* Google Map Background */}
      <div className="h-[650px] w-full relative group">
        <iframe
          src="https://maps.google.com/maps?q=Hải%20Châu,%20Đà%20Nẵng&t=&z=13&ie=UTF8&iwloc=&output=embed"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          className="grayscale-[0.2] brightness-[0.95]"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent pointer-events-none" />
      </div>

      {/* Modern Floating Search Bar at Bottom */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl z-20">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-white/40 p-3 transition-all duration-500 hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)]">
          
          {/* Single Row Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-2">
            
            <div className="flex items-center gap-3 flex-grow">
              {/* Location Select */}
              <div className="flex-1 min-w-[120px]">
                <Popover>
                  <PopoverTrigger asChild>
                    <button className={`w-full flex items-center gap-2 h-12 px-4 rounded-xl border transition-all text-sm font-medium ${areaId ? 'bg-teal-50 border-teal-200 text-teal-700' : 'bg-white/60 border-gray-100 text-gray-600 hover:bg-white'}`}>
                      <MapPin size={18} className="text-gray-400" />
                      <div className="flex flex-col items-start text-left overflow-hidden">
                        <span className="text-[10px] text-gray-400 uppercase font-bold leading-tight">{t('search.location', 'Vị trí')}</span>
                        <span className="truncate w-full leading-tight">
                          {areaId && areaId !== 'all' ? areas.find(a => String(a.id) === areaId)?.name : t('search.allAreas', 'Tất cả khu vực')}
                        </span>
                      </div>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-0" align="start">
                    <div className="p-2 max-h-60 overflow-y-auto">
                      <button 
                        onClick={() => setAreaId('all')}
                        className="flex w-full items-center justify-between px-3 py-2 text-sm rounded-lg hover:bg-gray-100"
                      >
                        {t('search.allAreas', 'Tất cả khu vực')}
                        {areaId === 'all' && <Check size={14} className="text-teal-600" />}
                      </button>
                      {areas.map((area) => (
                        <button
                          key={area.id}
                          onClick={() => setAreaId(String(area.id))}
                          className="flex w-full items-center justify-between px-3 py-2 text-sm rounded-lg hover:bg-gray-100"
                        >
                          {i18n.language?.startsWith('en') ? removeDiacritics(area.name) : area.name}
                          {areaId === String(area.id) && <Check size={14} className="text-teal-600" />}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Room Type Select */}
              <div className="flex-1 min-w-[120px]">
                <Popover>
                  <PopoverTrigger asChild>
                    <button className={`w-full flex items-center gap-2 h-12 px-4 rounded-xl border transition-all text-sm font-medium ${roomTypeId ? 'bg-teal-50 border-teal-200 text-teal-700' : 'bg-white/60 border-gray-100 text-gray-600 hover:bg-white'}`}>
                      <Building2 size={18} className="text-gray-400" />
                      <div className="flex flex-col items-start text-left overflow-hidden">
                        <span className="text-[10px] text-gray-400 uppercase font-bold leading-tight">{t('search.roomType', 'Loại BĐS')}</span>
                        <span className="truncate w-full leading-tight">
                          {roomTypeId && roomTypeId !== 'all' ? t(`roomType.${roomTypes.find(rt => String(rt.id) === roomTypeId)?.name}`, roomTypes.find(rt => String(rt.id) === roomTypeId)?.name || '') : t('search.allTypes', 'Tất cả loại')}
                        </span>
                      </div>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-0" align="start">
                    <div className="p-2">
                      <button 
                        onClick={() => setRoomTypeId('all')}
                        className="flex w-full items-center justify-between px-3 py-2 text-sm rounded-lg hover:bg-gray-100"
                      >
                        {t('search.allTypes', 'Tất cả loại')}
                        {roomTypeId === 'all' && <Check size={14} className="text-teal-600" />}
                      </button>
                      {roomTypes.map((rt) => (
                        <button
                          key={rt.id}
                          onClick={() => setRoomTypeId(String(rt.id))}
                          className="flex w-full items-center justify-between px-3 py-2 text-sm rounded-lg hover:bg-gray-100"
                        >
                          {t(`roomType.${rt.name}`, rt.name)}
                          {roomTypeId === String(rt.id) && <Check size={14} className="text-teal-600" />}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Bedrooms Select */}
              <div className="flex-1 min-w-[100px]">
                <Popover>
                  <PopoverTrigger asChild>
                    <button className={`w-full flex items-center gap-2 h-12 px-4 rounded-xl border transition-all text-sm font-medium ${bedrooms ? 'bg-teal-50 border-teal-200 text-teal-700' : 'bg-white/60 border-gray-100 text-gray-600 hover:bg-white'}`}>
                      <BedDouble size={18} className="text-gray-400" />
                      <div className="flex flex-col items-start text-left overflow-hidden">
                        <span className="text-[10px] text-gray-400 uppercase font-bold leading-tight">{t('search.bedrooms', 'Phòng ngủ')}</span>
                        <span className="truncate w-full leading-tight">
                          {bedrooms && bedrooms !== 'all' ? `${bedrooms} ${t('search.rooms', 'phòng')}` : t('search.all', 'Tất cả')}
                        </span>
                      </div>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-40 p-0" align="start">
                    <div className="p-2">
                      {['all', '1', '2', '3', '4', '5'].map((b) => (
                        <button
                          key={b}
                          onClick={() => setBedrooms(b)}
                          className="flex w-full items-center justify-between px-3 py-2 text-sm rounded-lg hover:bg-gray-100"
                        >
                          {b === 'all' ? t('search.all', 'Tất cả') : `${b} ${t('search.rooms', 'phòng')}`}
                          {bedrooms === b && <Check size={14} className="text-teal-600" />}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Price Range Popover */}
              <div className="flex-1 min-w-[150px]">
                <Popover>
                  <PopoverTrigger asChild>
                    <button className={`w-full flex items-center gap-2 h-12 px-4 rounded-xl border transition-all text-sm font-medium ${(priceRange[0] > 0 || priceRange[1] < 50000000) ? 'bg-teal-50 border-teal-200 text-teal-700' : 'bg-white/60 border-gray-100 text-gray-600 hover:bg-white'}`}>
                      <DollarSign size={18} className="text-gray-400" />
                      <div className="flex flex-col items-start text-left overflow-hidden">
                        <span className="text-[10px] text-gray-400 uppercase font-bold leading-tight">{t('search.priceRange', 'Khoảng giá')}</span>
                        <span className="truncate w-full leading-tight font-semibold">
                          {priceRange[0] > 0 || priceRange[1] < 50000000
                            ? `${formatPrice(priceRange[0])} - ${formatPrice(priceRange[1])}`
                            : t('search.allPrices', 'Tất cả giá')}
                        </span>
                      </div>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-5" align="start">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-semibold text-gray-700">{t('search.monthlyPrice', 'Mức giá')}</p>
                          <Badge variant="secondary" className="bg-teal-50 text-teal-700 border-teal-100">
                            {formatPrice(priceRange[0])} — {formatPrice(priceRange[1])}
                          </Badge>
                        </div>
                        <Slider
                          value={priceRange}
                          onValueChange={(v) => setPriceRange(v as [number, number])}
                          min={0}
                          max={100000000}
                          step={500000}
                          className="w-full py-4"
                        />
                        <div className="flex justify-between text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                          <span>0đ</span>
                          <span>100.000.000đ</span>
                        </div>
                      </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Pets Selection */}
              <div className="flex-1 min-w-[100px]">
                <Popover>
                  <PopoverTrigger asChild>
                    <button className={`w-full flex items-center gap-2 h-12 px-4 rounded-xl border transition-all text-sm font-medium ${allowPets !== 'any' ? 'bg-teal-50 border-teal-200 text-teal-700' : 'bg-white/60 border-gray-100 text-gray-600 hover:bg-white'}`}>
                      <PawPrint size={18} className="text-gray-400" />
                      <div className="flex flex-col items-start text-left overflow-hidden">
                        <span className="text-[10px] text-gray-400 uppercase font-bold leading-tight">{t('search.pets', 'Thú cưng')}</span>
                        <span className="truncate w-full leading-tight">{allowPets === 'any' ? t('search.any', 'Tất cả') : t(`search.${allowPets.toLowerCase()}`, allowPets)}</span>
                      </div>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-0" align="start">
                    <div className="p-2">
                      {[
                        { id: 'any', label: t('search.any', 'Tất cả') },
                        { id: 'YES', label: t('search.allowed', 'Cho phép') },
                        { id: 'NO', label: t('search.notAllowed', 'Không cho phép') },
                        { id: 'FLEXIBLE', label: t('search.flexible', 'Thỏa thuận') }
                      ].map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setAllowPets(p.id)}
                          className="flex w-full items-center justify-between px-3 py-2 text-sm rounded-lg hover:bg-gray-100"
                        >
                          {p.label}
                          {allowPets === p.id && <Check size={14} className="text-teal-600" />}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>


            {/* Actions: Reset & Search */}
            <div className="flex items-center gap-2">
              <div className={`transition-all duration-500 overflow-hidden ${hasActiveFilters ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>
                <button
                  onClick={handleReset}
                  className="h-12 w-12 bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 rounded-xl flex items-center justify-center transition-all group"
                  title={t('search.clearFilters', 'Xóa bộ lọc')}
                >
                  <X size={20} className="group-hover:rotate-90 transition-transform" />
                </button>
              </div>

              <button
                onClick={handleSearch}
                className="h-12 bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white px-6 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 font-bold shadow-lg shadow-teal-600/20 group"
              >
                <Search size={20} className="group-hover:scale-110 transition-transform" />
                <span>{t('search.searchBtn', 'Tìm kiếm')}</span>
              </button>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}

import { Search, MapPin, Building2, BedDouble, DollarSign, PawPrint, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSearch } from '../context/SearchContext';
import { lookupApi } from '../api/propertyApi';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Slider } from './ui/slider';

interface LookupItem {
  id: number;
  name: string;
}

export function MapSection() {
  // Local filter state
  const [areaId, setAreaId] = useState<string>('');
  const [roomTypeId, setRoomTypeId] = useState<string>('');
  const [bedrooms, setBedrooms] = useState<string>('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000000]);
  const [allowPets, setAllowPets] = useState<boolean>(false);

  const { 
    setFilters, 
    triggerSearch, 
    resetSearch,
    areas, 
    roomTypes, 
    loadingLookups 
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
      areaId: areaId && areaId !== 'all' ? Number(areaId) : undefined,
      roomTypeId: roomTypeId && roomTypeId !== 'all' ? Number(roomTypeId) : undefined,
      bedrooms: bedrooms && bedrooms !== 'all' ? Number(bedrooms) : undefined,
      minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
      maxPrice: priceRange[1] < 50000000 ? priceRange[1] : undefined,
      allowPets: allowPets || undefined,
    });
    triggerSearch();
  };

  // Reset all filters
  const handleReset = () => {
    setAreaId('');
    setRoomTypeId('');
    setBedrooms('');
    setPriceRange([0, 50000000]);
    setAllowPets(false);
    resetSearch();
  };

  const hasActiveFilters = areaId || roomTypeId || bedrooms || priceRange[0] > 0 || priceRange[1] < 50000000 || allowPets;

  return (
    <div className="relative">
      {/* Google Map */}
      <div className="h-[700px] w-full">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d122391.5026489793!2d108.11829!3d16.047079!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x314219c792252a13%3A0x401da17e47aa3afc!2sDa%20Nang%2C%20Vietnam!5e0!3m2!1sen!2s!4v1234567890"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      {/* Premium Filter Section */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/60 p-5 transition-all duration-300">
          {/* Filters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
            {/* Vị trí (Area) */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
                <MapPin size={13} />
                Vị trí
              </label>
              <Select value={areaId} onValueChange={setAreaId}>
                <SelectTrigger className="h-10 rounded-lg bg-gray-50 border-gray-200 text-sm" id="search-area-select">
                  <SelectValue placeholder="Tất cả khu vực" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả khu vực</SelectItem>
                  {areas.map((area) => (
                    <SelectItem key={area.id} value={String(area.id)}>
                      {area.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Loại BĐS (Room Type) */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
                <Building2 size={13} />
                Loại BĐS
              </label>
              <Select value={roomTypeId} onValueChange={setRoomTypeId}>
                <SelectTrigger className="h-10 rounded-lg bg-gray-50 border-gray-200 text-sm" id="search-roomtype-select">
                  <SelectValue placeholder="Tất cả loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả loại</SelectItem>
                  {roomTypes.map((rt) => (
                    <SelectItem key={rt.id} value={String(rt.id)}>
                      {rt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Số phòng ngủ */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
                <BedDouble size={13} />
                Phòng ngủ
              </label>
              <Select value={bedrooms} onValueChange={setBedrooms}>
                <SelectTrigger className="h-10 rounded-lg bg-gray-50 border-gray-200 text-sm" id="search-bedrooms-select">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="1">1 phòng</SelectItem>
                  <SelectItem value="2">2 phòng</SelectItem>
                  <SelectItem value="3">3 phòng</SelectItem>
                  <SelectItem value="4">4 phòng</SelectItem>
                  <SelectItem value="5">5+ phòng</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Khoảng giá (Price Range Popover) */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
                <DollarSign size={13} />
                Khoảng giá
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="flex h-10 w-full items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                    id="search-price-popover"
                  >
                    <span className="text-gray-700 truncate">
                      {priceRange[0] > 0 || priceRange[1] < 50000000
                        ? `${formatPrice(priceRange[0])} — ${formatPrice(priceRange[1])}`
                        : 'Tất cả mức giá'}
                    </span>
                    <DollarSign size={14} className="text-gray-400 shrink-0" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-5" align="start">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-gray-700">Mức giá hàng tháng</p>
                      <span className="text-xs text-teal-600 font-semibold bg-teal-50 px-2 py-0.5 rounded-md">
                        {formatPrice(priceRange[0])} — {formatPrice(priceRange[1])}
                      </span>
                    </div>
                    <Slider
                      value={priceRange}
                      onValueChange={(v) => setPriceRange(v as [number, number])}
                      min={0}
                      max={50000000}
                      step={500000}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>0đ</span>
                      <span>50tr</span>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Cho phép thú cưng (Allow Pets Toggle) */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
                <PawPrint size={13} />
                Thú cưng
              </label>
              <button
                onClick={() => setAllowPets(!allowPets)}
                className={`flex h-10 w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  allowPets
                    ? 'bg-teal-50 border-teal-300 text-teal-700'
                    : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                }`}
                id="search-allow-pets-toggle"
              >
                <PawPrint size={16} className={allowPets ? 'text-teal-600' : 'text-gray-400'} />
                <span>{allowPets ? 'Được phép' : 'Tất cả'}</span>
              </button>
            </div>

            {/* Search + Reset Buttons */}
            <div className="flex items-end gap-2 min-w-[140px]">
              <button
                onClick={handleSearch}
                className="flex-grow h-10 bg-teal-600 hover:bg-teal-700 active:scale-[0.97] text-white px-5 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 text-sm font-medium shadow-md shadow-teal-600/20 hover:shadow-lg hover:shadow-teal-600/30"
                id="search-submit-button"
              >
                <Search size={16} />
                <span className="whitespace-nowrap">Tìm kiếm</span>
              </button>
              
              <div className={`flex transition-all duration-300 ease-in-out ${hasActiveFilters ? 'w-10 opacity-100' : 'w-0 opacity-0 overflow-hidden'}`}>
                <button
                  onClick={handleReset}
                  className="h-10 w-10 flex-shrink-0 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 hover:text-gray-700 transition-all duration-200 flex items-center justify-center"
                  aria-label="Xóa bộ lọc"
                  title="Xóa bộ lọc"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

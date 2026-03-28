import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Star, 
  MapPin, 
  Home, 
  Maximize2, 
  Phone, 
  Mail,
  Share2,
  ChevronLeft,
  ChevronRight,
  Wifi,
  Wind,
  Shield,
  Droplets,
  Tv,
  UtensilsCrossed,
  Refrigerator,
  Bed,
  PawPrint,
  ArrowLeft
} from 'lucide-react';
import { PropertyGallery } from '../components/PropertyDetail/PropertyGallery';
import { PropertyMapVietnamese } from '../components/PropertyDetail/PropertyMapVietnamese';
import { PropertyCard } from '../components/PropertyCard';
import { LeaseLinkChatbot } from '../components/PropertyDetail/LeaseLinkChatbot';
import { propertyApi } from '../api/propertyApi';
import { motion } from 'framer-motion';

const similarProperties = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1669317139155-912572c38362?w=400',
    title: 'Căn hộ 1PN gần biển Mỹ Khê, full nội thất',
    location: 'Dương Tự Quán, Mỹ An, Mỹ Khê',
    rating: 4.8,
    reviewCount: 27,
    beds: 1,
    baths: 1,
    area: 70,
    price: '14.000.000 đ / tháng',
    propertyType: 'canho' as const,
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1704428382583-c9c7c1e55d94?w=400',
    title: '5/4 Trống sắn căn 1PN đẹp gần biển',
    location: 'Ngô Quyền, Sơn Trà, Sơn Trà',
    rating: 4.8,
    reviewCount: 56,
    beds: 1,
    baths: 1,
    area: 70,
    price: '9.500.000 đ / tháng',
    propertyType: 'canho' as const,
  },
];


export default function PropertyDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [phoneRevealed, setPhoneRevealed] = useState(false);
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await propertyApi.getPropertyById(id);
        const data = res.data || res;

        // Map backend response to UI model
        const mappedData = {
          id: data.id,
          title: data.title,
          rating: 4.8, // Mocked as backend doesn't have it yet
          reviewCount: Math.floor(Math.random() * 50) + 10,
          location: `${data.addressLine}, ${data.areaName}`,
          price: data.monthlyPrice,
          deposit: data.monthlyPrice, // Often matches 1 month
          bedrooms: data.bedrooms || 0,
          roomType: data.roomTypeName || 'Chưa xác định',
          area: data.areaM2 || 0,
          allowPets: data.allowPets || false,
          availableFrom: 'Sẵn sàng',
          images: data.images?.map((img: any) => img.imageUrl) || [],
          description: data.description || '',
          amenities: [
            { icon: Wifi, label: 'Wifi miễn phí' },
            { icon: Wind, label: 'Điều hòa' },
            { icon: Droplets, label: 'Nóng lạnh' },
            { icon: Tv, label: 'TV' },
            { icon: UtensilsCrossed, label: 'Bếp từ' },
            { icon: Refrigerator, label: 'Tủ lạnh' },
            { icon: Shield, label: 'Bảo vệ 24/7' },
            ...(data.allowPets ? [{ icon: PawPrint, label: 'Cho phép thú cưng' }] : []),
          ], 
          landlord: {
            name: data.hostName || 'Chủ nhà',
            phone: data.hostPhone || '0**********',
            email: 'contact@leaselink.vn',
          },
        };
        setProperty(mappedData);
      } catch (err) {
        console.error("Failed to fetch property details:", err);
        setError("Không thể tải thông tin bất động sản.");
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="font-bold text-primary animate-pulse uppercase tracking-widest text-xs">Đang tải dữ liệu...</p>
      </div>
    </div>
  );

  if (error || !property) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
      <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md border border-gray-100">
        <div className="w-20 h-20 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Share2 className="w-10 h-10 text-rose-500" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Oops! Có lỗi xảy ra</h2>
        <p className="text-gray-500 font-medium mb-8 leading-relaxed">
          {error || "Chúng mình không tìm thấy thông tin căn hộ này. Có thể tin đã bị ẩn hoặc gỡ bỏ."}
        </p>
        <button 
          onClick={() => navigate('/')}
          className="w-full h-14 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all active:scale-98"
        >
          Quay lại trang chủ
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Top Header / Back Button */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30 transition-all">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors font-medium group"
          >
            <div className="p-2 rounded-full group-hover:bg-primary/5 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span>Quay lại</span>
          </button>
          <div className="flex items-center gap-2">
            <button className="p-2.5 rounded-full text-gray-600 hover:text-primary hover:bg-primary/5 transition-all">
              <Share2 className="w-5 h-5" />
            </button>
            <div className="h-6 w-px bg-gray-100 mx-1"></div>
            <p className="text-sm font-semibold text-primary">ID: {id || property.id}</p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Main Info (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Gallery Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <PropertyGallery images={property.images} />
            </motion.div>

            {/* Property Content Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <div className="mb-6">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Property Detail
                  </span>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-full border border-amber-100">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-bold text-amber-700">{property.rating}</span>
                    <span className="text-xs text-amber-600/70">({property.reviewCount}+ đánh giá)</span>
                  </div>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight mb-3">
                  {property.title}
                </h1>
                <div className="flex items-start gap-2 text-gray-500">
                  <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm sm:text-base font-medium leading-relaxed">{property.location}</p>
                </div>
              </div>

              {/* Specs Icons Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-8 border-y border-gray-100 my-8">
                <div className="flex flex-col items-center p-4 rounded-xl bg-gray-50/50 hover:bg-teal-50/50 transition-colors border border-transparent hover:border-teal-100 group">
                  <div className="p-3 bg-white rounded-xl shadow-sm mb-3 group-hover:scale-110 transition-transform">
                    <Home className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Loại phòng</p>
                  <p className="text-sm font-bold text-gray-800 text-center line-clamp-1">{property.roomType}</p>
                </div>
                <div className="flex flex-col items-center p-4 rounded-xl bg-gray-50/50 hover:bg-teal-50/50 transition-colors border border-transparent hover:border-teal-100 group">
                  <div className="p-3 bg-white rounded-xl shadow-sm mb-3 group-hover:scale-110 transition-transform">
                    <Maximize2 className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Diện tích</p>
                  <p className="text-lg font-bold text-gray-800">{property.area} m²</p>
                </div>
                <div className="flex flex-col items-center p-4 rounded-xl bg-gray-50/50 hover:bg-teal-50/50 transition-colors border border-transparent hover:border-teal-100 group">
                  <div className="p-3 bg-white rounded-xl shadow-sm mb-3 group-hover:scale-110 transition-transform">
                    <Bed className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Phòng ngủ</p>
                  <p className="text-lg font-bold text-gray-800">{property.bedrooms} PN</p>
                </div>
                <div className="flex flex-col items-center p-4 rounded-xl bg-gray-50/50 hover:bg-teal-50/50 transition-colors border border-transparent hover:border-teal-100 group">
                  <div className="p-3 bg-white rounded-xl shadow-sm mb-3 group-hover:scale-110 transition-transform">
                    <PawPrint className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Thú cưng</p>
                  <p className="text-sm font-bold text-gray-800">{property.allowPets ? 'Cho phép' : 'Không cho phép'}</p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 pb-2 border-b-2 border-primary w-fit">Giới thiệu</h2>
                <div className="text-gray-600 whitespace-pre-line leading-relaxed text-base">
                  {property.description}
                </div>
              </div>
            </div>

            {/* Amenities Section */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Tiện ích căn hộ</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {property.amenities.map((amenity: any, index: number) => {
                  const Icon = amenity.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-xl hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100 group"
                    >
                      <div className="p-2 bg-white rounded-lg shadow-sm group-hover:bg-primary/10 transition-colors">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-sm font-bold text-gray-700">{amenity.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Location Section */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Vị trí địa lý</h2>
                <span className="text-sm font-medium text-primary">Xem chi tiết</span>
              </div>
              <PropertyMapVietnamese address={property.location} />
            </div>
          </div>

          {/* Right Column - Booking & Sticky (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-24 space-y-6">
              {/* Contact Card */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-teal-50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                
                {/* Price Display */}
                <div className="mb-8 relative z-10">
                  <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-extrabold text-primary tracking-tight">
                      {property.price.toLocaleString('vi-VN')} đ
                    </p>
                    <p className="text-gray-400 font-semibold text-sm">/tháng</p>
                  </div>
                  <div className="mt-4 flex flex-col gap-2">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tiền cọc</span>
                      <span className="text-sm font-bold text-gray-900">{property.deposit.toLocaleString('vi-VN')} đ</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50/50 rounded-xl border border-green-100">
                      <span className="text-xs font-bold text-green-600 uppercase tracking-wider">Trạng thái</span>
                      <span className="text-xs font-extrabold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">CÒN PHÒNG</span>
                    </div>
                  </div>
                </div>

                {/* Host Info */}
                <div className="mb-8 space-y-4">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Thông tin chủ nhà</p>
                  <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl">
                    <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center text-xl font-black shadow-lg shadow-primary/20 shrink-0">
                      {property.landlord.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-extrabold text-gray-900 truncate text-lg leading-tight">{property.landlord.name}</p>
                      <p className="text-sm font-bold text-teal-600">Chủ sở hữu hệ thống</p>
                    </div>
                  </div>
                </div>

                {/* Main Actions */}
                <div className="space-y-3">
                  <button
                    onClick={() => setPhoneRevealed(!phoneRevealed)}
                    className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-primary/20 active:scale-[0.98] group"
                  >
                    <Phone className="w-5 h-5 group-hover:animate-bounce" />
                    <span className="text-lg">
                      {phoneRevealed ? property.landlord.phone : 'Hiện số điện thoại'}
                    </span>
                  </button>
                  <button className="w-full h-14 border-2 border-primary text-primary hover:bg-teal-50 font-bold rounded-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98]">
                    <Mail className="w-5 h-5" />
                    <span className="text-lg">Gửi lời mời tư vấn</span>
                  </button>
                </div>

                {/* Safety Badge */}
                <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-100/50">
                  <div className="flex gap-3">
                    <Shield className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <p className="text-xs font-black text-amber-700 uppercase tracking-tight mb-1">Cảnh báo an toàn</p>
                      <p className="text-[10px] font-bold text-amber-800/80 leading-snug">
                        Chỉ giao dịch cọc tiền sau khi đã xem phòng trực tiếp & ký hợp đồng tại LeaseLink.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Share Card Mini */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                <span className="text-sm font-bold text-gray-500">Quan tâm đến tin này?</span>
                <button className="text-sm font-black text-primary hover:underline">Lưu tin ngay</button>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Properties Section */}
        <div className="mt-20">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900">Đề xuất tương tự</h2>
              <div className="h-1.5 w-20 bg-primary mt-2 rounded-full"></div>
            </div>
            <button className="text-gray-400 hover:text-primary transition-colors font-bold flex items-center gap-2">
              Xem tất cả <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {similarProperties.map((property: any) => (
              <PropertyCard key={property.id} {...property} />
            ))}
          </div>
        </div>
      </main>

      {/* Chatbot */}
      <LeaseLinkChatbot />
    </div>
  );
}

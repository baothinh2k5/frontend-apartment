import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye, X, Shield, Check, MessageSquare } from "lucide-react";
import { propertyApi } from "../../../api/propertyApi";
import { useTranslation } from "react-i18next";
import { getLocalizedText } from "../../../utils/langUtils";

const StatItem = ({ label, value }: { label: string; value: any }) => (
  <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
    <div className="text-[10px] text-gray-400 uppercase font-medium">{label}</div>
    <div className="text-sm font-bold text-gray-800 mt-0.5">{value}</div>
  </div>
);

const AmenityItem = ({ icon: Icon, label }: { icon: any; label: string }) => (
  <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-50 text-gray-600">
    <Icon className="w-3 h-3 text-teal-500" />
    <span className="text-[11px] font-medium">{label}</span>
  </div>
);

interface MyPropertiesProps {
  onPageChange: (page: string) => void;
  onEdit: (property: any) => void;
}

export function MyProperties({ onPageChange, onEdit }: MyPropertiesProps) {
  const { i18n } = useTranslation();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewProperty, setViewProperty] = useState<any | null>(null);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const res: any = await propertyApi.getMyProperties(0, 50);
      if (res && res.content) {
        setProperties(res.content);
      } else {
        setProperties([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("Bác có chắc chắn muốn xóa bài đăng này?")) {
      try {
        await propertyApi.deleteProperty(id);
        fetchProperties();
      } catch (err) {
        console.error(err);
        alert("Xóa thất bại");
      }
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-white rounded-xl shadow-sm p-6 relative">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Tin Đăng Của Tôi</h2>
        <button
          onClick={() => onPageChange("dang-tin-moi")}
          className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors shadow-sm"
        >
          <Plus size={18} />
          <span className="font-medium text-sm">Thêm Tin Mới</span>
        </button>
      </div>

      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mb-4"></div>
          Đang kết nối Server...
        </div>
      ) : properties.length === 0 ? (
        <div className="py-16 text-center text-gray-500 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
          Chưa có bài đăng nào. Hãy thử Đăng tin mới!
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-100">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="bg-gray-50/80">
              <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold w-24">Hình ảnh</th>
                <th className="py-3 px-4 font-semibold">Tài sản & Địa chỉ</th>
                <th className="py-3 px-4 font-semibold">Loại & Khu vực</th>
                <th className="py-3 px-4 font-semibold">Giá / Tháng</th>
                <th className="py-3 px-4 font-semibold">Trạng thái</th>
                <th className="py-3 px-4 font-semibold">Tác vụ</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((p) => {
                const thumb = p.images?.find((img: any) => img.isThumbnail) || p.images?.[0];
                return (
                  <tr key={p.id} className="border-b border-gray-100 hover:bg-teal-50/30 transition-colors">
                    <td className="py-3 px-4">
                      {thumb ? (
                        <div className="w-16 h-12 rounded-md overflow-hidden bg-gray-100 shadow-sm border border-gray-100">
                          <img src={thumb.imageUrl} alt="thumb" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-16 h-12 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-xs">
                          No Img
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-semibold text-gray-800 line-clamp-1">
                        {getLocalizedText(p.translations, 'title', i18n.language) || p.title}
                      </div>
                      <div className="text-xs text-gray-500 line-clamp-1 mt-0.5">{p.addressLine}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-gray-700">{p.roomTypeName}</div>
                      <div className="text-[11px] text-teal-600 mt-0.5">{p.areaName}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-teal-600">
                      {p.monthlyPrice?.toLocaleString()} đ
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1">
                        <span className={`px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-full w-fit ${
                          p.status === "PENDING" ? "bg-amber-100 text-amber-700" :
                          p.status === "REJECTED" ? "bg-red-100 text-red-700" :
                          p.status === "DELETED" ? "bg-gray-100 text-gray-500" :
                          "bg-green-100 text-green-700"
                        }`}>
                          {p.status}
                        </span>
                        {p.status === "REJECTED" && p.rejectedReason && (
                          <div className="text-[10px] text-red-500 italic max-w-[150px] line-clamp-2" title={p.rejectedReason}>
                            Lý do: {p.rejectedReason}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setViewProperty(p)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 bg-gray-50 rounded-md hover:bg-blue-100 transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => onEdit(p)}
                          className="p-1.5 text-gray-400 hover:text-teal-600 bg-gray-50 rounded-md hover:bg-teal-100 transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 bg-gray-50 rounded-md hover:bg-rose-100 transition-colors"
                          title="Xóa bài"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {viewProperty && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col transition-all">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900">Chi tiết tài sản</h3>
              <button 
                onClick={() => setViewProperty(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6 space-y-6 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="aspect-[16/10] bg-gray-100 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                    {viewProperty.images?.[0] ? (
                      <img src={viewProperty.images[0].imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 italic">Không có hình ảnh</div>
                    )}
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {viewProperty.images?.slice(1, 5).map((img: any) => (
                      <div key={img.id} className="aspect-square bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                        <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      viewProperty.status === "PENDING" ? "bg-amber-100 text-amber-600" :
                      viewProperty.status === "APPROVED" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                    }`}>
                      {viewProperty.status}
                    </span>
                    <h4 className="text-2xl font-bold text-gray-900 mt-2">
                        {getLocalizedText(viewProperty.translations, 'title', i18n.language) || viewProperty.title}
                    </h4>
                    <p className="text-gray-500 text-sm mt-1">{viewProperty.addressLine}</p>
                  </div>
                  
                  <div className="p-4 bg-teal-50 rounded-xl border border-teal-100">
                    <div className="text-xs text-teal-600 font-medium">Giá thuê hàng tháng</div>
                    <div className="text-2xl font-extrabold text-teal-700">
                      {viewProperty.monthlyPrice?.toLocaleString()} VNĐ
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <StatItem label="Diện tích" value={`${viewProperty.areaM2} m²`} />
                    <StatItem label="Phòng ngủ" value={viewProperty.bedrooms} />
                    <StatItem label="Loại phòng" value={viewProperty.roomTypeName} />
                    <StatItem label="Thú cưng" value={viewProperty.allowPets ? "Có" : "Không"} />
                  </div>

                  <div className="pt-6 border-t border-gray-100">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-3">Mô tả chi tiết</h5>
                    <div className="bg-gray-50/80 p-4 rounded-xl text-sm text-gray-600 leading-relaxed whitespace-pre-wrap border border-gray-100/50 italic">
                      {getLocalizedText(viewProperty.translations, 'description', i18n.language) || viewProperty.description || "Không có mô tả chi tiết từ bạn."}
                    </div>
                  </div>

                  {/* Amenities (Derived) */}
                  <div className="pt-4 border-t border-gray-100">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-3">Tiện ích cơ bản</h5>
                    <div className="grid grid-cols-2 gap-2">
                      <AmenityItem icon={MessageSquare} label="Wifi miễn phí" />
                      <AmenityItem icon={Check} label="Điều hòa" />
                      {viewProperty.allowPets && <AmenityItem icon={Plus} label="Cho thú cưng" />}
                    </div>
                  </div>
                </div>
              </div>

              {/* Rejected Reason */}
              {viewProperty.status === "REJECTED" && viewProperty.rejectedReason && (
                <div className="bg-red-50 p-4 rounded-xl border border-red-100 mt-6">
                  <h5 className="font-bold text-xs uppercase tracking-wider text-red-400 mb-2">Lý do từ chối từ quản trị viên</h5>
                  <p className="text-sm text-red-600">{viewProperty.rejectedReason}</p>
                </div>
              )}
            </div>
            
            <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex gap-3">
              <button 
                onClick={() => {
                  onEdit(viewProperty);
                  setViewProperty(null);
                }}
                className="flex-1 py-3 bg-teal-500 text-white rounded-xl font-bold hover:bg-teal-600 transition-all shadow-md active:scale-95">
                Chỉnh sửa tin này
              </button>
              <button 
                onClick={() => setViewProperty(null)}
                className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all active:scale-95">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

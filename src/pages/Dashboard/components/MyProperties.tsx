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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const res: any = await propertyApi.getMyProperties(0, 50);
      if (res && res.content) {
        setProperties(res.content);
        setSelectedIds(new Set()); // Reset selection
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

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === properties.length && properties.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(properties.map(p => p.id)));
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Bác có chắc chắn muốn XÓA VĨNH VIỄN bài đăng này? (Dữ liệu sẽ mất hẳn và không thể khôi phục)")) {
      try {
        await propertyApi.deleteProperty(id);
        fetchProperties();
      } catch (err) {
        console.error(err);
        alert("Xóa thất bại");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (window.confirm(`Bác có chắc chắn muốn XÓA VĨNH VIỄN ${selectedIds.size} tin đã chọn?`)) {
      try {
        await propertyApi.bulkDelete(Array.from(selectedIds));
        fetchProperties();
      } catch (err) {
        console.error(err);
        alert("Xóa hàng loạt thất bại");
      }
    }
  };

  const handleBulkHide = async () => {
    if (selectedIds.size === 0) return;
    try {
      await propertyApi.bulkHide(Array.from(selectedIds));
      fetchProperties();
    } catch (err) {
      console.error(err);
      alert("Ẩn hàng loạt thất bại");
    }
  };

  const handleToggleHide = async (id: string) => {
    try {
      await propertyApi.toggleHide(id);
      fetchProperties();
    } catch (err) {
      console.error(err);
      alert("Cập nhật trạng thái thất bại");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-white rounded-xl shadow-sm p-6 relative min-h-[500px]">
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
        <div className="overflow-x-auto rounded-lg border border-gray-100 mb-20">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="bg-gray-50/80">
              <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold w-10">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                    checked={properties.length > 0 && selectedIds.size === properties.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="py-3 px-4 font-semibold w-24">Hình ảnh</th>
                <th className="py-3 px-4 font-semibold">Tài sản & Địa chỉ</th>
                <th className="py-3 px-4 font-semibold">Loại & Khu vực</th>
                <th className="py-3 px-4 font-semibold text-right">Giá thuê</th>
                <th className="py-3 px-4 font-semibold text-center">Trạng thái</th>
                <th className="py-3 px-4 font-semibold text-right">Tác vụ</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((p) => {
                const thumb = p.images?.find((img: any) => img.isThumbnail) || p.images?.[0];
                const isHidden = p.status === "HIDDEN";
                return (
                  <tr key={p.id} className={`border-b border-gray-100 hover:bg-teal-50/30 transition-colors ${selectedIds.has(p.id) ? 'bg-teal-50/50' : ''}`}>
                    <td className="py-3 px-4">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                        checked={selectedIds.has(p.id)}
                        onChange={() => toggleSelect(p.id)}
                      />
                    </td>
                    <td className="py-3 px-4">
                      {thumb ? (
                        <div className="w-16 h-12 rounded-md overflow-hidden bg-gray-100 shadow-sm border border-gray-100">
                          <img src={thumb.imageUrl} alt="thumb" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-16 h-12 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-xs text-center">
                          No Img
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className={`font-semibold text-gray-800 line-clamp-1 ${isHidden ? 'opacity-50 italic' : ''}`}>
                        {getLocalizedText(p.translations, 'title', i18n.language) || p.title}
                      </div>
                      <div className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">{p.addressLine}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-gray-700">{p.roomTypeName}</div>
                      <div className="text-[10px] text-teal-600 font-bold uppercase tracking-tighter mt-0.5">{p.areaName}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-teal-600 font-mono text-sm">
                      {p.monthlyPrice?.toLocaleString()} đ
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full w-fit ${
                          p.status === "PENDING" ? "bg-amber-100 text-amber-700" :
                          p.status === "REJECTED" ? "bg-red-100 text-red-700" :
                          p.status === "HIDDEN" ? "bg-gray-200 text-gray-600" :
                          "bg-green-100 text-green-700"
                        }`}>
                          {p.status}
                        </span>
                        {p.status === "REJECTED" && p.rejectedReason && (
                          <div className="text-[10px] text-red-500 italic max-w-[150px] line-clamp-1 text-center" title={p.rejectedReason}>
                            Lý do: {p.rejectedReason}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => setViewProperty(p)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 bg-gray-50 rounded-lg hover:bg-blue-100 transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleToggleHide(p.id)}
                          className={`p-1.5 rounded-lg transition-colors ${isHidden ? 'text-gray-400 hover:text-green-600 bg-gray-50 hover:bg-green-100' : 'text-gray-400 hover:text-amber-600 bg-gray-50 hover:bg-amber-100'}`}
                          title={isHidden ? "Hiện bài" : "Ẩn bài"}
                        >
                          {isHidden ? <Check size={16} /> : <Shield size={16} />}
                        </button>
                        <button 
                          onClick={() => onEdit(p)}
                          className="p-1.5 text-gray-400 hover:text-teal-600 bg-gray-50 rounded-lg hover:bg-teal-100 transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 bg-gray-50 rounded-lg hover:bg-rose-100 transition-colors"
                          title="Xóa vĩnh viễn"
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

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="absolute bottom-6 left-6 right-6 bg-white border border-gray-200 p-4 rounded-2xl shadow-2xl flex items-center justify-between animate-in slide-in-from-bottom duration-300 z-50 ring-4 ring-teal-500/10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-teal-500 text-white rounded-xl flex items-center justify-center font-bold shadow-lg shadow-teal-200">
              {selectedIds.size}
            </div>
            <div>
              <div className="text-sm font-bold text-gray-800">Đã chọn {selectedIds.size} tin đăng</div>
              <button 
                onClick={() => setSelectedIds(new Set())}
                className="text-[11px] text-gray-400 hover:text-gray-600 underline">
                Bỏ chọn tất cả
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleBulkHide}
              className="px-4 py-2 border-2 border-amber-500 text-amber-600 rounded-xl text-sm font-bold hover:bg-amber-50 transition-all active:scale-95 flex items-center gap-2">
              <Shield size={16} />
              Ẩn nhanh
            </button>
            <button 
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-xl text-sm font-bold hover:from-rose-600 hover:to-red-700 transition-all shadow-lg shadow-rose-100 active:scale-95 flex items-center gap-2">
              <Trash2 size={16} />
              Xóa vĩnh viễn
            </button>
          </div>
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
                      <div className="w-full h-full flex items-center justify-center text-gray-400 italic text-sm">Không có hình ảnh</div>
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
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">{viewProperty.addressLine}</p>
                  </div>
                  
                  <div className="p-4 bg-teal-50 rounded-xl border border-teal-100">
                    <div className="text-[10px] text-teal-600 font-bold uppercase tracking-wider mb-1">Giá thuê hàng tháng</div>
                    <div className="text-2xl font-extrabold text-teal-700 font-mono">
                      {viewProperty.monthlyPrice?.toLocaleString()} đ
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <StatItem label="Diện tích" value={`${viewProperty.areaM2} m²`} />
                    <StatItem label="Phòng ngủ" value={viewProperty.bedrooms} />
                    <StatItem label="Phòng tắm" value={viewProperty.bathrooms} />
                    <StatItem label="Loại phòng" value={viewProperty.roomTypeName} />
                    <StatItem label="Thú cưng" value={viewProperty.allowPets ? "Có" : "Không"} />
                  </div>
                </div>
              </div>

              {/* Rejected Reason */}
              {viewProperty.status === "REJECTED" && viewProperty.rejectedReason && (
                <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex gap-3">
                   <div className="w-1.5 bg-red-400 rounded-full h-auto"></div>
                   <div>
                    <h5 className="font-bold text-[10px] uppercase tracking-wider text-red-500 mb-1">Lý do từ chối từ quản trị viên</h5>
                    <p className="text-sm text-red-600 italic leading-relaxed">"{viewProperty.rejectedReason}"</p>
                   </div>
                </div>
              )}
              
              <div className="pt-6 border-t border-gray-100">
                <h5 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-3">Mô tả chi tiết</h5>
                <div className="bg-gray-50/80 p-5 rounded-2xl text-sm text-gray-600 leading-relaxed whitespace-pre-wrap border border-gray-100/50 italic min-h-[100px]">
                  {getLocalizedText(viewProperty.translations, 'description', i18n.language) || viewProperty.description || "Không có mô tả chi tiết từ bạn."}
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex gap-3">
              <button 
                onClick={() => {
                  onEdit(viewProperty);
                  setViewProperty(null);
                }}
                className="flex-1 py-3 bg-teal-500 text-white rounded-xl font-bold hover:bg-teal-600 transition-all shadow-md active:scale-95 text-sm">
                Chỉnh sửa tin này
              </button>
              <button 
                onClick={() => setViewProperty(null)}
                className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all active:scale-95 text-sm">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

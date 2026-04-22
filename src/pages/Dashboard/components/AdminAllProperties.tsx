import { useState, useEffect } from "react";
import { Check, X, Eye, Edit, Trash2, Filter, MessageSquare, Plus, Shield, Star, StickyNote } from "lucide-react";
import { propertyApi } from "../../../api/propertyApi";
import { useTranslation } from "react-i18next";
import { getLocalizedText } from "../../../utils/langUtils";
import { toast } from "sonner";

interface Property {
  id: string;
  title: string;
  description: string;
  addressLine: string;
  hostName: string;
  areaName: string;
  roomTypeName: string;
  monthlyPrice: number;
  areaM2: number;
  bedrooms: number;
  allowPets: boolean;
  status: string;
  isFeatured: boolean;
  internalNotes: string;
  createdAt: string;
  rejectedReason?: string;
  hostPhone?: string;
  translations?: any[];
  images: Array<{
    id: string;
    imageUrl: string;
    isThumbnail: boolean;
  }>;
}

interface AdminAllPropertiesProps {
  onEdit: (property: any) => void;
}

export const AdminAllProperties = ({ onEdit }: AdminAllPropertiesProps) => {
  const { i18n } = useTranslation();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [viewProperty, setViewProperty] = useState<Property | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [noteModal, setNoteModal] = useState<{ id: string, notes: string } | null>(null);
  const [savingNote, setSavingNote] = useState(false);

  const fetchAll = async () => {
    try {
      setLoading(true);
      
      const params: any = { page, size: 10 };
      if (statusFilter) params.status = statusFilter;
      
      const m = await import("../../../api/axiosClient");
      const res: any = await m.default.get("/properties", { params });
      
      setProperties(res.content || []);
      setTotalPages(res.totalPages || 0);
      setTotalElements(res.totalElements || 0);
      setSelectedIds(new Set());

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [page, statusFilter]);

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
    if (!confirm("Bác có chắc chắn muốn XÓA VĨNH VIỄN tin này khỏi hệ thống? (Không thể khôi phục)")) return;
    try {
      await propertyApi.deleteProperty(id);
      fetchAll();
      alert("Xóa thành công.");
    } catch (err) {
      console.error(err);
      alert("Xóa thất bại.");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (confirm(`Xác nhận XÓA VĨNH VIỄN ${selectedIds.size} tin đã chọn?`)) {
      try {
        await propertyApi.bulkDelete(Array.from(selectedIds));
        fetchAll();
      } catch (err) {
        console.error(err);
        alert("Xóa hàng loạt thất bại.");
      }
    }
  };

  const handleBulkHide = async () => {
    if (selectedIds.size === 0) return;
    try {
      await propertyApi.bulkHide(Array.from(selectedIds));
      fetchAll();
    } catch (err) {
      console.error(err);
      alert("Ẩn hàng loạt thất bại.");
    }
  };

  const handleToggleHide = async (id: string) => {
    try {
      await propertyApi.toggleHide(id);
      fetchAll();
    } catch (err) {
      console.error(err);
      alert("Thao tác thất bại.");
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm("Xác nhận duyệt tin này?")) return;
    try {
      await propertyApi.bulkApprove([id]);
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleFeatured = async (id: string) => {
    try {
      await propertyApi.toggleFeatured(id);
      setProperties(prev => prev.map(p => p.id === id ? { ...p, isFeatured: !p.isFeatured } : p));
      toast.success("Đã cập nhật trạng thái nổi bật");
    } catch (err) {
      console.error(err);
      toast.error("Không thể cập nhật trạng thái");
    }
  };

  const handleUpdateNotes = async () => {
    if (!noteModal) return;
    try {
      setSavingNote(true);
      await propertyApi.updateInternalNotes(noteModal.id, noteModal.notes);
      setProperties(prev => prev.map(p => p.id === noteModal.id ? { ...p, internalNotes: noteModal.notes } : p));
      setNoteModal(null);
      toast.success("Đã lưu ghi chú");
    } catch (err) {
      console.error(err);
      toast.error("Không thể lưu ghi chú");
    } finally {
      setSavingNote(false);
    }
  };

  return (
    <div className="space-y-6 relative min-h-[500px]">
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-50 flex flex-col items-center justify-center rounded-2xl animate-in fade-in duration-300">
          <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin mb-4 shadow-sm"></div>
          <p className="text-teal-600 font-bold text-sm tracking-wide animate-pulse uppercase">Đang tải dữ liệu...</p>
        </div>
      )}
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Quản Lý Toàn Bộ Tin Đăng</h2>
          <p className="text-sm text-gray-500 mt-1">Tổng cộng {totalElements} tin trong hệ thống</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all appearance-none cursor-pointer hover:bg-white"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="PENDING">Đang chờ duyệt</option>
              <option value="APPROVED">Đã duyệt</option>
              <option value="REJECTED">Đã từ chối</option>
              <option value="HIDDEN">Đã ẩn</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-20">
        <div className="overflow-x-auto text-sm">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 w-10">
                   <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                    checked={properties.length > 0 && selectedIds.size === properties.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-6 py-4 font-semibold text-gray-600 uppercase tracking-wider text-[11px]">Tin đăng & Địa chỉ</th>
                <th className="px-6 py-4 font-semibold text-gray-600 uppercase tracking-wider text-[11px]">Người đăng</th>
                <th className="px-6 py-4 font-semibold text-gray-600 uppercase tracking-wider text-[11px]">Giá thuê</th>
                <th className="px-6 py-4 font-semibold text-gray-600 uppercase tracking-wider text-[11px] text-center">Trạng thái</th>
                <th className="px-6 py-4 font-semibold text-gray-600 uppercase tracking-wider text-[11px] text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {properties.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">
                    Không tìm thấy bài đăng nào phù hợp.
                  </td>
                </tr>
              ) : (
                properties.map((p) => {
                  const isHidden = p.status === "HIDDEN";
                  const isFeatured = p.isFeatured;
                  return (
                    <tr key={p.id} className={`hover:bg-gray-50/50 transition-colors group ${selectedIds.has(p.id) ? 'bg-teal-50/30' : ''} ${isFeatured ? 'bg-amber-50/40 border-l-4 border-l-amber-400' : ''}`}>
                      <td className="px-6 py-4">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                          checked={selectedIds.has(p.id)}
                          onChange={() => toggleSelect(p.id)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-10 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-100 shadow-sm">
                            {p.images?.[0] ? (
                              <img src={p.images[0].imageUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">No Image</div>
                            )}
                          </div>
                          <div>
                            <div className={`font-bold text-gray-900 line-clamp-1 ${isHidden ? 'opacity-50 italic' : ''}`}>
                              {getLocalizedText(p.translations, 'title', i18n.language) || p.title}
                              {isFeatured && <Star className="inline-block ml-2 w-3 h-3 fill-amber-400 text-amber-500" />}
                            </div>
                            <div className="text-[11px] text-gray-500 line-clamp-1">{p.addressLine}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-700 font-medium">{p.hostName}</div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-tight">Chủ sở hữu</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-teal-600 font-mono">
                        {p.monthlyPrice.toLocaleString()} đ
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-center">
                          <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${
                            p.status === "PENDING" ? "bg-amber-50 text-amber-600 border-amber-100" :
                            p.status === "APPROVED" ? "bg-green-50 text-green-600 border-green-100" :
                            p.status === "HIDDEN" ? "bg-gray-100 text-gray-500 border-gray-200" :
                            "bg-red-50 text-red-600 border-red-100"
                          }`}>
                            {p.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleToggleFeatured(p.id)}
                            className={`p-1.5 rounded-lg transition-all ${isFeatured ? 'text-amber-500 bg-amber-100/50 hover:bg-amber-100' : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50'}`}
                            title={isFeatured ? "Bỏ nổi bật" : "Đánh dấu nổi bật"}
                          >
                            <Star className={`w-4 h-4 ${isFeatured ? 'fill-current' : ''}`} />
                          </button>
                          <button
                            onClick={() => setNoteModal({ id: p.id, notes: p.internalNotes || "" })}
                            className="p-1.5 hover:bg-teal-50 text-gray-400 hover:text-teal-600 rounded-lg transition-all"
                            title="Ghi chú nội bộ"
                          >
                            <StickyNote className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setViewProperty(p)}
                            className="p-1.5 hover:bg-blue-50 text-gray-400 hover:text-blue-500 rounded-lg transition-all" title="Xem nhanh">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleHide(p.id)}
                            className={`p-1.5 rounded-lg transition-colors ${isHidden ? 'hover:bg-green-50 text-gray-400 hover:text-green-500' : 'hover:bg-amber-50 text-gray-400 hover:text-amber-500'}`} 
                            title={isHidden ? "Hiện lại" : "Ẩn tin"}>
                            {isHidden ? <Check className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => onEdit(p)}
                            className="p-1.5 hover:bg-teal-50 text-gray-400 hover:text-teal-500 rounded-lg transition-all" title="Chỉnh sửa">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-1.5 hover:bg-rose-50 text-gray-400 hover:text-rose-500 rounded-lg transition-all" title="Xóa vĩnh viễn">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-center gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${page === i ? "bg-teal-500 text-white shadow-md shadow-teal-200" : "bg-white text-gray-500 hover:bg-gray-100"
                  }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white border border-gray-200 p-4 rounded-2xl shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom duration-300 z-[60] ring-4 ring-teal-500/10 min-w-[500px]">
          <div className="flex items-center gap-3 pr-6 border-r border-gray-100">
            <div className="w-10 h-10 bg-teal-500 text-white rounded-xl flex items-center justify-center font-bold shadow-lg shadow-teal-200">
              {selectedIds.size}
            </div>
            <div>
              <div className="text-sm font-bold text-gray-800">Đã chọn {selectedIds.size} tin</div>
              <button 
                onClick={() => setSelectedIds(new Set())}
                className="text-[11px] text-gray-400 hover:text-gray-600 underline">
                Bỏ chọn
              </button>
            </div>
          </div>
          <div className="flex gap-2 flex-1 justify-end">
            <button 
              onClick={handleBulkHide}
              className="px-4 py-2 border-2 border-amber-500 text-amber-600 rounded-xl text-sm font-bold hover:bg-amber-50 transition-all flex items-center gap-2">
              <Shield size={16} />
              Ẩn nhanh
            </button>
            <button 
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-xl text-sm font-bold hover:from-rose-600 hover:to-red-700 transition-all shadow-lg shadow-rose-100 flex items-center gap-2">
              <Trash2 size={16} />
              Xóa vĩnh viễn
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {viewProperty && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in duration-200 flex flex-col">
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
                    {viewProperty.images?.slice(1, 5).map((img) => (
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
                      viewProperty.status === "APPROVED" ? "bg-green-100 text-green-600" :
                      viewProperty.status === "HIDDEN" ? "bg-gray-200 text-gray-600" :
                      "bg-red-100 text-red-600"
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
                    <div className="text-2xl font-extrabold text-teal-700 font-mono">
                      {viewProperty.monthlyPrice.toLocaleString()} VNĐ
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <StatItem label="Diện tích" value={`${viewProperty.areaM2} m²`} />
                    <StatItem label="Phòng ngủ" value={viewProperty.bedrooms} />
                    <StatItem label="Loại phòng" value={viewProperty.roomTypeName} />
                    <StatItem label="Thú cưng" value={viewProperty.allowPets ? "Có" : "Không"} />
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-2">Thông tin người đăng</h5>
                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <div className="w-10 h-10 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold">
                        {viewProperty.hostName?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-800">{viewProperty.hostName}</div>
                        <div className="text-[10px] text-gray-400 font-medium">{viewProperty.hostPhone || "Chưa cập nhật SĐT"}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <h5 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-3">Mô tả chi tiết</h5>
                <div className="bg-gray-50/80 p-5 rounded-2xl text-sm text-gray-600 leading-relaxed whitespace-pre-wrap border border-gray-100/50 italic">
                  {getLocalizedText(viewProperty.translations, 'description', i18n.language) || viewProperty.description || "Không có mô tả chi tiết."}
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex gap-3">
              {viewProperty.status === "PENDING" && (
                <button
                  onClick={() => {
                    handleApprove(viewProperty.id);
                    setViewProperty(null);
                  }}
                  className="flex-1 py-3 bg-teal-500 text-white rounded-xl font-bold hover:bg-teal-600 transition-all shadow-md active:scale-95">
                  Duyệt tin này
                </button>
              )}
              <button
                onClick={() => {
                  onEdit(viewProperty);
                  setViewProperty(null);
                }}
                className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all active:scale-95">
                Chỉnh sửa
              </button>
               <button
                onClick={() => {
                  handleToggleHide(viewProperty.id);
                }}
                className="px-6 py-3 bg-white border border-amber-500 text-amber-500 rounded-xl font-bold hover:bg-amber-50 transition-all active:scale-95">
                {viewProperty.status === "HIDDEN" ? "Hiện" : "Ẩn"}
              </button>
              <button
                onClick={() => {
                  handleDelete(viewProperty.id);
                  setViewProperty(null);
                }}
                className="px-6 py-3 bg-white border border-rose-500 text-rose-500 rounded-xl font-bold hover:bg-rose-50 transition-all active:scale-95">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Quick Note Modal */}
      {noteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <StickyNote className="w-5 h-5 text-teal-600" />
                Ghi chú nội bộ
              </h3>
              <button onClick={() => setNoteModal(null)} className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"><X size={18} /></button>
            </div>
            <div className="p-5">
              <textarea
                className="w-full h-32 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all placeholder:text-gray-300 resize-none"
                placeholder="Ghi chú quan trọng về khách hàng, trạng thái phòng, hoặc lưu ý bảo trì..."
                value={noteModal.notes}
                onChange={(e) => setNoteModal({ ...noteModal, notes: e.target.value })}
              />
              <div className="mt-4 flex gap-3">
                <button
                  disabled={savingNote}
                  onClick={handleUpdateNotes}
                  className="flex-1 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {savingNote ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Check size={18} />}
                  Lưu Ghi Chú
                </button>
                <button onClick={() => setNoteModal(null)} className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all">Đóng</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatItem = ({ label, value }: { label: string; value: any }) => (
  <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">{label}</div>
    <div className="text-sm font-bold text-gray-800">{value}</div>
  </div>
);

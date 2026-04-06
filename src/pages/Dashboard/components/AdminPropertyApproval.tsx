import { useEffect, useState } from "react";
import axiosClient from "../../../api/axiosClient";
import { Check, X, Eye, MessageSquare } from "lucide-react";

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
  createdAt: string;
  images: Array<{
    id: string;
    imageUrl: string;
    isThumbnail: boolean;
  }>;
}

export const AdminPropertyApproval = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [viewProperty, setViewProperty] = useState<Property | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchPending = async () => {
    try {
      const res: any = await axiosClient.get("/properties/pending");
      setProperties(res.content || []);
      setSelectedIds(new Set()); // Reset selection on fetch
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === properties.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(properties.map(p => p.id)));
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Bạn có chắc chắn muốn duyệt ${selectedIds.size} tin này?`)) return;
    try {
      await axiosClient.post("/properties/bulk-approve", {
        ids: Array.from(selectedIds)
      });
      setProperties(properties.filter(p => !selectedIds.has(p.id)));
      setSelectedIds(new Set());
    } catch (err) {
      console.error(err);
      alert("Duyệt hàng loạt thất bại.");
    }
  };

  const handleBulkReject = async (reason: string) => {
    if (selectedIds.size === 0) return;
    try {
      await axiosClient.post("/properties/bulk-reject", {
        ids: Array.from(selectedIds),
        reason
      });
      setProperties(properties.filter(p => !selectedIds.has(p.id)));
      setSelectedIds(new Set());
      setRejectId(null);
      setRejectReason("");
    } catch (err) {
      console.error(err);
      alert("Từ chối hàng loạt thất bại.");
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn duyệt tin này?")) return;
    try {
      await axiosClient.post(`/properties/${id}/approve`);
      setProperties(properties.filter((p) => p.id !== id));
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setViewProperty(null);
    } catch (err) {
      console.error(err);
      alert("Duyệt tin thất bại.");
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    
    if (rejectId === "bulk") {
      await handleBulkReject(rejectReason);
      return;
    }

    if (!rejectId) return;
    try {
      await axiosClient.post(`/properties/${rejectId}/reject`, {
        reason: rejectReason,
      });
      setProperties(properties.filter((p) => p.id !== rejectId));
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(rejectId);
        return next;
      });
      setRejectId(null);
      setRejectReason("");
    } catch (err) {
      console.error(err);
      alert("Từ chối tin thất bại.");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center p-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
    </div>
  );

  return (
    <div className="relative bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-4 py-4 w-10">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                  checked={properties.length > 0 && selectedIds.size === properties.length}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tin đăng</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Người đăng</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Giá thuê</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ngày gửi</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {properties.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-500 italic">
                  Không có tin đăng nào đang chờ duyệt.
                </td>
              </tr>
            ) : (
              properties.map((p) => (
                <tr key={p.id} className={`hover:bg-gray-50 transition-colors ${selectedIds.has(p.id) ? 'bg-teal-50/30' : ''}`}>
                  <td className="px-4 py-4">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                      checked={selectedIds.has(p.id)}
                      onChange={() => toggleSelect(p.id)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 line-clamp-1">{p.title}</div>
                    <div className="text-xs text-gray-500">{p.areaName} • {p.roomTypeName}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{p.hostName}</td>
                  <td className="px-6 py-4 font-semibold text-teal-600">
                    {p.monthlyPrice.toLocaleString()} đ/tháng
                  </td>
                  <td className="px-6 py-4 text-gray-500 italic">
                    {new Date(p.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-6 py-4 text-right space-x-1">
                    <button 
                      onClick={() => setViewProperty(p)}
                      className="p-2 text-gray-400 hover:text-blue-500 transition-colors" title="Xem chi tiết">
                      <Eye className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleApprove(p.id)}
                      className="p-2 text-gray-400 hover:text-green-500 transition-colors" title="Duyệt">
                      <Check className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setRejectId(p.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Từ chối">
                      <X className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] flex items-center justify-between animate-in slide-in-from-bottom duration-300 z-50">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">
              Đã chọn <span className="text-teal-600 font-bold">{selectedIds.size}</span> tin đăng
            </span>
            <button 
              onClick={() => setSelectedIds(new Set())}
              className="text-xs text-gray-500 hover:text-gray-700 underline">
              Bỏ chọn tất cả
            </button>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setRejectId("bulk")}
              className="px-4 py-2 border-2 border-red-500 text-red-500 rounded-lg text-sm font-bold hover:bg-red-50 transition-colors">
              Từ chối hàng loạt
            </button>
            <button 
              onClick={handleBulkApprove}
              className="px-4 py-2 bg-teal-500 text-white rounded-lg text-sm font-bold hover:bg-teal-600 transition-colors shadow-md shadow-teal-100">
              Duyệt nhanh ({selectedIds.size})
            </button>
          </div>
        </div>
      )}

      {/* Modal xem chi tiết */}
      {viewProperty && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-md">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900">Chi tiết tin đăng</h3>
              <button 
                onClick={() => setViewProperty(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6 space-y-8 flex-1">
              {/* Ảnh */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {viewProperty.images?.map((img) => (
                  <div key={img.id} className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 border border-gray-100 shadow-sm transition-transform hover:scale-105">
                    <img src={img.imageUrl} alt="Property" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">{viewProperty.title}</h4>
                    <p className="text-gray-500 flex items-center gap-1 text-sm">
                      <span className="font-medium text-gray-700">{viewProperty.areaName}</span> • {viewProperty.addressLine}
                    </p>
                  </div>

                  <div className="p-5 bg-teal-50 rounded-2xl border border-teal-100">
                    <div className="text-sm text-teal-600 font-medium mb-1">Giá thuê yêu cầu</div>
                    <div className="text-3xl font-extrabold text-teal-700">
                      {viewProperty.monthlyPrice.toLocaleString()} <span className="text-lg">đ/tháng</span>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">Mô tả chi tiết</h5>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-xl border border-gray-100 italic">
                      {viewProperty.description || "Không có mô tả chi tiết."}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-4">
                    <h5 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Thông số cơ bản</h5>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Loại phòng</span>
                        <span className="font-semibold text-gray-800">{viewProperty.roomTypeName}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Diện tích</span>
                        <span className="font-semibold text-gray-800">{viewProperty.areaM2} m²</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Số phòng ngủ</span>
                        <span className="font-semibold text-gray-800">{viewProperty.bedrooms}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Cho phép thú cưng</span>
                        <span className="font-semibold text-gray-800">{viewProperty.allowPets ? "Có" : "Không"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                    <h5 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-3">Người đăng</h5>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                        {viewProperty.hostName[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-800">{viewProperty.hostName}</div>
                        <div className="text-xs text-gray-500">Chủ sở hữu</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-4">
              <button 
                onClick={() => handleApprove(viewProperty.id)}
                className="flex-1 py-3 bg-teal-500 text-white rounded-xl font-bold hover:bg-teal-600 transition-all shadow-md hover:shadow-teal-200 active:scale-[0.98]">
                Duyệt tin ngay
              </button>
              <button 
                onClick={() => {
                  setRejectId(viewProperty.id);
                  setViewProperty(null);
                }}
                className="flex-1 py-3 bg-white border-2 border-red-500 text-red-500 rounded-xl font-bold hover:bg-red-50 transition-all active:scale-[0.98]">
                Từ chối tin này
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal từ chối */}
      {rejectId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-red-500" />
              Lý do từ chối
            </h3>
            <p className="text-sm text-gray-500 mb-4">Vui lòng nhập lý do từ chối để gửi thông báo cho chủ sở hữu.</p>
            <textarea 
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full h-32 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all resize-none mb-6"
              placeholder="Ví dụ: Hình ảnh không rõ nét, sai thông tin địa chỉ..."
              autoFocus
            />
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setRejectId(null);
                  setRejectReason("");
                }}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-medium border-none shadow-sm">
                Hủy
              </button>
              <button 
                onClick={handleReject}
                disabled={!rejectReason.trim()}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium disabled:opacity-50">
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

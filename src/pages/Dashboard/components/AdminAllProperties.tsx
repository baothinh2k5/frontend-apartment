import { useEffect, useState } from "react";
import axiosClient from "../../../api/axiosClient";
import { Check, X, Eye, Edit, Trash2, Filter } from "lucide-react";

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

interface AdminAllPropertiesProps {
  onEdit: (property: any) => void;
}

export const AdminAllProperties = ({ onEdit }: AdminAllPropertiesProps) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [viewProperty, setViewProperty] = useState<Property | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const params: any = { page, size: 10 };
      if (statusFilter) params.status = statusFilter;
      
      const res: any = await axiosClient.get("/api/v1/properties", { params });
      setProperties(res.content || []);
      setTotalPages(res.totalPages || 0);
      setTotalElements(res.totalElements || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [page, statusFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa vĩnh viễn tin này khỏi hệ thống?")) return;
    try {
      await axiosClient.delete(`/api/v1/properties/${id}`);
      fetchAll();
      alert("Xóa thành công.");
    } catch (err) {
      console.error(err);
      alert("Xóa thất bại.");
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm("Xác nhận duyệt tin này?")) return;
    try {
      await axiosClient.post(`/api/v1/properties/${id}/approve`);
      fetchAll();
    } catch (err) {
      console.error(err);
      alert("Duyệt tin thất bại.");
    }
  };

  if (loading && properties.length === 0) return (
    <div className="flex items-center justify-center p-20 text-teal-600 font-medium">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500 mr-3"></div>
      Đang tải dữ liệu...
    </div>
  );

  return (
    <div className="space-y-6">
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
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto text-sm">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-600 uppercase tracking-wider text-[11px]">Tin đăng & Địa chỉ</th>
                <th className="px-6 py-4 font-semibold text-gray-600 uppercase tracking-wider text-[11px]">Người đăng</th>
                <th className="px-6 py-4 font-semibold text-gray-600 uppercase tracking-wider text-[11px]">Giá thuê</th>
                <th className="px-6 py-4 font-semibold text-gray-600 uppercase tracking-wider text-[11px]">Trạng thái</th>
                <th className="px-6 py-4 font-semibold text-gray-600 uppercase tracking-wider text-[11px] text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {properties.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                    Không tìm thấy bài đăng nào phù hợp.
                  </td>
                </tr>
              ) : (
                properties.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
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
                          <div className="font-bold text-gray-900 line-clamp-1">{p.title}</div>
                          <div className="text-[11px] text-gray-500 line-clamp-1">{p.addressLine}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-700 font-medium">{p.hostName}</div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-tight">Chủ sở hữu</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-teal-600">
                      {p.monthlyPrice.toLocaleString()} đ
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${
                        p.status === "PENDING" ? "bg-amber-50 text-amber-600 border-amber-100" :
                        p.status === "APPROVED" ? "bg-green-50 text-green-600 border-green-100" :
                        "bg-red-50 text-red-600 border-red-100"
                      }`}>
                        {p.status === "PENDING" ? "CHỜ DUYỆT" : 
                         p.status === "APPROVED" ? "ĐÃ DUYỆT" : "TỪ CHỐI"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setViewProperty(p)}
                          className="p-1.5 hover:bg-blue-50 text-gray-400 hover:text-blue-500 rounded-lg transition-all" title="Xem nhanh">
                          <Eye className="w-4 h-4" />
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
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder if needed */}
        {totalPages > 1 && (
          <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-center gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                  page === i ? "bg-teal-500 text-white shadow-md shadow-teal-200" : "bg-white text-gray-500 hover:bg-gray-100"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal (Simplified from AdminPropertyApproval) */}
      {viewProperty && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in duration-200">
             <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900">Chi tiết tài sản</h3>
              <button 
                onClick={() => setViewProperty(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6 space-y-6">
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
                      viewProperty.status === "APPROVED" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                    }`}>
                      {viewProperty.status}
                    </span>
                    <h4 className="text-2xl font-bold text-gray-900 mt-2">{viewProperty.title}</h4>
                    <p className="text-gray-500 text-sm mt-1">{viewProperty.addressLine}</p>
                  </div>
                  
                  <div className="p-4 bg-teal-50 rounded-xl border border-teal-100">
                    <div className="text-xs text-teal-600 font-medium">Giá thuê hàng tháng</div>
                    <div className="text-2xl font-extrabold text-teal-700">
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
                     <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
                       <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold">{viewProperty.hostName[0].toUpperCase()}</div>
                       <div>
                         <div className="text-sm font-bold text-gray-800">{viewProperty.hostName}</div>
                         <div className="text-[10px] text-gray-500">Host tin đăng</div>
                       </div>
                     </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex gap-3">
              {viewProperty.status === "PENDING" && (
                <button 
                  onClick={() => handleApprove(viewProperty.id)}
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
    </div>
  );
};

const StatItem = ({ label, value }: { label: string; value: any }) => (
  <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
    <div className="text-[10px] text-gray-400 uppercase font-medium">{label}</div>
    <div className="text-sm font-bold text-gray-800 mt-0.5">{value}</div>
  </div>
);

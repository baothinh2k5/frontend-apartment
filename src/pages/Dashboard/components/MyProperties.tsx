import { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { propertyApi } from "../../../api/propertyApi";

interface MyPropertiesProps {
  onPageChange: (page: string) => void;
  onEdit: (property: any) => void;
}

export function MyProperties({ onPageChange, onEdit }: MyPropertiesProps) {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
                      <div className="font-semibold text-gray-800 line-clamp-1">{p.title}</div>
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
                          onClick={() => onEdit(p)}
                          className="p-1.5 text-gray-400 hover:text-teal-600 bg-gray-50 rounded-md hover:bg-teal-100 transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 bg-gray-50 rounded-md hover:bg-rose-100 transition-colors"
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
    </div>
  );
}

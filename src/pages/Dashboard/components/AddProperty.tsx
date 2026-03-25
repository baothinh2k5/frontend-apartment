import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save, UploadCloud } from "lucide-react";
import { propertyApi, lookupApi } from "../../../api/propertyApi";

const propertySchema = z.object({
  title: z.string().min(5, "Tiêu đề quá ngắn"),
  description: z.string().min(10, "Mô tả tối thiểu 10 ký tự").optional(),
  addressLine: z.string().min(5, "Vui lòng nhập địa chỉ"),
  monthlyPrice: z.number().min(1000, "Giá không hợp lệ"),
  areaM2: z.number().min(1, "Diện tích phải lớn hơn 0"),
  bedrooms: z.number().min(0, "Không được nhỏ hơn 0"),
  areaId: z.number(),
  roomTypeId: z.number(),
  allowPets: z.boolean().optional(),
});

type PropertyFormValues = z.infer<typeof propertySchema>;

interface AddPropertyProps {
  onPageChange: (page: string) => void;
}

export function AddProperty({ onPageChange }: AddPropertyProps) {
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [areas, setAreas] = useState<{ id: number, name: string }[]>([]);
  const [roomTypes, setRoomTypes] = useState<{ id: number, name: string }[]>([]);

  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const [areasRes, roomTypesRes] = await Promise.all([
          lookupApi.getAreas(),
          lookupApi.getRoomTypes()
        ]);
        setAreas(areasRes as any);
        setRoomTypes(roomTypesRes as any);
      } catch (error) {
        console.error("Failed to fetch lookup data:", error);
      }
    };
    fetchLookups();
  }, []);

  // React Hook Form
  const { register, handleSubmit, formState: { errors } } = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: "",
      addressLine: "",
      areaId: 1,      // Temp fallback
      roomTypeId: 1,  // Temp fallback
      bedrooms: 1,
      allowPets: false,
    }
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArr = Array.from(e.target.files);
      setImages((prev) => [...prev, ...filesArr].slice(0, 10)); // Maximum 10 photos
    }
  };

  const onSubmit = async (data: PropertyFormValues) => {
    try {
      setSaving(true);
      const formData = new FormData();
      // Ensure backend request matches expected data structure
      const requestBlob = new Blob([JSON.stringify(data)], { type: "application/json" });
      formData.append("data", requestBlob);

      images.forEach((img) => formData.append("images", img));

      await propertyApi.createProperty(formData);
      alert("Đăng tin thành công! Tin của bạn đang chờ quản trị viên duyệt.");
      onPageChange("tin-dang-cua-toi");
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Lỗi khi lưu tin");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-white rounded-xl shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
        <button
          onClick={() => onPageChange("tin-dang-cua-toi")}
          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-bold text-gray-800">Đăng Tin Căn Hộ/Phòng Mới</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          {/* Title */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
              Tiêu đề bài đăng <span className="text-rose-500">*</span>
            </label>
            <input
              {...register("title")}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all placeholder:text-gray-300"
              placeholder="VD: Căn hộ cao cấp 2PN trung tâm..."
            />
            {errors.title && <span className="text-[11px] text-rose-500 mt-1 block">{errors.title.message as string}</span>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
              Địa chỉ cụ thể <span className="text-rose-500">*</span>
            </label>
            <input
              {...register("addressLine")}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
              placeholder="VD: Số nhà, Tên đường..."
            />
            {errors.addressLine && <span className="text-[11px] text-rose-500 mt-1 block">{errors.addressLine.message as string}</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
              Khu vực <span className="text-rose-500">*</span>
            </label>
            <select
              {...register("areaId", { valueAsNumber: true })}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all bg-white"
            >
              {areas.length === 0 && <option value={1}>Đang tải dữ liệu...</option>}
              {areas.map(area => (
                <option key={area.id} value={area.id}>{area.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
              Loại Bất Động Sản <span className="text-rose-500">*</span>
            </label>
            <select
              {...register("roomTypeId", { valueAsNumber: true })}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all bg-white"
            >
              {roomTypes.length === 0 && <option value={1}>Đang tải dữ liệu...</option>}
              {roomTypes.map(rt => (
                <option key={rt.id} value={rt.id}>{rt.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
              Giá thuê một tháng (VND) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number" {...register("monthlyPrice", { valueAsNumber: true })}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
            />
            {errors.monthlyPrice && <span className="text-[11px] text-rose-500 mt-1 block">{errors.monthlyPrice.message as string}</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
              Diện tích (m2) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number" {...register("areaM2", { valueAsNumber: true })}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
              Số phòng ngủ <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              {...register("bedrooms", { valueAsNumber: true })}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all bg-white"
              placeholder="0 (Studio), 1, 2..."
            />
          </div>

          <div className="flex items-center gap-2 pt-8">
            <input
              type="checkbox"
              id="allowPets"
              {...register("allowPets")}
              className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
            />
            <label htmlFor="allowPets" className="text-sm font-medium text-gray-700 cursor-pointer">
              Cho phép mang theo thú cưng
            </label>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
              Mô tả chi tiết <span className="text-rose-500">*</span>
            </label>
            <textarea
              {...register("description")}
              rows={4}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all placeholder:text-gray-300 resize-none"
              placeholder="VD: Căn hộ nằm ở tầng 15 view thoáng mát, ngay sát siêu thị, nội thất cơ bản đầy đủ..."
            />
            {errors.description && <span className="text-[11px] text-rose-500 mt-1 block">{errors.description.message as string}</span>}
          </div>

          <div className="md:col-span-2 pt-2">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              Media & Hình ảnh thực tế <span className="text-rose-500">*</span>
              <span className="text-gray-400 font-normal ml-2">(Tối đa 10 file)</span>
            </label>

            <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:bg-teal-50/50 hover:border-teal-400 transition-all cursor-pointer relative group bg-white">
              <input
                type="file"
                multiple
                accept="image/*,video/mp4,video/quicktime,video/webm"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <UploadCloud className="mx-auto h-12 w-12 text-gray-300 group-hover:text-teal-500 mb-3 transition-colors" />
              <p className="text-sm font-medium text-gray-700">Kéo thả file hoặc Click để tải lên</p>
              <p className="text-xs text-gray-400 mt-1">Hỗ trợ định dạng JPG, PNG, WEBP, MP4, MOV (Max 10MB)</p>
            </div>

            {images.length > 0 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-2 scrollbar-thin">
                {images.map((img, idx) => (
                  <div key={idx} className="relative w-24 h-24 flex-shrink-0 rounded-[10px] overflow-hidden border border-gray-200 group shadow-sm bg-black flex items-center justify-center">
                    {img.type.startsWith("video/") ? (
                      <video src={URL.createObjectURL(img)} className="w-full h-full object-cover" />
                    ) : (
                      <img src={URL.createObjectURL(img)} alt="preview" className="w-full h-full object-cover bg-white" />
                    )}
                    {idx === 0 && (
                      <div className="absolute top-0 left-0 w-full bg-black/60 text-white text-[10px] uppercase font-bold text-center py-1">
                        Ảnh Chính
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-6 mt-4 border-t border-gray-100 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => onPageChange("tin-dang-cua-toi")}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Hủy Bỏ
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 focus:ring-4 ring-teal-600/30 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div>
            ) : (
              <Save size={16} />
            )}
            <span>{saving ? "Đang xử lý..." : "Hoàn tất Xuất bản"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

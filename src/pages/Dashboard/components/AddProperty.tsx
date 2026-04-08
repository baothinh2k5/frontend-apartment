import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save, UploadCloud, X, GripVertical } from "lucide-react";
import { propertyApi, lookupApi } from "../../../api/propertyApi";
import { amenityApi, AmenitySet } from "../../../api/amenityApi";
import { toast } from "sonner";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const propertySchema = z.object({
  titleVI: z.string().min(5, "Tiêu đề quá ngắn"),
  descriptionVI: z.string().min(10, "Mô tả tối thiểu 10 ký tự").optional(),
  titleEN: z.string().min(5, "Tiêu đề tiếng Anh quá ngắn").optional(),
  descriptionEN: z.string().optional(),
  addressLine: z.string().min(5, "Vui lòng nhập địa chỉ"),
  monthlyPrice: z.number().min(1000, "Giá không hợp lệ"),
  areaM2: z.number().min(1, "Diện tích phải lớn hơn 0"),
  bedrooms: z.number().min(0, "Không được nhỏ hơn 0"),
  bathrooms: z.number().min(0, "Không được nhỏ hơn 0"),
  areaId: z.number(),
  roomTypeId: z.number(),
  allowPets: z.enum(["YES", "NO", "FLEXIBLE"]),
  amenitySetId: z.string().uuid("Vui lòng chọn bộ tiện ích").optional().nullable(),
});

type PropertyFormValues = z.infer<typeof propertySchema>;

interface AddPropertyProps {
  onPageChange: (page: string) => void;
  initialData?: any;
}

type ImageItem = {
  id?: string;
  file?: File;
  previewUrl: string;
  isExisting: boolean;
};

export function AddProperty({ onPageChange, initialData }: AddPropertyProps) {
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [areas, setAreas] = useState<{ id: number, name: string }[]>([]);
  const [roomTypes, setRoomTypes] = useState<{ id: number, name: string }[]>([]);
  const [amenitySets, setAmenitySets] = useState<AmenitySet[]>([]);
  const [activeTab, setActiveTab] = useState<'vi' | 'en'>('vi');

  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const [areasRes, roomTypesRes, amenitySetsRes] = await Promise.all([
          lookupApi.getAreas(),
          lookupApi.getRoomTypes(),
          amenityApi.getAmenitySets()
        ]);
        setAreas(areasRes as any);
        setRoomTypes(roomTypesRes as any);
        setAmenitySets(amenitySetsRes);
      } catch (error) {
        console.error("Failed to fetch lookup data:", error);
      }
    };
    fetchLookups();
  }, []);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      titleVI: "",
      descriptionVI: "",
      titleEN: "",
      descriptionEN: "",
      addressLine: "",
      areaId: 1,      
      roomTypeId: 1,  
      bedrooms: 1,
      bathrooms: 1,
      allowPets: "NO",
      amenitySetId: null,
    }
  });

  useEffect(() => {
    if (initialData) {
      let tVI = "";
      let dVI = "";
      let tEN = "";
      let dEN = "";
      
      // Attempt to read from translations array
      if (initialData.translations && initialData.translations.length > 0) {
        const viLang = initialData.translations.find((t: any) => t.languageCode === 'vi');
        const enLang = initialData.translations.find((t: any) => t.languageCode === 'en');
        if (viLang) { tVI = viLang.title; dVI = viLang.description; }
        if (enLang) { tEN = enLang.title; dEN = enLang.description; }
      } else {
        // Fallback backward compatibility
        tVI = initialData.title || "";
        dVI = initialData.description || "";
      }

      reset({
        titleVI: tVI,
        descriptionVI: dVI,
        titleEN: tEN,
        descriptionEN: dEN,
        addressLine: initialData.addressLine || "",
        monthlyPrice: initialData.monthlyPrice || 0,
        areaM2: initialData.areaM2 || 0,
        bedrooms: initialData.bedrooms || 0,
        bathrooms: initialData.bathrooms || 0,
        areaId: initialData.areaId || 1,
        roomTypeId: initialData.roomTypeId || 1,
        allowPets: initialData.allowPets || "NO",
        amenitySetId: initialData.amenitySet?.id || null,
      });

      // Load existing images into state
      if (initialData.images && initialData.images.length > 0) {
        setImages(initialData.images.map((img: any) => ({
          id: img.id,
          previewUrl: img.imageUrl,
          isExisting: true
        })));
      }
    }
  }, [initialData, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArr = Array.from(e.target.files);
      const newItems: ImageItem[] = filesArr.map(file => ({
        file,
        previewUrl: URL.createObjectURL(file),
        isExisting: false
      }));

      setImages((prev) => {
        // Filter out duplicates (same name and size for new files)
        const filteredNew = newItems.filter(newItem => 
          !prev.some(p => p.file && p.file.name === newItem.file?.name && p.file.size === newItem.file?.size)
        );
        return [...prev, ...filteredNew];
      });
    }
  };

  const totalSizeMB = images.reduce((acc, img) => acc + (img.file?.size || 0), 0) / (1024 * 1024);

  const moveImage = (dragIndex: number, hoverIndex: number) => {
    const draggedImage = images[dragIndex];
    const newImages = [...images];
    newImages.splice(dragIndex, 1);
    newImages.splice(hoverIndex, 0, draggedImage);
    setImages(newImages);
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const newImages = [...prev];
      const removed = newImages.splice(index, 1)[0];
      if (removed && !removed.isExisting && removed.previewUrl) {
        URL.revokeObjectURL(removed.previewUrl);
      }
      return newImages;
    });
  };

  const onSubmit = async (data: PropertyFormValues) => {
    try {
      setSaving(true);
      const formData = new FormData();
      
      const translations = [];
      translations.push({ languageCode: "vi", title: data.titleVI, description: data.descriptionVI });
      if (data.titleEN && data.titleEN.trim().length > 0) {
        translations.push({ languageCode: "en", title: data.titleEN, description: data.descriptionEN });
      }

      // 1. Separate existing images and new files
      const newFiles = images.filter(img => !img.isExisting && img.file).map(img => img.file as File);
      const existingUrls = images.filter(img => img.isExisting).map(img => img.previewUrl);

      // 2. Validate total file size (Max 20MB total for NEW files)
      const MAX_TOTAL_SIZE = 20 * 1024 * 1024; // 20MB
      let totalNewSize = 0;
      newFiles.forEach(file => { totalNewSize += file.size; });
      
      if (totalNewSize > MAX_TOTAL_SIZE) {
        toast.error(`Tổng dung lượng file mới (${(totalNewSize / (1024 * 1024)).toFixed(2)}MB) vượt quá giới hạn cho phép (20MB).`);
        return;
      }

      // 3. Build Metadata with existingImageUrls
      const metadata = JSON.stringify({
        ...data,
        translations,
        existingImageUrls: existingUrls
      });
      const metadataBlob = new Blob([metadata], { type: "application/json" });
      formData.append("data", metadataBlob, "data.json");

      // 4. Append new images
      if (newFiles.length > 0) {
        newFiles.forEach((file) => formData.append("images", file));
      }

      if (initialData?.id) {
        await propertyApi.updateProperty(initialData.id, formData);
        alert("Cập nhật tin thành công!");
      } else {
        await propertyApi.createProperty(formData);
        alert("Đăng tin thành công! Tin của bạn đang chờ quản trị viên duyệt.");
      }
      onPageChange("tin-dang-cua-toi");
    } catch (err: any) {
      console.error(err);
      // Neu loi la 401 thi de axiosClient xu ly redirect, khong can hien toast o day
      if (err.response?.status !== 401) {
        toast.error(err.response?.data?.message || "Lỗi khi lưu tin");
      }
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
        <h2 className="text-xl font-bold text-gray-800">
          {initialData ? "Chỉnh Sửa Tin Đăng" : "Đăng Tin Căn Hộ/Phòng Mới"}
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          {/* Multi-language Tabs */}
          <div className="md:col-span-2">
            <div className="flex border-b border-gray-200 mb-4">
              <button
                type="button"
                className={`py-2 px-4 font-medium text-sm transition-colors border-b-2 ${activeTab === 'vi' ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                onClick={() => setActiveTab('vi')}
              >
                Tiếng Việt (Mặc định)
              </button>
              <button
                type="button"
                className={`py-2 px-4 font-medium text-sm transition-colors border-b-2 ${activeTab === 'en' ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                onClick={() => setActiveTab('en')}
              >
                Tiếng Anh (English)
              </button>
            </div>

            {/* Vietnamese Content */}
            <div className={`${activeTab === 'vi' ? 'block' : 'hidden'} space-y-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100`}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                  Tiêu đề bài đăng (Tiếng Việt) <span className="text-rose-500">*</span>
                </label>
                <input
                  {...register("titleVI")}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all placeholder:text-gray-300"
                  placeholder="VD: Căn hộ cao cấp 2PN trung tâm..."
                />
                {errors.titleVI && <span className="text-[11px] text-rose-500 mt-1 block">{errors.titleVI.message as string}</span>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                  Mô tả chi tiết (Tiếng Việt) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  {...register("descriptionVI")}
                  rows={4}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all placeholder:text-gray-300 resize-none"
                  placeholder="VD: Căn hộ nằm ở tầng 15 view thoáng mát, ngay sát siêu thị..."
                />
                {errors.descriptionVI && <span className="text-[11px] text-rose-500 mt-1 block">{errors.descriptionVI.message as string}</span>}
              </div>
            </div>

            {/* English Content */}
            <div className={`${activeTab === 'en' ? 'block' : 'hidden'} space-y-4 bg-blue-50/30 p-4 rounded-xl border border-blue-50`}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                  Tiêu đề bài đăng (Tiếng Anh) - Tùy chọn
                </label>
                <input
                  {...register("titleEN")}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all placeholder:text-gray-300"
                  placeholder="Ex: High-class 2-bedroom apartment in city center..."
                />
                {errors.titleEN && <span className="text-[11px] text-rose-500 mt-1 block">{errors.titleEN.message as string}</span>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                  Mô tả chi tiết (Tiếng Anh) - Tùy chọn
                </label>
                <textarea
                  {...register("descriptionEN")}
                  rows={4}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all placeholder:text-gray-300 resize-none"
                  placeholder="Ex: Apartment located on 15th floor with beautiful view..."
                />
                {errors.descriptionEN && <span className="text-[11px] text-rose-500 mt-1 block">{errors.descriptionEN.message as string}</span>}
              </div>
            </div>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
              Số phòng tắm <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              {...register("bathrooms", { valueAsNumber: true })}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all bg-white"
              placeholder="1, 2..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
              Quy định thú cưng <span className="text-rose-500">*</span>
            </label>
            <select
              {...register("allowPets")}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all bg-white"
            >
              <option value="YES">Cho phép (Allowed)</option>
              <option value="NO">Không cho phép (Not Allowed)</option>
              <option value="FLEXIBLE">Linh hoạt (Flexible)</option>
            </select>
          </div>

          <div className="md:col-span-2 bg-teal-50/30 p-4 rounded-xl border border-teal-100">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-bold text-gray-800 flex items-center gap-2">
                Trang thiết bị & Tiện ích <span className="text-rose-500">*</span>
              </label>
              <button 
                type="button"
                className="text-[11px] font-semibold text-teal-600 hover:text-teal-700 underline"
                onClick={() => onPageChange("bo-tien-ich")}
              >
                + Tạo bộ tiện ích mới
              </button>
            </div>
            <select
              {...register("amenitySetId")}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all bg-white font-medium"
            >
              <option value="">-- Chọn bộ tiện ích --</option>
              {amenitySets.map(set => (
                <option key={set.id} value={set.id}>
                  {set.isSystem ? "[Hệ thống] " : ""}{set.name} 
                  ({set.values?.length || 0} tiện ích)
                </option>
              ))}
            </select>
            {errors.amenitySetId && <span className="text-[11px] text-rose-500 mt-1 block">{errors.amenitySetId.message as string}</span>}
            
            {(() => {
              const selectedId = watch("amenitySetId");
              if (!selectedId) return null;
              const selectedSet = amenitySets.find(s => s.id === selectedId);
              if (!selectedSet || !selectedSet.values) return null;

              return (
                <div className="mt-3 flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-1 duration-300">
                  {selectedSet.values.map((v, i) => (
                    <div key={i} className="flex items-center gap-1.5 px-3 py-1 bg-white border border-teal-200 rounded-full text-[12px] text-teal-700 shadow-sm">
                       <span className="opacity-70">{v.icon}</span>
                       <span className="font-semibold">{v.name}</span>
                       <span className="text-gray-400">: {v.value}</span>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          <div className="md:col-span-2 pt-2">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              Media & Hình ảnh thực tế <span className="text-rose-500">*</span>
              <span className="text-gray-400 font-normal ml-2">(Không giới hạn số lượng file)</span>
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
              <p className="text-xs text-gray-400 mt-1">Hỗ trợ định dạng JPG, PNG, WEBP, MP4, MOV (Tổng dung lượng tối đa 20MB)</p>
              <div className="mt-3 flex items-center justify-center gap-2">
                <div className="h-1.5 w-32 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${totalSizeMB > 20 ? 'bg-rose-500' : 'bg-teal-500'}`}
                    style={{ width: `${Math.min((totalSizeMB / 20) * 100, 100)}%` }}
                  />
                </div>
                <span className={`text-[11px] font-bold ${totalSizeMB > 20 ? 'text-rose-500' : 'text-gray-500'}`}>
                  {totalSizeMB.toFixed(2)} / 20 MB
                </span>
              </div>
            </div>

            <DndProvider backend={HTML5Backend}>
              {images.length > 0 && (
                <div className="flex gap-4 mt-6 overflow-x-auto pb-4 scrollbar-thin">
                  {images.map((img, idx) => (
                    <DraggableImage
                      key={idx}
                      index={idx}
                      img={img}
                      moveImage={moveImage}
                      removeImage={removeImage}
                    />
                  ))}
                </div>
              )}
            </DndProvider>
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

interface DraggableImageProps {
  img: ImageItem;
  index: number;
  moveImage: (dragIndex: number, hoverIndex: number) => void;
  removeImage: (index: number) => void;
}

function DraggableImage({ img, index, moveImage, removeImage }: DraggableImageProps) {
  const [{ isDragging }, drag] = useDrag({
    type: "IMAGE",
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: "IMAGE",
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveImage(item.index, index);
        item.index = index;
      }
    },
  });

  const previewUrl = img.previewUrl;

  return (
    <div
      ref={(node) => {
        drag(node);
        drop(node);
      }}
      style={{ opacity: isDragging ? 0.4 : 1 }}
      className="relative w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden border-2 border-gray-100 group shadow-md bg-white cursor-move transition-all hover:border-teal-400 active:scale-95"
    >
      {img.file?.type?.startsWith("video/") || img.previewUrl?.toLowerCase().endsWith(".mp4") ? (
        <video src={previewUrl} className="w-full h-full object-cover" />
      ) : (
        <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
      )}

      {/* Drag Handle Overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none flex items-center justify-center">
        <GripVertical className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
      </div>

      {/* Delete Button */}
      <button
        type="button"
        onClick={() => removeImage(index)}
        className="absolute top-1 right-1 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-rose-600 z-20"
      >
        <X size={14} strokeWidth={3} />
      </button>

      {/* Badge */}
      {index === 0 && (
        <div className="absolute bottom-0 left-0 w-full bg-teal-600/90 text-white text-[10px] uppercase font-bold text-center py-1.5 tracking-wider">
          Ảnh Chính
        </div>
      )}
    </div>
  );
}

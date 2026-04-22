import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save, UploadCloud, X } from "lucide-react";
import { propertyApi, lookupApi } from "../../../api/propertyApi";
import { amenityApi, AmenitySet } from "../../../api/amenityApi";
import { toast } from "sonner";
import { getAmenityIcon } from "../../../utils/amenityIcons";
import { Check } from "lucide-react";
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
  isFeatured: z.boolean().default(false),
  internalNotes: z.string().optional(),
  selectionType: z.enum(["SET", "CUSTOM"]).default("SET"),
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
  const [allAmenities, setAllAmenities] = useState<any[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'vi' | 'en'>('vi');

  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const [areasRes, roomTypesRes, amenitySetsRes, amenitiesRes] = await Promise.all([
          lookupApi.getAreas(),
          lookupApi.getRoomTypes(),
          amenityApi.getAmenitySets(),
          amenityApi.getAmenities('vi')
        ]);
        setAreas(areasRes as any);
        setRoomTypes(roomTypesRes as any);
        setAmenitySets(amenitySetsRes);
        setAllAmenities(amenitiesRes);
      } catch (error) {
        console.error("Failed to fetch lookup data:", error);
      }
    };
    fetchLookups();
  }, []);

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      titleVI: "",
      descriptionVI: "",
      titleEN: "",
      descriptionEN: "",
      addressLine: "",
      areaId: 1,      
      roomTypeId: 1,  
      monthlyPrice: 0,
      areaM2: 0,
      bedrooms: 1,
      bathrooms: 1,
      allowPets: "NO",
      isFeatured: false,
      internalNotes: "",
      selectionType: "SET",
      amenitySetId: null,
    }
  });

  useEffect(() => {
    if (initialData) {
      let tVI = "";
      let dVI = "";
      let tEN = "";
      let dEN = "";
      
      if (initialData.translations) {
        const vi = initialData.translations.find((t: any) => t.languageCode === "vi");
        const en = initialData.translations.find((t: any) => t.languageCode === "en");
        if (vi) { tVI = vi.title; dVI = vi.description; }
        if (en) { tEN = en.title; dEN = en.description; }
      }

      reset({
        titleVI: tVI,
        descriptionVI: dVI,
        titleEN: tEN,
        descriptionEN: dEN,
        addressLine: initialData.addressLine || "",
        monthlyPrice: initialData.monthlyPrice || 0,
        areaM2: initialData.areaM2 || 0,
        areaId: initialData.areaId || 1,
        roomTypeId: initialData.roomTypeId || 1,
        allowPets: initialData.allowPets || "NO",
        isFeatured: initialData.isFeatured || false,
        internalNotes: initialData.internalNotes || "",
        selectionType: initialData.amenitySet?.id ? "SET" : (initialData.customAmenities?.length > 0 ? "CUSTOM" : "SET"),
        amenitySetId: initialData.amenitySet?.id || null,
      });

      if (initialData.customAmenities) {
        const customMap: Record<string, string> = {};
        initialData.customAmenities.forEach((ca: any) => {
          customMap[ca.amenityId] = ca.value;
        });
        setSelectedAmenities(customMap);
      }

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
      const filesArray = Array.from(e.target.files);
      const newImages = filesArray.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
        isExisting: false,
      }));
      setImages((prev) => [...prev, ...newImages]);
    }
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
    console.log("Submitting form with data:", data);
    try {
      setSaving(true);
      const formData = new FormData();
      
      const translations = [];
      translations.push({ languageCode: "vi", title: data.titleVI, description: data.descriptionVI });
      if (data.titleEN && data.titleEN.trim().length > 0) {
        translations.push({ languageCode: "en", title: data.titleEN, description: data.descriptionEN });
      }

      const newFiles = images.filter(img => !img.isExisting && img.file).map(img => img.file as File);
      const existingUrls = images.filter(img => img.isExisting).map(img => img.previewUrl);

      const MAX_TOTAL_SIZE = 20 * 1024 * 1024;
      let totalNewSize = 0;
      newFiles.forEach(file => { totalNewSize += file.size; });
      
      if (totalNewSize > MAX_TOTAL_SIZE) {
        toast.error(`Tổng dung lượng file mới vượt quá giới hạn (20MB).`);
        return;
      }

      const customAmenitiesList = data.selectionType === 'CUSTOM' 
        ? Object.entries(selectedAmenities).map(([amenityId, value]) => ({ amenityId, value }))
        : [];

      const metadata = JSON.stringify({
        ...data,
        translations,
        existingImageUrls: existingUrls,
        customAmenities: customAmenitiesList,
        amenitySetId: data.selectionType === 'SET' ? data.amenitySetId : null
      });
      const metadataBlob = new Blob([metadata], { type: "application/json" });
      formData.append("data", metadataBlob, "data.json");

      if (newFiles.length > 0) {
        newFiles.forEach((file) => formData.append("images", file));
      }

      if (initialData) {
        await propertyApi.updateProperty(initialData.id, formData);
        toast.success("Cập nhật thành công!");
      } else {
        await propertyApi.createProperty(formData);
        toast.success("Đăng tin thành công!");
      }
      onPageChange("tin-dang-cua-toi");
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAmenity = (id: string, type: string) => {
    setSelectedAmenities(prev => {
      const next = { ...prev };
      if (id in next) {
        delete next[id];
      } else {
        next[id] = type === 'BOOLEAN' ? 'true' : '';
      }
      return next;
    });
  };

  const handleValueChange = (id: string, value: string) => {
    setSelectedAmenities(prev => ({ ...prev, [id]: value }));
  };

  const moveImage = (dragIndex: number, hoverIndex: number) => {
    setImages((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(dragIndex, 1);
      updated.splice(hoverIndex, 0, moved);
      return updated;
    });
  };

  return (
    <div className="flex-1 overflow-y-auto bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
        <button
          onClick={() => onPageChange("tin-dang-cua-toi")}
          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-bold text-gray-800">
          {initialData ? "Chỉnh Sửa" : "Đăng Tin Mới"}
        </h2>
      </div>

      <form 
        onSubmit={handleSubmit(onSubmit, (err) => {
          console.error("Validation Errors:", err);
          toast.error("Vui lòng kiểm tra lại các trường thông tin bắt buộc.");
        })} 
        className="space-y-6 max-w-4xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          <div className="md:col-span-2">
            <div className="flex border-b border-gray-200 mb-4">
              <button
                type="button"
                className={`py-2 px-4 font-medium text-sm border-b-2 ${activeTab === 'vi' ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-500'}`}
                onClick={() => setActiveTab('vi')}
              >
                Tiếng Việt
              </button>
              <button
                type="button"
                className={`py-2 px-4 font-medium text-sm border-b-2 ${activeTab === 'en' ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-500'}`}
                onClick={() => setActiveTab('en')}
              >
                English
              </button>
            </div>

            {activeTab === 'vi' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tiêu đề (VI) *</label>
                  <input {...register("titleVI")} className="w-full border rounded-lg px-4 py-2.5 text-sm" />
                  {errors.titleVI && <span className="text-xs text-rose-500">{errors.titleVI.message}</span>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Mô tả (VI)</label>
                  <textarea {...register("descriptionVI")} rows={4} className="w-full border rounded-lg px-4 py-2.5 text-sm" />
                  {errors.descriptionVI && <span className="text-xs text-rose-500">{errors.descriptionVI.message}</span>}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Title (EN)</label>
                  <input {...register("titleEN")} className="w-full border rounded-lg px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Description (EN)</label>
                  <textarea {...register("descriptionEN")} rows={4} className="w-full border rounded-lg px-4 py-2.5 text-sm" />
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 border-t pt-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Địa chỉ *</label>
              <input {...register("addressLine")} className="w-full border rounded-lg px-4 py-2.5 text-sm" />
              {errors.addressLine && <span className="text-xs text-rose-500">{errors.addressLine.message}</span>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Khu vực *</label>
                <select {...register("areaId", { valueAsNumber: true })} className="w-full border rounded-lg px-4 py-2.5 text-sm bg-white">
                  {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Loại hình *</label>
                <select {...register("roomTypeId", { valueAsNumber: true })} className="w-full border rounded-lg px-4 py-2.5 text-sm bg-white">
                  {roomTypes.map(rt => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Giá thuê (VND) *</label>
              <input type="number" {...register("monthlyPrice", { valueAsNumber: true })} className="w-full border rounded-lg px-4 py-2.5 text-sm" />
              {errors.monthlyPrice && <span className="text-xs text-rose-500">{errors.monthlyPrice.message}</span>}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 italic">m2 *</label>
                <input type="number" {...register("areaM2", { valueAsNumber: true })} className="w-full border rounded-lg px-3 py-2.5 text-sm" />
                {errors.areaM2 && <span className="text-xs text-rose-500">{errors.areaM2.message}</span>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 italic">P.Ngủ</label>
                <input type="number" {...register("bedrooms", { valueAsNumber: true })} className="w-full border rounded-lg px-3 py-2.5 text-sm" />
                {errors.bedrooms && <span className="text-xs text-rose-500">{errors.bedrooms.message}</span>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 italic">P.Tắm</label>
                <input type="number" {...register("bathrooms", { valueAsNumber: true })} className="w-full border rounded-lg px-3 py-2.5 text-sm" />
                {errors.bathrooms && <span className="text-xs text-rose-500">{errors.bathrooms.message}</span>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Thú cưng *</label>
              <select {...register("allowPets")} className="w-full border rounded-lg px-4 py-2.5 text-sm bg-white">
                <option value="YES">Cho phép</option>
                <option value="NO">Không cho phép</option>
                <option value="FLEXIBLE">Linh hoạt</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" {...register("isFeatured")} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                <span className="ml-3 text-sm font-semibold text-gray-700">📌 Tin nổi bật</span>
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Ghi chú nội bộ</label>
              <textarea {...register("internalNotes")} rows={2} className="w-full border rounded-lg px-4 py-2.5 text-sm resize-none" />
            </div>

            <div className="md:col-span-2 bg-teal-50/50 p-5 rounded-xl border border-teal-100">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-bold text-gray-800">Tiện ích *</label>
                <div className="flex bg-gray-200 rounded-lg p-1">
                   <button type="button" className={`px-3 py-1.5 text-[10px] font-bold rounded-md ${watch("selectionType") === 'SET' ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-500'}`} onClick={() => { console.log("Switching to SET"); setValue('selectionType', 'SET'); }}>Bộ mẫu</button>
                   <button type="button" className={`px-3 py-1.5 text-[10px] font-bold rounded-md ${watch("selectionType") === 'CUSTOM' ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-500'}`} onClick={() => { console.log("Switching to CUSTOM"); setValue('selectionType', 'CUSTOM'); }}>Chọn lẻ</button>
                </div>
              </div>

              {watch("selectionType") === 'SET' ? (
                <div className="space-y-3">
                  <select {...register("amenitySetId")} className="w-full border rounded-lg px-4 py-2.5 text-sm bg-white">
                    <option value="">-- Chọn bộ tiện ích --</option>
                    {amenitySets.map(set => <option key={set.id} value={set.id}>{set.name}</option>)}
                  </select>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allAmenities.map((amn) => {
                    const Icon = getAmenityIcon(amn.icon);
                    const isSelected = selectedAmenities.hasOwnProperty(amn.id);
                    return (
                      <div 
                          key={amn.id}
                          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col gap-3 ${isSelected ? 'border-teal-500 bg-white shadow-xl shadow-teal-50 ring-4 ring-teal-50' : 'border-gray-50 bg-white hover:border-gray-200'}`}
                          onClick={() => handleToggleAmenity(amn.id, amn.type)}
                      >
                          <div className="flex items-center justify-between">
                              <div className={`p-2 rounded-xl ${isSelected ? 'bg-teal-500 text-white' : 'bg-gray-50 text-gray-400'}`}>
                                  <Icon size={20} />
                              </div>
                              {isSelected && <div className="text-teal-500"><Check size={18} /></div>}
                          </div>
                          <div>
                              <p className={`font-bold text-sm ${isSelected ? 'text-gray-900' : 'text-gray-500'}`}>{amn.name}</p>
                              <p className="text-[10px] text-gray-400 uppercase font-medium">{amn.type}</p>
                          </div>
                          
                          {isSelected && amn.type !== 'BOOLEAN' && (
                              <input 
                                  autoFocus
                                  type={amn.type === 'NUMBER' ? 'number' : 'text'}
                                  onClick={(e) => e.stopPropagation()}
                                  value={selectedAmenities[amn.id]}
                                  onChange={(e) => handleValueChange(amn.id, e.target.value)}
                                  placeholder={amn.type === 'PRICE' ? 'VD: 5k/số hoặc Miễn phí' : 'Nhập số lượng'}
                                  className="mt-2 w-full px-3 py-2 bg-gray-50 rounded-lg text-sm outline-none border border-transparent focus:border-teal-300 transition-all font-semibold"
                              />
                          )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh *</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-teal-50 relative bg-white">
                <input type="file" multiple accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                <UploadCloud className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                <p className="text-sm font-medium">Click để tải lên</p>
              </div>
              <DndProvider backend={HTML5Backend}>
                <div className="flex gap-4 mt-6 overflow-x-auto pb-4">
                  {images.map((img, idx) => (
                    <DraggableImage key={idx} index={idx} img={img} moveImage={moveImage} removeImage={removeImage} />
                  ))}
                </div>
              </DndProvider>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t flex justify-end gap-3">
          <button type="button" onClick={() => onPageChange("tin-dang-cua-toi")} className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border rounded-lg">Hủy Bỏ</button>
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 disabled:opacity-60">
            {saving ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></span> : <Save size={16} />}
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
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
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
  return (
    <div ref={(node) => drag(drop(node))} className={`relative min-w-[120px] h-32 rounded-lg overflow-hidden border ${isDragging ? 'opacity-0' : 'opacity-100'}`}>
      <img src={img.previewUrl} className="w-full h-full object-cover" />
      <button onClick={() => removeImage(index)} className="absolute top-1 right-1 p-1 bg-white/80 rounded-full hover:bg-white"><X size={14} /></button>
    </div>
  );
}

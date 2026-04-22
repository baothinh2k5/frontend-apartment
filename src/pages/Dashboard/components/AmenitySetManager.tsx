import { useState, useEffect } from "react";
import { Plus, Trash2, Save, X, Info, Check, Shield, Edit3 } from "lucide-react";
import { getAmenityIcon } from "../../../utils/amenityIcons";
import { amenityApi, Amenity, AmenitySet } from "../../../api/amenityApi";
import { toast } from "sonner";


export function AmenitySetManager() {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [mySets, setMySets] = useState<AmenitySet[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [newName, setNewName] = useState("");
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const [list, sets] = await Promise.all([
        amenityApi.getAmenities(),
        amenityApi.getAmenitySets()
      ]);
      setAmenities(list);
      setMySets(sets);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách tiện ích");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleAmenity = (id: string, type: string) => {
    setSelectedValues(prev => {
      const next = { ...prev };
      if (id in next) { // Fixed: click 2nd time to deselect
        delete next[id];
      } else {
        next[id] = type === 'BOOLEAN' ? 'true' : '';
      }
      return next;
    });
  };

  const handleValueChange = (id: string, value: string) => {
    setSelectedValues(prev => ({ ...prev, [id]: value }));
  };

  const handleEdit = (set: AmenitySet) => {
    setNewName(set.name);
    setEditingId(set.id);
    const initialValues: Record<string, string> = {};
    set.values.forEach(v => {
        initialValues[v.amenityId] = v.value;
    });
    setSelectedValues(initialValues);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bộ tiện ích này?")) return;
    try {
        await amenityApi.deleteAmenitySet(id);
        toast.success("Đã xóa bộ tiện ích");
        fetchData();
    } catch (err) {
        toast.error("Lỗi khi xóa bộ tiện ích");
    }
  };

  const handleSave = async () => {
    if (!newName.trim()) {
      toast.error("Vui lòng nhập tên bộ tiện ích");
      return;
    }

    const values = Object.entries(selectedValues).map(([id, val]) => {
        const amenity = amenities.find(a => a.id === id);
        // Requirement: "không nhập giá thì miễn phí"
        let finalValue = val;
        if (amenity?.type === 'PRICE' && !val.trim()) {
            finalValue = "Miễn phí";
        }
        return { nameCode: amenity?.nameCode || "", value: finalValue };
    });

    if (values.length === 0) {
        toast.error("Vui lòng chọn ít nhất một tiện ích");
        return;
    }

    try {
      setSaving(true);
      if (editingId) {
        await amenityApi.updateAmenitySet(editingId, { name: newName, values });
        toast.success("Cập nhật bộ tiện ích thành công!");
      } else {
        await amenityApi.createAmenitySet({ name: newName, values });
        toast.success("Tạo bộ tiện ích thành công!");
      }
      setIsAdding(false);
      setEditingId(null);
      setNewName("");
      setSelectedValues({});
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi lưu bộ tiện ích");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-white rounded-xl shadow-sm p-6 relative min-h-[600px]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-gray-800">Quản Lý Bộ Tiện Ích</h2>
          <p className="text-gray-400 text-xs font-medium mt-1 uppercase tracking-widest">Thiết lập các gói trang thiết bị cho tin đăng của bạn</p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-6 py-3 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-all shadow-lg shadow-teal-100 font-bold active:scale-95"
          >
            <Plus size={20} />
            <span>Tạo Bộ Mới</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
             <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4"></div>
             <p className="text-gray-400 font-bold animate-pulse text-xs uppercase tracking-tighter">Đang kết nối hệ thống...</p>
        </div>
      ) : isAdding ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="bg-gray-50/50 border-2 border-dashed border-teal-200 rounded-3xl p-8 mb-8">
                <div className="max-w-2xl mx-auto space-y-8">
                    <div className="flex items-center justify-between">
                         <h3 className="text-xl font-bold text-gray-800">{editingId ? 'Chỉnh sửa bộ tiện ích' : 'Cấu hình bộ tiện ích mới'}</h3>
                         <button onClick={() => { setIsAdding(false); setEditingId(null); setNewName(""); setSelectedValues({}); }} className="p-2 hover:bg-rose-50 text-gray-400 hover:text-rose-500 rounded-full transition-colors">
                            <X size={24} />
                         </button>
                    </div>

                    <div className="space-y-4">
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-widest">Tên định danh (Ví dụ: Full Nội Thất, Cơ Bản...)</label>
                        <input 
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Nhập tên bộ tiện ích..."
                            className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 focus:border-teal-500 outline-none transition-all text-lg font-semibold shadow-sm"
                        />
                    </div>

                    <div className="space-y-6">
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-widest">Chọn các tiện ích đi kèm</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {amenities.map(amenity => {
                                const Icon = getAmenityIcon(amenity.icon);
                                const isSelected = selectedValues.hasOwnProperty(amenity.id);
                                return (
                                    <div 
                                        key={amenity.id}
                                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col gap-3 ${isSelected ? 'border-teal-500 bg-white shadow-xl shadow-teal-50 ring-4 ring-teal-50' : 'border-gray-50 bg-white hover:border-gray-200'}`}
                                        onClick={() => handleToggleAmenity(amenity.id, amenity.type)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className={`p-2 rounded-xl ${isSelected ? 'bg-teal-500 text-white' : 'bg-gray-50 text-gray-400'}`}>
                                                <Icon size={20} />
                                            </div>
                                            {isSelected && <div className="text-teal-500"><Check size={18} /></div>}
                                        </div>
                                        <div>
                                            <p className={`font-bold text-sm ${isSelected ? 'text-gray-900' : 'text-gray-500'}`}>{amenity.name}</p>
                                            <p className="text-[10px] text-gray-400 uppercase font-medium">{amenity.type}</p>
                                        </div>
                                        
                                        {isSelected && amenity.type !== 'BOOLEAN' && (
                                            <input 
                                                autoFocus
                                                type={amenity.type === 'NUMBER' ? 'number' : 'text'}
                                                onClick={(e) => e.stopPropagation()}
                                                value={selectedValues[amenity.id]}
                                                onChange={(e) => handleValueChange(amenity.id, e.target.value)}
                                                placeholder={amenity.type === 'PRICE' ? 'VD: 5k/số hoặc Miễn phí' : 'Nhập số lượng'}
                                                className="mt-2 w-full px-3 py-2 bg-gray-50 rounded-lg text-sm outline-none border border-transparent focus:border-teal-300 transition-all font-semibold"
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="pt-8 border-t border-gray-100 flex gap-4">
                         <button 
                            disabled={loading || saving}
                            onClick={handleSave}
                            className="flex-1 h-14 bg-teal-500 text-white font-bold rounded-2xl shadow-lg shadow-teal-100 hover:bg-teal-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                         >
                            {saving ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Save size={20} />
                            )}
                            <span>{saving ? 'Đang lưu...' : 'Lưu Bộ Tiện Ích'}</span>
                         </button>
                         <button 
                            onClick={() => setIsAdding(false)}
                            className="w-32 h-14 bg-white border-2 border-gray-100 text-gray-400 font-bold rounded-2xl hover:bg-gray-50 transition-all"
                         >
                            Hủy
                         </button>
                    </div>
                </div>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
            {mySets.map(set => (
                <div key={set.id} className="group bg-white rounded-3xl border border-gray-100 p-6 hover:shadow-2xl hover:shadow-teal-100/50 transition-all relative overflow-hidden flex flex-col min-h-[250px]">
                    {set.isSystem && (
                        <div className="absolute top-0 right-0 bg-teal-500 text-white text-[9px] font-black uppercase px-3 py-1 rounded-bl-xl shadow-sm z-10">System Default</div>
                    )}
                    
                    <div className="mb-6">
                        <h4 className="text-xl font-extrabold text-gray-900 group-hover:text-teal-600 transition-colors">{set.name}</h4>
                        <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-tighter">Bao gồm {set.values?.length || 0} hạng mục</p>
                    </div>

                    <div className="flex-1 space-y-2 overflow-y-auto max-h-[150px] pr-2 scrollbar-thin">
                        {set.values?.map((v, idx) => {
                            const Icon = getAmenityIcon(v.icon);
                            return (
                                <div key={idx} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl group-hover:bg-teal-50/30 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 bg-white rounded-lg text-teal-600 shadow-sm"><Icon size={14} /></div>
                                        <span className="text-sm font-bold text-gray-700">{v.name}</span>
                                    </div>
                                    <span className="text-[11px] font-black text-gray-400 font-mono">{v.value === 'true' ? 'Có' : v.value}</span>
                                </div>
                            );
                        })}
                    </div>

                    {!set.isSystem && (
                        <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => handleEdit(set)}
                                    className="p-2 text-teal-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all"
                                    title="Chỉnh sửa"
                                >
                                    <Edit3 size={18} />
                                </button>
                                <button 
                                    onClick={() => handleDelete(set.id)}
                                    className="p-2 text-rose-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                    title="Xóa"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest text-right">Custom Set</span>
                        </div>
                    )}
                </div>
            ))}
            
            {mySets.length === 0 && !loading && (
                <div className="md:col-span-2 lg:col-span-3 py-20 bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-[40px] text-center">
                    <Info className="mx-auto text-gray-200 w-16 h-16 mb-4" />
                    <h3 className="text-xl font-bold text-gray-400">Chưa có bộ hiệu chỉnh nào</h3>
                    <p className="text-gray-300 text-sm mt-1">Hãy tạo một bộ tiện ích để giúp việc đăng tin chuyên nghiệp hơn!</p>
                </div>
            )}
        </div>
      )}
    </div>
  );
}

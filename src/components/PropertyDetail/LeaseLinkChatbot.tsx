import { MessageCircle, X } from 'lucide-react';
import { useState } from 'react';

export function LeaseLinkChatbot() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Chat popup */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="bg-primary text-white px-4 py-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-lg">
                🤖
              </div>
              <div>
                <p className="font-bold text-sm leading-tight">LeaseLink AI</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                  <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest">Đang trực tuyến</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 rounded-lg p-1.5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat content */}
          <div className="p-4 h-80 bg-gray-50/50 overflow-y-auto space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 max-w-[90%]">
              <p className="text-sm font-medium text-gray-700 leading-relaxed">
                Chào bạn! Mình là trợ lý LeaseLink. Thử nhắn như "Căn hộ 1 phòng ngủ ở Hải Châu" để mình hỗ trợ nhé.
              </p>
            </div>
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="relative">
              <input
                type="text"
                placeholder="Nhập câu hỏi của bạn..."
                className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors">
                <svg className="w-5 h-5 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center z-50 transition-all hover:scale-105 active:scale-95 group"
      >
        <div className="relative">
          <MessageCircle className="w-7 h-7 group-hover:rotate-12 transition-transform" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
            <span className="text-[8px] font-black">1</span>
          </div>
        </div>
      </button>
    </>
  );
}

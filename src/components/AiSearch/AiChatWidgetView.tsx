import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Send, Sparkles, X, Loader2, ExternalLink } from 'lucide-react';
import { searchWithAI, AiSearchResponse, Property } from '../../api/aiQueryService';
import { useTranslation } from 'react-i18next';

const CHAT_STORAGE_KEY = 'leaselink_ai_chat';

const initialMascotMessagesVi = [
  'Xin chào bạn! Mình là trợ lý AI của LeaseLink, sẵn sàng hỗ trợ tìm nhà theo nhu cầu của bạn.',
  'Bạn chỉ cần mô tả tự nhiên như khu vực, giá, số phòng ngủ hay mong muốn riêng, mình sẽ gợi ý giúp bạn.',
  'Mình có thể hỗ trợ tìm căn hộ, phòng trọ hoặc nơi ở gần biển, yên tĩnh, đầy đủ nội thất.',
  'Thử nhắn như “Căn hộ 1 phòng ngủ ở Hải Châu, yên tĩnh” để mình tìm nhanh cho bạn nhé.',
];

const initialMascotMessagesEn = [
  'Hello! I am LeaseLink AI assistant, ready to help you find a home.',
  'Just describe your needs naturally like area, price, or specific wishes.',
  'I can help you find an apartment, room, or a place near the beach.',
  'Try typing “1 bedroom apartment in Hai Chau, quiet” and I will find it.',
];

function AiPropertyCard({ property, onNavigate }: { property: Property; onNavigate: (propertyId: string) => void }) {
  const imageUrl =
    property.images && property.images.length > 0
      ? property.images[0].imageUrl
      : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa';

  const formattedPrice = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(property.monthlyPrice);

  return (
    <div
      onClick={() => onNavigate(property.id)}
      className="group/card w-full cursor-pointer overflow-hidden rounded-2xl border border-teal-100 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md"
    >
      <div className="flex h-[124px]">
        <div className="relative w-[118px] shrink-0 overflow-hidden bg-slate-100">
          <img src={imageUrl} alt={property.title} className="h-full w-full object-cover transition-transform duration-300 group-hover/card:scale-105" />
          <div className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-teal-700 shadow-sm">
            {property.roomTypeName}
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between p-3">
          <div className="min-w-0">
            <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.18em] text-teal-600">
              LeaseLink gợi ý
            </p>
            <h4 className="truncate text-sm font-semibold text-slate-800">{property.title}</h4>
            <p className="mt-1 truncate text-xs text-slate-500">{property.addressLine}</p>
          </div>
          <div className="mt-3 flex items-end justify-between border-t border-slate-100 pt-2">
            <div className="text-xs text-slate-500">
              {property.bedrooms} PN <span className="mx-1 text-slate-300">|</span> {property.areaM2} m²
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-teal-700">{formattedPrice}</span>
              <span className="flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-600 opacity-0 transition-opacity duration-200 group-hover/card:opacity-100">
                Xem <ExternalLink size={10} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MascotLauncher({
  onOpen,
  onDismiss,
  visible,
  message,
  isMessageVisible,
}: {
  onOpen: () => void;
  onDismiss: () => void;
  visible: boolean;
  message: string;
  isMessageVisible: boolean;
}) {
  const { t, i18n } = useTranslation();
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {visible && (
        <div className="relative max-w-[272px] rounded-[22px] border border-amber-100 bg-white px-4 py-3 text-slate-700 shadow-[0_20px_45px_rgba(15,23,42,0.16)] animate-in fade-in slide-in-from-bottom-2 duration-500">
          <button
            onClick={onDismiss}
            className="absolute right-2 top-2 rounded-full p-1 text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-500"
            aria-label="Đóng lời chào"
          >
            <X size={14} />
          </button>
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-300 text-amber-950">
              <Sparkles size={13} />
            </div>
            <span className="text-sm font-semibold text-slate-800">LeaseLink AI</span>
          </div>
          <div
            className={`pr-5 text-sm leading-6 text-slate-600 transition-all duration-300 ${isMessageVisible ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'
              }`}
          >
            {message}
          </div>
          <div className="absolute -bottom-2 right-8 h-4 w-4 rotate-45 border-b border-r border-amber-100 bg-white" />
        </div>
      )}

      <button onClick={onOpen} className="group flex flex-col items-center">
        <div className="relative h-[84px] w-[84px] transition-transform duration-300 group-hover:-translate-y-1">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-300 via-yellow-300 to-amber-400 shadow-[0_18px_35px_rgba(245,158,11,0.35)]" />
          <div className="absolute inset-[4px] rounded-full border border-white/60" />
          <img
            src="/mascot.png"
            alt="LeaseLink mascot"
            className="relative z-10 h-full w-full rounded-full object-cover p-1"
          />
          <div className="absolute -top-1 right-1 z-20 rounded-full bg-white px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-500 shadow-sm">
            AI
          </div>
        </div>
        <span className="-mt-1 rounded-full bg-amber-400 px-3 py-1 text-[11px] font-semibold text-amber-950 shadow-sm">
          {t('ai.assistant', 'Trợ lý AI')}
        </span>
      </button>
    </div>
  );
}

export function AiChatWidgetView() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showMascotGreeting, setShowMascotGreeting] = useState(true);
  const [greetingIndex, setGreetingIndex] = useState(0);
  const [isGreetingTextVisible, setIsGreetingTextVisible] = useState(true);
  const [message, setMessage] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<AiSearchResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { t, i18n } = useTranslation();
  const MASCOT_MESSAGES = i18n.language?.startsWith('en') ? initialMascotMessagesEn : initialMascotMessagesVi;

  // --- Session persistence ---
  const saveChatState = useCallback(() => {
    try {
      const chatState = {
        submittedMessage,
        response,
        message,
      };
      sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chatState));
    } catch {
      // silently ignore if sessionStorage is full or unavailable
    }
  }, [submittedMessage, response, message]);

  // Restore chat from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.submittedMessage) setSubmittedMessage(parsed.submittedMessage);
        if (parsed.response) setResponse(parsed.response);
        if (parsed.message) setMessage(parsed.message);
        setIsOpen(true);
        setShowMascotGreeting(false);
        sessionStorage.removeItem(CHAT_STORAGE_KEY);
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // Navigate to property detail & save chat before leaving
  const handlePropertyNavigate = useCallback(
    (propertyId: string) => {
      saveChatState();
      navigate(`/property/${propertyId}`);
    },
    [saveChatState, navigate],
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [response, isLoading, errorMsg]);

  useEffect(() => {
    if (isOpen) {
      setShowMascotGreeting(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setShowMascotGreeting(true);
    }, 900);

    return () => window.clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen || !showMascotGreeting) {
      return;
    }

    const interval = window.setInterval(() => {
      setIsGreetingTextVisible(false);

      window.setTimeout(() => {
        setGreetingIndex((current) => (current + 1) % MASCOT_MESSAGES.length);
        setIsGreetingTextVisible(true);
      }, 320);
    }, 4200);

    return () => window.clearInterval(interval);
  }, [isOpen, showMascotGreeting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const trimmedMessage = message.trim();
    setSubmittedMessage(trimmedMessage);
    setIsLoading(true);
    setResponse(null);
    setErrorMsg(null);

    try {
      const result = await searchWithAI(trimmedMessage);
      setResponse(result);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const chipsVi = [
    "Căn hộ gần biển, full nội thất, có cửa sổ và ban công",
    "Căn hộ 2 phòng ngủ, rộng rãi, gần nhà hàng, quán cà phê"
  ];

  const chipsEn = [
    "Apartment near the beach, fully furnished, balcony",
    "Spacious 2-bedroom apartment near cafes"
  ];

  const chips = i18n.language?.startsWith('en') ? chipsEn : chipsVi;

  if (!isOpen) {
    return (
      <MascotLauncher
        visible={showMascotGreeting}
        message={MASCOT_MESSAGES[greetingIndex]}
        isMessageVisible={isGreetingTextVisible}
        onDismiss={() => setShowMascotGreeting(false)}
        onOpen={() => {
          setShowMascotGreeting(false);
          setIsOpen(true);
        }}
      />
    );
  }

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full justify-end bg-slate-950/20 backdrop-blur-[2px]">
      <div className="flex h-full w-full flex-col border-l border-teal-100 bg-[#f8fffe] shadow-2xl md:w-[440px]">
        <div className="border-b border-teal-100 bg-white/95 px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="overflow-hidden rounded-2xl border border-teal-100 bg-white shadow-sm">
                <img src="/mascot.png" alt="LeaseLink mascot" className="h-10 w-10 object-cover" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-800">LeaseLink AI</h3>
                <p className="text-xs text-slate-500">{t('ai.subtitle', 'Gợi ý bất động sản theo nhu cầu của bạn')}</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="space-y-5">
            <div className="rounded-3xl border border-teal-100 bg-gradient-to-br from-white to-teal-50 p-4 shadow-sm">
              <div className="mb-2 flex items-center gap-2 text-teal-700">
                <MessageCircle size={16} />
                <span className="text-sm font-semibold">{t('ai.describeStart', 'Bạn có thể mô tả nhu cầu tự nhiên')}</span>
              </div>
              <p className="text-sm leading-6 text-slate-600">
                {t('ai.describeDetails', 'Ví dụ như khu vực, mức giá, số phòng ngủ, có nuôi thú cưng hay những mong muốn như gần biển, có ban công hoặc đầy đủ nội thất.')}
              </p>
              <div className="mt-4 flex flex-col gap-2">
                {chips.map((chip, i) => (
                  <button
                    key={i}
                    onClick={() => setMessage(chip)}
                    className="rounded-2xl border border-teal-100 bg-white px-3 py-2 text-left text-sm text-slate-600 transition-all hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {submittedMessage && (
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-[24px] rounded-br-md bg-teal-600 px-4 py-3 text-sm leading-6 text-white shadow-sm">
                  {submittedMessage}
                </div>
              </div>
            )}

            {isLoading && (
              <div className="flex items-center gap-3 rounded-2xl border border-teal-100 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
                <Loader2 className="animate-spin text-teal-600" size={16} />
                <span>LeaseLink AI đang phân tích nhu cầu và tìm kết quả phù hợp...</span>
              </div>
            )}

            {errorMsg && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {errorMsg}
              </div>
            )}

            {response && !isLoading && (
              <div className="space-y-4">
                <div className="max-w-[92%] rounded-[24px] rounded-tl-md border border-teal-100 bg-white px-4 py-3 text-sm leading-6 text-slate-700 shadow-sm">
                  {response.replyMessage}
                </div>

                {response.properties && response.properties.length > 0 && (
                  <div className="flex flex-col gap-3 pb-4">
                    {response.properties.map((prop) => (
                      <AiPropertyCard key={prop.id} property={prop} onNavigate={handlePropertyNavigate} />
                    ))}
                  </div>
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="border-t border-teal-100 bg-white px-4 py-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isLoading}
              placeholder={t('ai.placeholder', 'Mô tả nhu cầu thuê nhà của bạn...')}
              className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-100 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !message.trim()}
              className="rounded-full bg-teal-600 px-4 py-3 text-white transition-colors hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}


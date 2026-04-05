import { Facebook, Instagram, Mail, MapPin, Phone, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-800 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h3 className="mb-4 text-lg text-white">{t('footer.aboutUs', 'Về chúng tôi')}</h3>
            <p className="text-sm leading-7">
              {t('footer.aboutDesc', 'LeaseLink hỗ trợ quản lý và tìm kiếm bất động sản cho thuê tại Đà Nẵng với trải nghiệm rõ ràng hơn cho cả Host và Admin.')}
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-lg text-white">{t('footer.links', 'Liên kết')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="transition-colors hover:text-teal-400">
                  {t('footer.home', 'Trang chủ')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="transition-colors hover:text-teal-400">
                  {t('footer.aboutUs', 'Về chúng tôi')}
                </Link>
              </li>
              <li>
                <Link to="/register" className="transition-colors hover:text-teal-400">
                  {t('footer.registerHost', 'Đăng ký Host')}
                </Link>
              </li>
              <li>
                <Link to="/login" className="transition-colors hover:text-teal-400">
                  {t('footer.login', 'Đăng nhập')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg text-white">{t('footer.contact', 'Liên hệ')}</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone size={16} />
                <span>0793778529</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} />
                <span>nguyenthaibao04052005@gmail.com</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={16} />
                <span>Da Nang, Vietnam</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg text-white">{t('footer.social', 'Mạng xã hội')}</h3>
            <div className="mb-6 flex gap-4">
              <a href="https://www.facebook.com/nguyen.thai.bao.263115" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-teal-400">
                <Facebook size={24} />
              </a>
            </div>

            {/* Custom Facebook Group Banner */}
            <a
              href="https://www.facebook.com/groups/2056096875177040"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block overflow-hidden rounded-lg border border-teal-800/30 bg-gradient-to-r from-[#1877F2]/10 to-[#1877F2]/5 p-4 transition-all hover:border-[#1877F2]/50 hover:bg-[#1877F2]/10"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1877F2] text-white shadow-sm">
                  <Facebook size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Cộng đồng LeaseLink</h4>
                  <p className="text-xs text-teal-200">Tham gia Group Facebook ngay</p>
                </div>
              </div>
            </a>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-700 pt-8 text-center text-sm">
          <p>&copy; 2026 LeaseLink. All rights reserved.</p>
        </div>
      </div>
    </footer >
  );
}

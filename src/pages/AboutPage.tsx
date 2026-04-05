import { Building2, HeartHandshake, MapPinned, ShieldCheck, Sparkles, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function AboutPage() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith("en");

  const stats = [
    { value: "24/7", label: isEn ? "Support for approval & management process" : "Hỗ trợ quy trình duyệt và quản lý" },
    { value: "1", label: isEn ? "Platform connecting admins, hosts & tenants" : "Nền tảng kết nối admin, host và người thuê" },
    { value: "Da Nang", label: isEn ? "Focused rental data by area" : "Tập trung dữ liệu thuê nhà theo khu vực" },
  ];

  const values = [
    {
      icon: ShieldCheck,
      title: isEn ? "Information Transparency" : "Minh bạch thông tin",
      description: isEn ? "Listings are managed with clear status so users know what is pending, approved, or needs updating." : "Tin đăng được quản lý theo trạng thái rõ ràng để người dùng biết đâu là nội dung đang chờ duyệt, đã duyệt hay cần cập nhật.",
    },
    {
      icon: HeartHandshake,
      title: isEn ? "User-friendly Experience" : "Trải nghiệm dễ dùng",
      description: isEn ? "From sign-up to listing management, all workflows are designed to be fast and reduce confusion." : "Từ đăng ký, đăng nhập đến quản lý tin đăng, mọi luồng đều được thiết kế để thao tác nhanh và giảm nhầm lẫn cho người dùng.",
    },
    {
      icon: Sparkles,
      title: isEn ? "Increase Operational Efficiency" : "Tăng hiệu quả vận hành",
      description: isEn ? "Admins can control hosts and all listings centrally, while hosts track their content in one place." : "Admin có thể kiểm soát host và toàn bộ tin đăng tập trung, trong khi host theo dõi nội dung của mình ở một nơi duy nhất.",
    },
  ];

  const highlights = [
    isEn ? "Manage hosts with clear status classification: pending, active, locked." : "Quản lý host với phân loại trạng thái rõ ràng: chờ duyệt, hoạt động, đã khóa.",
    isEn ? "Manage all listings to approve, track, and control system content quality." : "Quản lý toàn bộ tin đăng để duyệt, theo dõi và kiểm soát chất lượng nội dung hệ thống.",
    isEn ? "Optimized for the experience of searching and tracking rental real estate in Da Nang." : "Tối ưu cho trải nghiệm tìm kiếm và theo dõi bất động sản cho thuê tại Đà Nẵng.",
  ];

  return (
    <div className="flex-1 bg-[linear-gradient(180deg,_#f6fbff_0%,_#ffffff_42%,_#f7fafc_100%)]">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.14),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.10),_transparent_28%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/85 px-4 py-2 text-sm font-semibold text-teal-700 shadow-sm backdrop-blur">
              <Building2 className="h-4 w-4" />
              {isEn ? "About LeaseLink" : "Về LeaseLink"}
            </div>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">
              {isEn ? "A platform that supports transparent, intuitive, and practical rental management." : "Nền tảng hỗ trợ quản lý thuê nhà minh bạch, trực quan và phù hợp với thực tế vận hành."}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              {isEn ? "LeaseLink is built to connect hosts, administrators, and tenants in a clearer workflow: posting, awaiting approval, managing status, and tracking data on the same system." : "LeaseLink được xây dựng để kết nối chủ nhà, quản trị viên và người tìm thuê trong một luồng làm việc rõ ràng hơn: đăng tin, chờ duyệt, quản lý trạng thái và theo dõi dữ liệu trên cùng một hệ thống."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-300/50">
                <MapPinned className="h-4 w-4" />
                {isEn ? "Focused on the Da Nang market" : "Tập trung cho thị trường Đà Nẵng"}
              </div>
              <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700">
                <Users className="h-4 w-4 text-teal-600" />
                {isEn ? "Supports both Hosts and Admins" : "Hỗ trợ cả Host và Admin"}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
                <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
                <div className="mt-2 text-sm leading-6 text-slate-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {values.map(({ icon: Icon, title, description }) => (
            <article key={title} className="rounded-[28px] border border-slate-100 bg-white p-7 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-lg">
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
                <Icon className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-8 rounded-[32px] bg-slate-950 px-6 py-10 text-white shadow-[0_20px_80px_rgba(15,23,42,0.24)] lg:grid-cols-[1fr_1.05fr] lg:px-10">
          <div>
            <h2 className="text-3xl font-bold">{isEn ? "What does LeaseLink aim for?" : "LeaseLink hướng đến điều gì?"}</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
              {isEn ? "We want to make searching and managing rental properties less fragmented. Instead of each role using a separate process, LeaseLink brings all important operations into a seamless experience." : "Chúng tôi muốn việc tìm kiếm và quản lý bất động sản cho thuê bớt rời rạc hơn. Thay vì mỗi vai trò dùng một quy trình riêng, LeaseLink gom toàn bộ thao tác quan trọng về một trải nghiệm liền mạch."}
            </p>
          </div>
          <div className="grid gap-4">
            {highlights.map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm leading-7 text-slate-100">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

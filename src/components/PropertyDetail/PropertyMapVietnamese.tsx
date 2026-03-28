import { MapPin } from 'lucide-react';

interface PropertyMapVietnameseProps {
  address: string;
}

export function PropertyMapVietnamese({ address }: PropertyMapVietnameseProps) {
  return (
    <div className="relative w-full h-[350px] rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
      {/* Embedded Google Maps style background */}
      <div className="absolute inset-0">
        <div className="w-full h-full bg-gradient-to-br from-teal-50 to-blue-50 relative">
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid-vn" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#0d9488" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-vn)" />
            </svg>
          </div>

          {/* Roads */}
          <div className="absolute inset-0">
            <div className="absolute top-1/3 left-0 right-0 h-[3px] bg-white/60"></div>
            <div className="absolute top-2/3 left-0 right-0 h-[2px] bg-white/40"></div>
            <div className="absolute top-0 bottom-0 left-1/3 w-[3px] bg-white/60"></div>
            <div className="absolute top-0 bottom-0 left-2/3 w-[2px] bg-white/40"></div>
          </div>

          {/* Location marker */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full">
            <div className="relative">
              <div className="absolute -inset-4 bg-primary/20 rounded-full blur-lg"></div>
              <MapPin className="w-10 h-10 text-primary fill-primary relative z-10 drop-shadow-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Address overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 px-4 py-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-lg shrink-0">
            <MapPin className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{address}</p>
            <button className="text-xs text-primary font-semibold hover:underline mt-1 flex items-center gap-1 transition-all">
              Mở trong Google Maps <span className="text-[10px]">↗</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

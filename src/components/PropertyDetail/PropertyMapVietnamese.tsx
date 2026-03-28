import { MapPin } from 'lucide-react';

interface PropertyMapVietnameseProps {
  address: string;
}

export function PropertyMapVietnamese({ address }: PropertyMapVietnameseProps) {
  // Use the encoded address for the Google Maps query
  const mapQuery = encodeURIComponent(address);
  const mapSrc = `https://maps.google.com/maps?q=${mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="relative w-full h-[350px] rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm transition-all hover:shadow-md">
      {/* Real Google Maps Iframe */}
      <iframe
        title="Google Map"
        width="100%"
        height="100%"
        frameBorder="0"
        scrolling="no"
        marginHeight={0}
        marginWidth={0}
        src={mapSrc}
        className="grayscale-[20%] hover:grayscale-0 transition-all duration-700"
      ></iframe>

      {/* Address overlay for quick context */}
      <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md border border-white/50 px-4 py-3 rounded-xl shadow-xl z-10 transition-transform transform hover:-translate-y-1">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-primary/20 rounded-lg shrink-0">
            <MapPin className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate leading-tight">{address}</p>
            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-primary font-black hover:underline mt-1.5 flex items-center gap-1 transition-all uppercase tracking-widest"
            >
              Mở trong Google Maps <span className="text-xs">↗</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

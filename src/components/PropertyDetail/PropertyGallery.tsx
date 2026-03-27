import { useState } from 'react';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface PropertyGalleryProps {
  images: string[];
}

export function PropertyGallery({ images }: PropertyGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState(false);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (!images || images.length === 0) {
    return <div className="h-[500px] bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">Không có hình ảnh</div>;
  }

  return (
    <div className="relative">
      {/* Main Image */}
      <div className="relative h-[500px] rounded-lg overflow-hidden bg-gray-100 border border-gray-100">
        <ImageWithFallback
          src={images[currentIndex]}
          alt={`Property ${currentIndex + 1}`}
          className="w-full h-full object-cover"
        />
        
        {/* Navigation Arrows */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors z-10"
        >
          <ChevronLeft className="w-6 h-6 text-gray-800" />
        </button>
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors z-10"
        >
          <ChevronRight className="w-6 h-6 text-gray-800" />
        </button>

        {/* Like Button */}
        <button
          onClick={() => setLiked(!liked)}
          className="absolute top-4 right-4 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors z-10"
        >
          <Heart
            className={`w-5 h-5 ${liked ? 'fill-rose-500 text-rose-500' : 'text-gray-600'}`}
          />
        </button>

        {/* Image Counter */}
        <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/60 text-white text-sm rounded-full z-10">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnail Grid */}
      <div className="grid grid-cols-6 gap-2 mt-3">
        {images.slice(0, 6).map((image, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`relative h-20 rounded-lg overflow-hidden border-2 transition-all ${
              currentIndex === index ? 'border-primary ring-1 ring-primary' : 'border-transparent'
            }`}
          >
            <ImageWithFallback
              src={image}
              alt={`Thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
            />
            {index === 5 && images.length > 6 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-sm font-medium">
                +{images.length - 6}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

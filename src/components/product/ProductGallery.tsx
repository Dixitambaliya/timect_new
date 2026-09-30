'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

interface ProductGalleryProps {
  images: string[];
}

export default function ProductGallery({ images }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(images[0] || '');

  // Keep selection in sync when switching product variants
  useEffect(() => {
    setSelectedImage(images[0] || '');
  }, [images]);

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4 h-full max-w-[560px] lg:max-w-none mx-auto lg:mx-0">
      {/* Thumbnails */}
      <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto no-scrollbar lg:w-20 shrink-0 py-1 lg:py-0">
        {images.map((img, index) => (
          <button
            key={`${img}-${index}`}
            onClick={() => setSelectedImage(img)}
            className={`relative w-16 h-16 lg:w-20 lg:h-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${
              selectedImage === img
                ? 'border-black shadow-sm'
                : 'border-gray-200 hover:border-gray-400'
            }`}
          >
            <Image
              src={img}
              alt={`Thumbnail ${index + 1}`}
              fill
              sizes="80px"
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {/* Main Image — fits cleanly into the container box */}
      <div className="relative w-full aspect-square max-h-[600px] bg-slate-50 rounded-2xl overflow-hidden flex-grow shadow-sm">
        {selectedImage && (
          <Image
            src={selectedImage}
            alt="Product Main Image"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        )}
      </div>
    </div>
  );
}

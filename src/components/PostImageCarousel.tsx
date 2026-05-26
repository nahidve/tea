"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface PostImageCarouselProps {
  images: {
    id: string;
    url: string;
  }[];
}

function PostImageCarousel({ images }: PostImageCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    onSelect();

    emblaApi.on("select", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;

      if (e.key === "Escape") {
        setLightboxOpen(false);
      }

      if (e.key === "ArrowRight") {
        setSelectedIndex((prev) =>
          prev === images.length - 1 ? prev : prev + 1,
        );
      }

      if (e.key === "ArrowLeft") {
        setSelectedIndex((prev) => (prev === 0 ? prev : prev - 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxOpen, images.length]);

  if (images.length === 1) {
    return (
      <>
        <div className="overflow-hidden rounded-md border border-border/30 bg-muted/20">
          <img
            src={images[0].url}
            alt="Post image"
            className="w-full max-h-[520px] object-cover cursor-zoom-in"
            onClick={() => setLightboxOpen(true)}
          />
        </div>

        {lightboxOpen && (
          <Lightbox
            images={images}
            selectedIndex={selectedIndex}
            setSelectedIndex={setSelectedIndex}
            onClose={() => setLightboxOpen(false)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-md border border-border/30 bg-muted/10">
        <div ref={emblaRef} className="overflow-hidden touch-pan-y">
          <div className="flex">
            {images.map((image, index) => (
              <div
                key={image.id}
                className="min-w-0 shrink-0 grow-0 basis-full"
              >
                <img
                  src={image.url}
                  alt="Post image"
                  className="w-full max-h-[520px] object-cover select-none cursor-zoom-in"
                  draggable={false}
                  onClick={() => {
                    setSelectedIndex(index);
                    setLightboxOpen(true);
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-1.5 py-3">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => emblaApi?.scrollTo(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                selectedIndex === index
                  ? "w-5 bg-foreground"
                  : "w-1.5 bg-muted-foreground/40 hover:bg-muted-foreground/70"
              }`}
            />
          ))}
        </div>
      </div>

      {lightboxOpen && (
        <Lightbox
          images={images}
          selectedIndex={selectedIndex}
          setSelectedIndex={setSelectedIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}

interface LightboxProps {
  images: {
    id: string;
    url: string;
  }[];

  selectedIndex: number;

  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;

  onClose: () => void;
}

function Lightbox({
  images,
  selectedIndex,
  setSelectedIndex,
  onClose,
}: LightboxProps) {
  return (
    <div className="fixed inset-0 z-[999] bg-black/90 backdrop-blur-xl flex items-center justify-center">
      <button
        onClick={onClose}
        className="absolute top-5 right-5 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
      >
        <X className="size-5 text-white" />
      </button>

      {selectedIndex > 0 && (
        <button
          onClick={() => setSelectedIndex((prev) => prev - 1)}
          className="absolute left-5 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <ChevronLeft className="size-6 text-white" />
        </button>
      )}

      {selectedIndex < images.length - 1 && (
        <button
          onClick={() => setSelectedIndex((prev) => prev + 1)}
          className="absolute right-5 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <ChevronRight className="size-6 text-white" />
        </button>
      )}

      <img
        src={images[selectedIndex].url}
        alt="Fullscreen"
        className="max-h-[92vh] max-w-[92vw] object-contain"
      />
    </div>
  );
}

export default PostImageCarousel;

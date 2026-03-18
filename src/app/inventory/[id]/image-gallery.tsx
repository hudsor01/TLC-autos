"use client";

import { useState } from "react";
import Image from "next/image";
import { Car, ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ImageGalleryProps {
  images: string[];
  alt: string;
}

export function ImageGallery({ images, alt }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (images.length === 0) {
    return (
      <div className="relative flex aspect-video flex-col items-center justify-center rounded-lg bg-muted">
        <Car className="h-24 w-24 text-muted-foreground/20" />
        <p className="mt-2 text-muted-foreground">No photos available</p>
      </div>
    );
  }

  function goToPrev() {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }

  function goToNext() {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }

  return (
    <>
      {/* Hero image */}
      <div
        className="relative aspect-video cursor-pointer overflow-hidden rounded-lg bg-muted"
        onClick={() => setLightboxOpen(true)}
      >
        <Image
          src={images[selectedIndex]}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 66vw"
        />
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-md bg-black/50 px-2.5 py-1.5 text-xs text-white">
          <Expand className="h-3.5 w-3.5" />
          Click to enlarge
        </div>
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {images.map((img, i) => (
            <div
              key={i}
              className={cn(
                "relative cursor-pointer overflow-hidden rounded-md border-2 aspect-video",
                i === selectedIndex ? "border-primary" : "border-transparent"
              )}
              onClick={() => setSelectedIndex(i)}
            >
              <Image
                src={img}
                alt=""
                fill
                className="object-cover"
                sizes="20vw"
              />
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-5xl w-[95vw] p-0 border-none bg-transparent shadow-none [&>button]:text-white [&>button]:top-2 [&>button]:right-2">
          <DialogTitle className="sr-only">
            Vehicle image {selectedIndex + 1} of {images.length}
          </DialogTitle>

          <div className="relative aspect-video">
            <Image
              src={images[selectedIndex]}
              alt={alt}
              fill
              className="object-contain"
              sizes="95vw"
            />

            {/* Prev/Next buttons */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/70"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrev();
                  }}
                >
                  <ChevronLeft className="h-6 w-6" />
                  <span className="sr-only">Previous image</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/70"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNext();
                  }}
                >
                  <ChevronRight className="h-6 w-6" />
                  <span className="sr-only">Next image</span>
                </Button>
              </>
            )}

            {/* Image counter */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-md bg-black/50 px-3 py-1 text-sm text-white">
              {selectedIndex + 1} / {images.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

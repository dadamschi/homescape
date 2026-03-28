"use client";

import { useState } from "react";
import { urlFor } from "@/lib/sanity";
import type { SanityImage } from "@/lib/types";

interface ImageCarouselProps {
  images: SanityImage[];
  fallbackAlt?: string;
}

function getImageUrl(img: SanityImage, width = 800): string | null {
  if (!img?.asset) return null;
  return urlFor(img).width(width).quality(80).auto("format").url();
}

function getImageAlt(img: SanityImage, fallback = ""): string {
  return img?.alt || fallback;
}

export default function ImageCarousel({ images, fallbackAlt = "" }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const validImages = images.filter((img) => img?.asset);

  if (validImages.length === 0) return null;

  if (validImages.length === 1) {
    const url = getImageUrl(validImages[0]);
    const photoCredit = validImages[0].photoCredit;
    if (!url) return null;
    return (
      <div style={{ position: "relative" }}>
        <img
          src={url}
          alt={getImageAlt(validImages[0], fallbackAlt)}
          loading="lazy"
        />
        {photoCredit && <PhotoCreditTag credit={photoCredit} />}
      </div>
    );
  }

  const prev = () => setCurrentIndex((i) => (i === 0 ? validImages.length - 1 : i - 1));
  const next = () => setCurrentIndex((i) => (i === validImages.length - 1 ? 0 : i + 1));
  const current = validImages[currentIndex];
  const currentUrl = getImageUrl(current);
  const photoCredit = current.photoCredit;

  if (!currentUrl) return null;

  return (
    <div className="carousel">
      <img
        src={currentUrl}
        alt={getImageAlt(current, fallbackAlt)}
        loading="lazy"
      />
      {photoCredit && <PhotoCreditTag credit={photoCredit} />}
      <button className="carousel-btn carousel-btn-prev" onClick={prev}>
        ‹
      </button>
      <button className="carousel-btn carousel-btn-next" onClick={next}>
        ›
      </button>
      <div className="carousel-dots">
        {validImages.map((_, i) => (
          <span
            key={i}
            className={`carousel-dot ${i === currentIndex ? "active" : ""}`}
            onClick={() => setCurrentIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}

function PhotoCreditTag({ credit }: { credit: string }) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "40px",
        right: "8px",
        background: "rgba(0, 0, 0, 0.7)",
        color: "#fff",
        fontSize: "0.65rem",
        padding: "4px 8px",
        borderRadius: "4px",
        letterSpacing: "0.02em",
        pointerEvents: "none",
      }}
    >
      {credit}
    </div>
  );
}

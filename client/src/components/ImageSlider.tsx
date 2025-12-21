
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import slide1 from "@assets/v1_1766127165051.png";
import slide2 from "@assets/v2_1766127165052.png";
import slide3 from "@assets/v3_1766127165052.png";
import slide4 from "@assets/v4_1766127165052.png";
import slide5 from "@assets/v5_1766127182488.png";

const slides = [slide1, slide2, slide3, slide4, slide5];

export default function ImageSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="relative w-full bg-black pt-8">
      {/* Full width container with no padding on mobile */}
      <div className="relative w-full overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div key={index} className="w-full flex-shrink-0">
              <img
                src={slide}
                alt={`Slide ${index + 1}`}
                className="w-full h-auto object-cover"
                data-testid={`slide-image-${index}`}
              />
            </div>
          ))}
        </div>

        <button
          onClick={goToPrevious}
          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-3 md:p-4 rounded-full transition-all duration-300 z-10"
          data-testid="button-previous-slide"
        >
          <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
        </button>

        <button
          onClick={goToNext}
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-3 md:p-4 rounded-full transition-all duration-300 z-10"
          data-testid="button-next-slide"
        >
          <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
        </button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                index === currentIndex ? "bg-white" : "bg-white/50"
              }`}
              data-testid={`button-slide-indicator-${index}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

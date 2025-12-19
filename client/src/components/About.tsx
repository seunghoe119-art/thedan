import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import slide1 from "@assets/v1_1766127165051.png";
import slide2 from "@assets/v2_1766127165052.png";
import slide3 from "@assets/v3_1766127165052.png";
import slide4 from "@assets/v4_1766127165052.png";
import slide5 from "@assets/v5_1766127182488.png";
import mainFee from "@assets/main_fee_1766154957407.png";
import ppt1 from "@assets/ppt1_1766155030059.jpg";
import ppt2 from "@assets/ppt2_1766155030060.jpg";
import ppt3 from "@assets/ppt3_1766155030060.jpg";
import ppt4 from "@assets/ppt4_1766155030060.jpg";

const slides = [slide1, slide2, slide3, slide4, slide5];
const pptSlides = [mainFee, ppt1, ppt2, ppt3, ppt4];

export default function About() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pptIndex, setPptIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const goToPptPrevious = () => {
    setPptIndex((prev) => (prev === 0 ? pptSlides.length - 1 : prev - 1));
  };

  const goToPptNext = () => {
    setPptIndex((prev) => (prev === pptSlides.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="bg-white relative z-10">
      <div className="max-w-7xl mx-auto pb-0">
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
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-3 md:p-4 rounded-full transition-all duration-300"
            data-testid="button-previous-slide"
          >
            <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-3 md:p-4 rounded-full transition-all duration-300"
            data-testid="button-next-slide"
          >
            <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
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

        <div className="px-4 lg:px-8">
          <div className="relative w-full overflow-hidden rounded-2xl shadow-2xl">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${pptIndex * 100}%)` }}
            >
              {pptSlides.map((slide, index) => (
                <div key={index} className="w-full flex-shrink-0">
                  <img
                    src={slide}
                    alt={`PPT Slide ${index + 1}`}
                    className="w-full h-auto object-cover rounded-2xl"
                    data-testid={`ppt-slide-image-${index}`}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={goToPptPrevious}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-3 md:p-4 rounded-full transition-all duration-300"
              data-testid="button-ppt-previous-slide"
            >
              <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
            </button>

            <button
              onClick={goToPptNext}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-3 md:p-4 rounded-full transition-all duration-300"
              data-testid="button-ppt-next-slide"
            >
              <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {pptSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setPptIndex(index)}
                  className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                    index === pptIndex ? "bg-white" : "bg-white/50"
                  }`}
                  data-testid={`button-ppt-slide-indicator-${index}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

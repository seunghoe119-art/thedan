import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import slide1 from "@assets/a2-1_1766125739742.jpg";
import slide2 from "@assets/a2-2_1766125739742.jpg";
import slide3 from "@assets/a2-3_1766125739743.jpg";
import slide4 from "@assets/a2-4_1766125739743.jpg";
import slide5 from "@assets/a2-5_1766125739743.jpg";

const slides = [slide1, slide2, slide3, slide4, slide5];

export default function About() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="py-16 md:py-32 bg-white relative z-10">
      <div className="max-w-7xl mx-auto px-0 md:px-4 lg:px-8">
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
                  className="w-full h-auto object-contain md:rounded-2xl"
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

        <div className="grid lg:grid-cols-2 gap-16 items-center mt-16 px-4 md:px-0">
          <div>
            <img 
              src="/basketball court.jpeg" 
              alt="Basketball team1" 
              className="rounded-2xl shadow-2xl"
            />
          </div>

          <div className="space-y-8 animate-slide-up">
            <h2 className="text-5xl md:text-6xl font-black text-black mb-8">
              Play Hard.<br/>
              <span className="text-gray-400">Grow Together.</span>
            </h2>
            <p className="text-xl text-gray-600 font-light leading-relaxed mb-8">
              정규코트 5대5 농구를 통해 포지션별<br /> 역할, 공간 활용, 팀 전술을 익혀<br /> 모두가 함께 성장합니다.
            </p>
            <p className="text-xl text-gray-700 leading-relaxed">
              꾸준한 참여로 전술 이해도와 팀워크가<br /> 향상되어 팀농구를 배울 수 있습니다.
            </p>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center mt-1">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">체계적인 5대5 훈련</h3>
                  <p className="text-gray-600">포지션별 역할, 공간 활용, 전술 세트를 통해 팀 조직력을 향상시킵니다.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center mt-1">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">팀별 친선경기 & 전국체전</h3>
                  <p className="text-gray-600">교류전에서 팀전술을 도전하고<br /> 발전할 기회를 제공합니다.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center mt-1">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">누구나 즐기는 농구</h3>
                  <p className="text-gray-600">5:5 농구 경험이 없어도 환영!<br /> 기초부터 차근차근 배워가는 <br />환경을 제공합니다.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

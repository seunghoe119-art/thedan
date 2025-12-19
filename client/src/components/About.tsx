import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import slide1 from "@assets/v1_1766127165051.png";
import slide2 from "@assets/v2_1766127165052.png";
import slide3 from "@assets/v3_1766127165052.png";
import slide4 from "@assets/v4_1766127165052.png";
import slide5 from "@assets/v5_1766127182488.png";

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
    <section className="bg-white relative z-10">
      <div className="max-w-7xl mx-auto">
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

        <div className="grid lg:grid-cols-2 gap-16 items-center py-16 md:py-32 px-4 lg:px-8">
          <div>
            <img
              src="/basketball court.jpeg"
              alt="Basketball team1"
              className="rounded-2xl shadow-2xl"
            />
          </div>

          <div className="space-y-8 animate-slide-up">
            <h2 className="text-5xl md:text-6xl font-black text-black mb-8">
              Play Hard.
              <br />
              <span className="text-gray-400">Grow Together.</span>
            </h2>
            <p className="text-xl text-gray-600 font-light leading-relaxed mb-8"></p>
            <p className="text-xl text-gray-700 leading-relaxed">
              스트레스 없는 ‘클린 농구’ 환경
              <br /> 게스트 아닌 팀원으로 플레이합니다.
            </p>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center mt-1">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">
                    ① 매주 ‘뽑기’ 없는 확정 농구
                  </h3>
                  <p className="text-gray-600">
                    매주 신청 경쟁, 대기, 탈락 스트레스
                    <br />내 자리는 신청하고플때 확보
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center mt-1">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">
                    ② 농구 퀄리티가 매주 유지됩니다
                  </h3>
                  <p className="text-gray-600">
                    멤버가 고정되니
                    <br /> 패스, 수비 로테이션이 맞아갑니다.
                    <br />운 좋은 날만 재밌는 농구가 아닙니다.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center mt-1">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">
                    ③ 돈은 덜 쓰고, 만족도는 더 큽니다
                  </h3>
                  <p className="text-gray-600">
                    게스트 농구 대비 참여 비용 절감
                    <br /> 매주 참여 기준 → 체감 비용 확실히 낮음
                    <br />
                    “돈 냈는데 재미없다” 확률 최소화
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

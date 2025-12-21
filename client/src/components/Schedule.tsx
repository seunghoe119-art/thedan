import { Users, MapPin, Clock } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import mainFee from "@assets/main_fee_1766154957407.png";
import ppt1 from "/ppt1.png";
import ppt2 from "/ppt2.png";
import ppt3 from "@assets/ppt3_1766155030060.jpg";
import ppt4 from "@assets/ppt4_1766155030060.jpg";
import slide1 from "@assets/v1_1766127165051.png";
import slide2 from "@assets/v2_1766127165052.png";
import slide3 from "@assets/v3_1766127165052.png";
import slide4 from "@assets/v4_1766127165052.png";
import slide5 from "@assets/v5_1766127182488.png";

const pptSlides = [mainFee, ppt1, ppt2, ppt3, ppt4];
const slides = [slide1, slide2, slide3, slide4, slide5];

const scheduleItems = [
  {
    title: "매주 3시간 금요일 대관",
    time: "21:00 ~ 24:00PM",
    location: "정규 대관 체육관",
  },
  {
    title: "정수기, 연습용 농구공들, (회원)유니폼색 지정",
    time: "",
    location: "농구화 옷만 가방에 넣어서 오는 미니멀 간편함",
  },
  {
    title: "냉난방기*3, 유리 대기실, 샤워실, 넉넉한 주차장",
    time: " ",
    location: "최상의 코트시설, 동영상촬영도 진행",
  },
];

export default function Schedule() {
  const [pptIndex, setPptIndex] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPreviousSlide = () => {
    setPptIndex((prevIndex) => (prevIndex === 0 ? pptSlides.length - 1 : prevIndex - 1));
  };

  const goToNextSlide = () => {
    setPptIndex((prevIndex) => (prevIndex === pptSlides.length - 1 ? 0 : prevIndex + 1));
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="py-32 bg-black text-white relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Team Banner - Centered */}
        <div className="flex justify-center mb-16">
          <img 
            src="/the_dan_banner.png" 
            alt="THE DAN Basketball Team" 
            className="w-full max-w-md rounded-lg shadow-2xl"
          />
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-center space-x-4 mb-8">
          <Link href="/">
            <button className="px-6 py-3 rounded-full text-white font-semibold transition-all duration-300 ease-in-out shadow-lg 
                             bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:shadow-xl">
              Home
            </button>
          </Link>
          <Link href="/rules">
            <button className="px-6 py-3 rounded-full text-white font-semibold transition-all duration-300 ease-in-out shadow-lg
                             bg-gradient-to-r from-green-400 to-teal-500 hover:from-green-500 hover:to-teal-600 hover:shadow-xl">
              회 5,000원
            </button>
          </Link>
        </div>

        {/* Gym Info and Images Grid */}
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <h2 className="text-5xl md:text-6xl font-black mb-8">
              GAME &<br/>
              <span className="text-accent">HOME GYM</span>
            </h2>
            <p className="text-xl text-gray-400 font-light mb-12">
              삼성리틀썬더스농구교실김포점<br/>경기 김포시 감정로 86 2층<br/>경기 김포시 감정동 626-10
            </p>

            {/* Court Images */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
              <div className="relative overflow-hidden rounded-xl shadow-2xl">
                <img 
                  src="/gym1.jpeg" 
                  alt="Basketball Court 1" 
                  className="w-full h-48 sm:h-64 object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="relative overflow-hidden rounded-xl shadow-2xl">
                <img 
                  src="/gym2.jpeg" 
                  alt="Basketball Court 2" 
                  className="w-full h-48 sm:h-64 object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {scheduleItems.map((item, index) => (
              <div key={index} className="border-l-4 border-accent pl-6 py-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{item.title}</h3>
                  <span className="text-accent font-medium">{item.time}</span>
                </div>
                <p className="text-gray-400">{item.location}</p>
              </div>
            ))}

            <div className="bg-accent/10 border border-accent rounded-xl p-6 mt-8">
              <h4 className="font-bold text-lg mb-2">최상급 코트 시설과 부대시설</h4>
              <p className="text-gray-300">악취 벌레많은 창고형 아닌 최신식 건물 실내 건물</p>
            </div>

            {/* About Us Slide Section */}
            <div className="relative w-full overflow-hidden mt-12 rounded-lg">
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

            {/* Slideshow Section */}
            <div className="relative mt-12">
              <img src={pptSlides[pptIndex]} alt={`Slide ${pptIndex + 1}`} className="w-full rounded-lg shadow-xl"/>
              <div className="absolute inset-0 flex items-center justify-between px-4">
                <button onClick={goToPreviousSlide} className="p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-75 transition">
                  <ChevronLeft size={32} />
                </button>
                <button onClick={goToNextSlide} className="p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-75 transition">
                  <ChevronRight size={32} />
                </button>
              </div>
              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-3">
                {pptSlides.map((_, index) => (
                  <span
                    key={index}
                    className={`block w-3 h-3 rounded-full cursor-pointer transition ${
                      index === pptIndex ? "bg-accent" : "bg-white bg-opacity-50"
                    }`}
                    onClick={() => setPptIndex(index)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
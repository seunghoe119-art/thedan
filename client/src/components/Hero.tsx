import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { Link } from "wouter";

export default function Hero() {

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden z-10">
      {/* Basketball court background */}
      <div 
        className="absolute inset-0 hero-bg"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&h=1200')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      />
      
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-fade-in">
        <h1 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tight">
          BEYOND<br/>
          <span className="text-accent">THE COURT</span>
        </h1>
        <p className="text-xl md:text-2xl text-white/90 font-light mb-4 max-w-2xl mx-auto">
          Basketball Team, <span 
            className="font-black text-3xl md:text-4xl"
            style={{ 
              background: 'linear-gradient(135deg, #ff0000, #cc0000, #990000)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            THE DAN
          </span>
        </p>
        
        <p className="text-lg md:text-xl text-white/80 font-light mb-12">
          5천원 정도로 매주 선택형 출석 가능합니다
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg"
            className="bg-white text-black hover:bg-gray-100 rounded-full px-8 py-4 font-semibold text-lg transform hover:scale-105 transition-all"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Home
          </Button>
          <Link href="/about">
            <Button 
              variant="outline"
              size="lg"
              className="border-2 border-black text-black bg-white hover:bg-gray-100 rounded-full px-8 py-4 font-semibold text-lg transform hover:scale-105 transition-all"
            >
              Learn More
            </Button>
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <ChevronDown className="w-6 h-6 text-white" />
      </div>
    </section>
  );
}

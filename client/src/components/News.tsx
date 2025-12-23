import React from "react";
import { ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

const newsItems = [
  {
    date: "2025년 3월 10일",
    title: "새로운 훈련 시설",
    excerpt: "모든 팀원과 커뮤니티를 위한 새로운 홈 체육관으로 선정하였습니다.",
  },
  {
    date: "2026년 1월 1일",
    title: "THE DAN팀 창단",
    excerpt: "THE DAN 팀으로 정규회원 모집을 시작합니다.",
  },
  {
    date: "2027년 0월",
    title: "추가 소식 업데이트 대기중",
    excerpt: "마커스 존슨이 팀 주장이 되기까지의 여정을 소개합니다.",
  },
];

export default function News() {
  const [location, setLocation] = useLocation();
  const [clickCounts, setClickCounts] = React.useState<Record<number, number>>({});
  
  const handleSecretAccess = (index: number) => {
    // Index 0 (first button): 6 clicks to access admin new post page
    // Index 1 (second button): 6 clicks to access finance page
    // Other buttons: 6 clicks to access guest page
    const currentCount = (clickCounts[index] || 0) + 1;
    setClickCounts({ ...clickCounts, [index]: currentCount });
    
    if (currentCount >= 6) {
      if (index === 0) {
        setLocation('/admin/new-post');
      } else if (index === 1) {
        setLocation('/finance');
      } else {
        setLocation('/guest');
      }
      setClickCounts({ ...clickCounts, [index]: 0 }); // Reset counter
    }
  };
  
  return (
    <section className="py-32 bg-black text-white relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-black mb-6">Latest News</h2>
          <p className="text-xl text-gray-400 font-light">
            THE DAN 소식을 확인하세요.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {newsItems.map((item, index) => (
            <article key={index} className="bg-gray-900 rounded-2xl overflow-hidden hover:bg-gray-800 transition-colors">
              <div className="p-8">
                <div className="text-accent text-sm font-medium mb-3">{item.date}</div>
                <h3 className="font-bold text-xl mb-4">{item.title}</h3>
                <p className="text-gray-400 mb-6">{item.excerpt}</p>
                <button 
                  onClick={() => handleSecretAccess(index)}
                  className="text-accent hover:text-red-400 transition-colors font-medium inline-flex items-center"
                >
                  업데이트중
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

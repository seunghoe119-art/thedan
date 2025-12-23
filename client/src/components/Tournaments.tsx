export default function Tournaments() {
  return (
    <section className="py-32 bg-white relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-black mb-6">
            우측 상단 메뉴<br />코트 및 기타 정보<br />확인
          </h2>
          <p className="text-xl text-gray-600 font-light max-w-4xl mx-auto">
            모바일 환경에 최적화되어 있습니다.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="space-y-8">
            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="font-bold text-2xl mb-4">우측 상단 메뉴 안내</h3>
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0"></div>
                  <span>홈코트 확인 / 시설</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0"></div>
                  <span className="text-sm md:text-base">회당 5천원,<br className="md:hidden" /> 정규회원 및 운영안내</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0"></div>
                  <span>회원 모집 접수 안내</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0"></div>
                  <span>THE DAN 동호회 SNS, 갤러리 <span className="font-semibold">예정</span></span>
                </li>
              </ul>
            </div>

            <div className="border-2 border-gray-200 rounded-2xl p-8">
              <h3 className="font-bold text-xl mb-4">참여 인원 관리</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">1</div>
                  <span className="text-gray-700 pt-1 text-sm md:text-base">목요일 18시 전까지, 참가 투표 진행 진행</span>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">2</div>
                  <span className="text-gray-700 pt-1 text-sm md:text-base">인원 부족 시<br className="md:hidden" /> 게스트 모집</span>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">3</div>
                  <span className="text-gray-500 pt-1">경기진행 보조시 회비 면제 <span className="font-semibold">(사전연락)</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
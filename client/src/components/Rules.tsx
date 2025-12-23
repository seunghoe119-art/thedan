export default function Rules() {
  return (
    <section className="py-32 bg-gray-50 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 relative pb-6">
          <h2 className="text-5xl md:text-6xl font-black text-black mb-6">Club Guidelines</h2>
          <p className="absolute bottom-0 right-0 text-xs text-gray-400">
            기준 25.12.17
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="font-bold text-2xl mb-6">회원제</h3>
            <div className="space-y-4">
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-bold">정규 회원 - 가입비 없음</h4>
                <p className="text-gray-600">₩5,000 / 참여 횟수</p>
                <p className="text-xs text-gray-500 mt-1">*정규회원이 많아 대관비 부족시 ₩1,000원 익월 청구</p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-bold">매월 회 선택가능</h4>
                <p className="text-gray-600">₩10,000 / 2회 참여, 월 <br />₩20,000 / 4회 참여, 월</p>
              </div>
              <div className="border-l-4 border-accent pl-4">
                <h4 className="font-bold">선택횟수보다 더 많이 참여한 경우, 게스트비로 청구</h4>
                <p className="text-gray-600">게스트비는 정규회원 참가 인원에 따라 변동 (₩8,000~10,000)</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="font-bold text-2xl mb-6">팀 공지사항</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                <span>욕설 및 비난 금지, 즉시 추방 및 게스트 참여 금지</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                <span>개인 플레이 자제. 게임의 상황과 상관없는 받자마자 슛, 수비자5명에 단독드리블등</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                <span>패스 플레이, 협동심을 중시합니다.</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                <span>언행에 주의하고 텃세 없이 즐거운 경기합시다.</span>
              </li>
            </ul>
            
            <div className="mt-6">
              <p className="text-xs text-amber-600 italic font-medium bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                *게스트분들도 언제든지 정규 팀원이 될 수 있습니다.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="font-bold text-2xl mb-6">재정 사용처</h3>
            <p className="text-gray-700 mb-4">
              체육관 대관료<br />시합용 공, 예비 팀조끼 등 구입<br />시합용 공과 운영 용품 택배비<br />경기운영자 특혜 및 게스트 미달 예비금액<br />서버비용 및 예비비<br />
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="font-bold text-2xl mb-6">3파전 진행</h3>
            <p className="text-gray-700 mb-4">
              키/나이/포지션을 바탕으로 AI를 통해 결정하고 일행을 고려하여 조정합니다.
            </p>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="flex flex-col items-center">
                <div className="w-16 h-20 bg-black rounded-lg mb-2 shadow-md"></div>
                <span className="text-xs font-semibold text-gray-700">블랙팀</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-20 bg-white border-2 border-gray-300 rounded-lg mb-2 shadow-md"></div>
                <span className="text-xs font-semibold text-gray-700">화이트팀</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-20 bg-red-600 rounded-lg mb-2 shadow-md"></div>
                <span className="text-xs font-semibold text-gray-700">레드팀</span>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• 블랙팀 창단 멤버 + 정규멤버</p>
              <p>• 화이트팀 정규멤버</p>
              <p>• 레드팀 정규멤버 + 게스트위주</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="font-bold text-2xl mb-6">큰 운영적인 운영비</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-red-600">3시간 체육관 대여료</span>
                <span className="font-semibold text-lg text-red-600">-₩110,000 / 주</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-blue-600">회원과 게스트비</span>
                <span className="font-semibold text-lg text-blue-600">+₩110,000 / 주</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-blue-600">운영보조 등 여분비</span>
                <span className="font-semibold text-lg text-blue-600">+₩10,000 / 주</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="font-bold text-2xl mb-6">경기 운영자 특혜</h3>
            <div className="space-y-4 text-gray-700">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm leading-relaxed">운영자는 경기 준비와 책임을 맡음</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm leading-relaxed">운영 없이는 경기‧게스트비 수금 불가<br /> → 필수적 역할</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm leading-relaxed">다른 회원도 운영에 참여하도록 동기 부여<br />누구나 게임 운영자 가능</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm leading-relaxed">공헌을 인정해 다음달 전체 참가비 면제</span>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-xs text-blue-600 italic font-medium">
                *일반적으로 감독과 총무가 게임을 진행하지만 감독과 총무가 진행하지 못할때, 운영자가 진행합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Rules() {
  return (
    <section className="py-32 bg-gray-50 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-black text-black mb-6">Club Guidelines</h2>
          <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto">
            기준 25.12.17
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="font-bold text-2xl mb-6">회원제</h3>
            <div className="space-y-4">
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-bold">정규 회원 - 가입비 없음</h4>
                <p className="text-gray-600">₩5,000~6,000 / 회</p>
                <p className="text-xs text-gray-500 mt-1">*대관비 불충족 시 ₩6,000</p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-bold">매월 회 선택가능</h4>
                <p className="text-gray-600">₩10,000 / 2회, 월 <br />₩20,000 / 4회, 월</p>
              </div>
              <div className="border-l-4 border-accent pl-4">
                <h4 className="font-bold">회 초과시 게스트비로 전환</h4>
                <p className="text-gray-600">매월 초기화 후 재모집</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="font-bold text-2xl mb-6">팀 주의사항</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                <span>비난 혹은 욕설 금지 바로 추방, 게스트도 금지</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                <span>개인 위주의 플레이. 게임의 상황과 상관없는 받자마자 슛, 수비자5명에 단독드리블 주의</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                <span>동료들과의 팀워크 및 협동심을 중시합니다.</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                <span>게스트 분들에게 불언행, 텃세 주의</span>
              </li>
            </ul>
            
            <div className="mt-6">
              <p className="text-xs text-amber-600 italic font-medium bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                *게스트분들도 얼마든지 항상 정규팀원이 될 수 있습니다.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="font-bold text-2xl mb-6">재정 사용처</h3>
            <p className="text-gray-700 mb-4">
              체육관 대관료<br />경기 게임볼, 예비 레드 유니폼 등 구입<br />게임볼, 운영 용품 택배비<br />경기운영자 특혜 및 게스트 미달 예비금액<br />사이트 서버 비용 등<br />
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="font-bold text-2xl mb-6">3파전 진행</h3>
            <p className="text-gray-700 mb-4">
              매주 팀의 밸런스는 키/나이/포지션 을 참고로 큰틀에서 AI가 매칭후, 친구 or 미세조정 합니다
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• 블랙팀. 창단 멤버 + 정규멤버</p>
              <p>• 화이트팀 정규멤버</p>
              <p>• 레드팀 정규멤버 + 게스트위주</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="font-bold text-2xl mb-6">큰 운영적인 운영비</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-700">3시간over 체육관 대여료</span>
                <span className="font-semibold text-lg">₩110,000 / 주</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-700">회원과 게스트비</span>
                <span className="font-semibold text-lg">₩110,000</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-700">운영보조 등 여분비</span>
                <span className="font-semibold text-lg">₩10,000</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="font-bold text-2xl mb-6">경기 운영 총괄자 특혜</h3>
            <div className="space-y-4 text-gray-700">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm leading-relaxed">운영 주관자는 경기 준비와 책임을 맡음</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm leading-relaxed">운영 없이는 경기‧게스트비 수금 불가<br /> → 필수적 역할</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm leading-relaxed">다른 회원도 운영에 참여하도록 동기 부여<br />누구나 게임 운영 총괄자 가능</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm leading-relaxed">공헌을 인정해 다음달 전체 참가비 면제</span>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-xs text-blue-600 italic font-medium">
                *감독 총무가 진행하지 못할때, 운영 총괄자가 진행합니다.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md mx-auto">
            <h3 className="font-bold text-lg mb-4">운영회칙 다운로드</h3>
            <a 
              href="/Fire Basketball_Club_Rules_Final.docx" 
              download="ICNFIRE_운영회칙.docx"
              className="flex items-center justify-between bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700">ICNFIRE_운영회칙.docx</span>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

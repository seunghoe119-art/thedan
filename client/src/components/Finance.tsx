import { Button } from "@/components/ui/button";
import { DollarSign, CreditCard, BarChart3 } from "lucide-react";

export default function Finance() {
  return (
    <section className="py-32 bg-gray-50 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-black text-black mb-6">Open Finance</h2>
          <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto">
            회원들을 위해 월간 수입, 지출, 잔액을 공개합니다.<br />(회원기능 추가하여 회원만 확인 가능하게 기능 및 업로드 예정 )
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-bold text-2xl mb-2">월간 수입</h3>
              <p className="text-3xl font-black text-green-600">₩850,000</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="font-bold text-2xl mb-2">월간 지출</h3>
              <p className="text-3xl font-black text-red-600">₩740,000</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-2xl mb-2">잔액</h3>
              <p className="text-3xl font-black text-blue-600">₩110,000</p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8">
            <h4 className="font-bold text-xl mb-6">지출 내역</h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between py-2">
                  <span className="text-gray-700">체육관 대여료(1주)</span>
                  <span className="font-medium">₩100,000</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-700">장비 및 용품(예시)</span>
                  <span className="font-medium">₩150,000</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-700">음료수(1주)</span>
                  <span className="font-medium">₩10,000</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between py-2">
                  <span className="text-gray-700">전국체전 숙소 예약비</span>
                  <span className="font-medium">₩100,000</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-700">교류전 원정비</span>
                  <span className="font-medium">₩30,000</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-700">기타</span>
                  <span className="font-medium">₩20,000</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Button 
              className="bg-accent text-white hover:bg-red-600 rounded-full px-8 py-3"
              onClick={() => window.open('https://1drv.ms/f/c/ed6e5a8c5875b6b8/EpcD9lhH4WRFi6bhX2fHXBIBK-5vE45vulM33mRSbWcaTA', '_blank')}
            >
              월간 보고서 보기
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

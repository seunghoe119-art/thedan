import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Copy, Send, ArrowRight } from "lucide-react";
import { Link, useLocation } from "wouter";
import { supabase } from "@/lib/supabaseClient";

export default function JoinUs() {
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const [guestCardClickCount, setGuestCardClickCount] = useState(0);

  const handleGuestCardClick = () => {
    const newCount = guestCardClickCount + 1;
    setGuestCardClickCount(newCount);
    
    if (newCount >= 10) {
      setLocation('/guest-status');
      setGuestCardClickCount(0);
    }
  };

  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    age: "",
    position: "",
    jerseySize: "",
    applicationPeriod: "",
    membershipType: "",
    agreeRules: false,
    dataConsent: false,
  });

  // Helper functions for text generation and copying
  const getPositionText = (position: string) => {
    const positionMap: { [key: string]: string } = {
      leading: "리딩 가드 1,2번",
      small: "스몰포워드 2,3번",
      baseline: "밑선라인 4,5번"
    };
    return positionMap[position] || position;
  };

  const getSizeText = (size: string) => {
    const sizeMap: { [key: string]: string } = {
      s: "2XL 170-175",
      m: "3XL 175-180",
      l: "4XL 180-185",
      xl: "5XL 110 185이상",
      xxl: "6XL 115 185이상"
    };
    return sizeMap[size] || size;
  };

  const getMembershipText = (type: string) => {
    const membershipMap: { [key: string]: string } = {
      regular: "정규 회원 월2회",
      dormant: "정규 회원 월4회",
      firefighter: "입단전 게스트 신청"
    };
    return membershipMap[type] || type;
  };

  const getPeriodText = (period: string) => {
    const now = new Date();
    const currentYear = now.getFullYear() % 100; // Get last 2 digits of year
    const currentMonth = now.getMonth() + 1; // 0-indexed, so add 1
    
    if (period === "thisMonth") {
      return `${currentYear}년 ${currentMonth}월 신청`;
    } else if (period === "nextMonth") {
      const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
      const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;
      return `${nextYear}년 ${nextMonth}월 신청`;
    }
    return "";
  };

  const generateMessage = () => {
    if (!formData.name || !formData.contact || !formData.age || !formData.position || !formData.jerseySize || !formData.applicationPeriod || !formData.membershipType) {
      return "위 항목을 선택하면 자동으로 메시지가 구성됩니다.";
    }

    let message = `안녕하세요. THE DAN 농구 정규 회원제 신청 문의입니다.\n[${formData.name}, ${formData.age}, ${getPositionText(formData.position)}]`;
    message += `\n[${getSizeText(formData.jerseySize)}, ${getMembershipText(formData.membershipType)}]`;
    message += `\n[${getPeriodText(formData.applicationPeriod)}]`;
    message += `\n연락처: ${formData.contact}`;

    return message;
  };

  const copyToClipboard = async () => {
    const message = generateMessage();
    try {
      await navigator.clipboard.writeText(message);
      toast({
        title: "복사 완료!",
        description: "메시지가 클립보드에 복사되었습니다.",
      });
    } catch (err) {
      toast({
        title: "복사 실패",
        description: "클립보드 복사 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  // 전화번호 마스킹 함수: 010-12xx-xxxx 형태로 변환
  const maskPhoneNumber = (phone: string): string => {
    // 숫자만 추출
    const numbers = phone.replace(/[^0-9]/g, '');
    
    if (numbers.length !== 11) {
      return phone; // 형식이 맞지 않으면 원본 반환
    }
    
    // 010-12xx-xxxx 형태로 마스킹
    const masked = numbers.slice(0, 5) + '000000';
    return masked.slice(0, 3) + '-' + masked.slice(3, 7) + '-' + masked.slice(7);
  };

  // Map membership type to plan value for Supabase
  const getPlanValue = (membershipType: string): string => {
    const planMap: { [key: string]: string } = {
      regular: "regular_2",
      dormant: "regular_4",
      firefighter: "guest_once"
    };
    return planMap[membershipType] || "guest_once";
  };

  // Get target month as first day of month (YYYY-MM-01)
  const getTargetMonth = (period: string): string => {
    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth(); // 0-indexed
    
    if (period === "nextMonth") {
      month += 1;
      if (month > 11) {
        month = 0;
        year += 1;
      }
    }
    
    // Format as YYYY-MM-01 (avoid timezone issues with toISOString)
    const monthStr = String(month + 1).padStart(2, '0');
    return `${year}-${monthStr}-01`;
  };

  // Get height range from jersey size
  const getHeightRange = (size: string): string => {
    const heightMap: { [key: string]: string } = {
      s: "170-175",
      m: "175-180",
      l: "180-185",
      xl: "185이상",
      xxl: "185이상"
    };
    return heightMap[size] || "175-180";
  };

  // Get uniform size label
  const getUniformSize = (size: string): string => {
    const sizeMap: { [key: string]: string } = {
      s: "2XL",
      m: "3XL",
      l: "4XL",
      xl: "5XL",
      xxl: "6XL"
    };
    return sizeMap[size] || "3XL";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.contact || !formData.age || !formData.position || !formData.jerseySize || !formData.applicationPeriod || !formData.membershipType) {
      toast({
        title: "입력사항 확인",
        description: "모든 필드를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (!supabase) {
        throw new Error("Supabase 연결이 설정되지 않았습니다.");
      }

      const { error } = await supabase
        .from('membership_applications')
        .insert({
          name: formData.name,
          phone: maskPhoneNumber(formData.contact),
          age: formData.age,
          position: getPositionText(formData.position),
          uniform_size: getUniformSize(formData.jerseySize),
          height_range: getHeightRange(formData.jerseySize),
          plan: getPlanValue(formData.membershipType),
          target_month: getTargetMonth(formData.applicationPeriod),
          payment_status: 'pending'
        });

      if (error) {
        // Check for duplicate entry
        if (error.code === '23505') {
          throw new Error("이미 해당 월에 신청하셨습니다.");
        }
        throw error;
      }

      // Redirect to KakaoTalk open chat
      window.open("https://open.kakao.com/o/skS1in7h", "_blank");

      // Reset form
      setFormData({
        name: "",
        contact: "",
        age: "",
        position: "",
        jerseySize: "",
        applicationPeriod: "",
        membershipType: "",
        agreeRules: false,
        dataConsent: false,
      });

    } catch (error: any) {
      console.error("Submit error:", error);
      toast({
        title: "저장 실패",
        description: error.message || "신청 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-32 bg-black text-white relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/rules">
          <div className="text-center mb-16 cursor-pointer group">
            <div className="inline-block bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-100 rounded-3xl p-8 shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-orange-500/20">
              <h2 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
                Club Guidelines
              </h2>
              <div className="flex items-center justify-center gap-2 text-gray-700 font-medium">
                <span>클럽 규칙 자세히 보기</span>
                <ArrowRight className="w-5 h-5 transform group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </div>
        </Link>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-8">
            <div className="bg-gray-900 rounded-2xl p-8">
              <h3 className="font-bold text-2xl mb-4">회비 안내</h3>

              <div className="space-y-6">
                <div className="border border-gray-700 rounded-xl p-6 hover:border-accent transition-colors">
                  <h4 className="font-bold text-lg mb-2">정규 회원. 월 2회/4회 선택</h4>
                  <p className="text-gray-400 mb-3 text-[0.7em] leading-relaxed">
                    *정규회원 대다수로<br />
                    게임이 진행되어 대관비 부족시<br />
                    ₩1,000원 익월 청구
                  </p>
                  <p className="text-2xl font-bold text-white">₩5,000/참여 횟수</p>
                </div>

                <div 
                  className="border border-gray-700 rounded-xl p-6 hover:border-accent transition-colors cursor-pointer"
                  onClick={handleGuestCardClick}
                >
                  <h4 className="font-bold text-lg mb-2">게스트 비용<br />횟수 초과시 게스트로 전환</h4>
                  <p className="text-gray-400 mb-3">매주 참가인원을 보고 게스트비 선정</p>
                  <p className="text-2xl font-bold text-accent">₩8,000~10,000/참여 횟수</p>
                </div>

                <div className="border border-gray-700 rounded-xl p-6 hover:border-accent transition-colors">
                  <h4 className="font-bold text-lg mb-2">첫 달은 체험 기간으로 운영</h4>
                  <p className="text-gray-400 mb-3">개인복 검/흰 , 다이소 팀조끼 사용</p>
                  <p className="text-2xl font-bold text-green-500">체험 운영</p>
                </div>

                <div className="border border-gray-700 rounded-xl p-6 hover:border-accent transition-colors">
                  <h4 className="font-bold text-lg mb-2">레드팀 유니폼 관련 안내</h4>
                  <p className="text-gray-400 mb-3">둘째달부터 빨간색 상의 보유를 의무화합니다.<br />빨간 유니폼 보유 시 개인것 사용</p>
                  <p className="text-sm md:text-base lg:text-lg font-bold text-white leading-relaxed">
                    빨간색 상의 미보유시 공구 팀유니폼을 구매하여 이용 ₩9,000<br className="hidden md:inline" />(등번호 랜덤)<br /><br />
                    커스텀 상의 구매 희망시에 등번호 및 이름 지정 가능 ₩12,000
                  </p>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4">
                  <p className="text-sm text-yellow-800 leading-relaxed">
                    *3파전으로 진행, 블랙-화이트-레드로<br />진행하기에 필수인점 양해바랍니다.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-2xl p-8">
            <h3 className="font-bold text-2xl mb-6">신청서</h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">이름</Label>
                  <Input 
                    type="text" 
                    placeholder="성명"
                    className="bg-black border-gray-700 text-white mt-2"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    data-testid="input-name"
                  />
                </div>
                <div>
                  <Label className="text-white">연락처</Label>
                  <div className="relative mt-2">
                    <span className={`absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${formData.contact ? 'text-black' : 'text-gray-500'}`}>
                      010-
                    </span>
                    <Input 
                      type="tel" 
                      placeholder="0000-0000"
                      className="bg-black border-gray-700 text-white pl-14"
                      value={formData.contact}
                      onChange={(e) => {
                        let value = e.target.value.replace(/[^0-9]/g, '');

                        // 010으로 시작하지 않고 입력이 있으면 010 추가
                        if (value.length > 0 && !value.startsWith('010')) {
                          value = '010' + value;
                        }

                        // 010만 입력된 경우 그대로 유지
                        if (value === '010') {
                          setFormData({ ...formData, contact: '010' });
                          return;
                        }

                        // 최대 11자리까지만
                        if (value.length > 11) {
                          value = value.slice(0, 11);
                        }

                        // 포맷팅: 010-0000-0000
                        let formatted = '';
                        if (value.length <= 3) {
                          formatted = value;
                        } else if (value.length <= 7) {
                          formatted = value.slice(0, 3) + '-' + value.slice(3);
                        } else {
                          formatted = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7);
                        }

                        setFormData({ ...formData, contact: formatted });
                      }}
                      required
                      data-testid="input-contact"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-white">나이</Label>
                <select 
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-accent focus:outline-none mt-2"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  required
                  data-testid="select-age"
                >
                  <option value="">나이 선택</option>
                  <option value="20대">20대</option>
                  <option value="30대">30대</option>
                  <option value="40대">40대</option>
                  <option value="47세이상">47세이상</option>
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">포지션</Label>
                  <select 
                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-accent focus:outline-none mt-2"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    required
                    data-testid="select-position"
                  >
                    <option value="">포지션 선택</option>
                    <option value="leading">리딩 가드 1,2번</option>
                    <option value="small">스몰포워드 2,3번</option>
                    <option value="baseline">밑선라인 4,5번</option>
                  </select>
                </div>
                <div>
                  <Label className="text-white">유니폼 사이즈 / 키</Label>
                  <select 
                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-accent focus:outline-none mt-2"
                    value={formData.jerseySize}
                    onChange={(e) => setFormData({ ...formData, jerseySize: e.target.value })}
                    required
                    data-testid="select-jersey-size"
                  >
                    <option value="">사이즈 선택</option>
                    <option value="s">2XL 170-175</option>
                    <option value="m">3XL 175-180</option>
                    <option value="l">4XL 180-185</option>
                    <option value="xl">XL 110 185이상</option>
                    <option value="xxl">XXL 115 185이상</option>
                  </select>
                </div>
              </div>

              <div>
                <Label className="text-white">신청 기간</Label>
                <div className="space-y-3 mt-2">
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="period" 
                      value="thisMonth" 
                      className="text-accent focus:ring-accent"
                      onChange={(e) => setFormData({ ...formData, applicationPeriod: e.target.value })}
                      required
                      data-testid="radio-period-this-month"
                    />
                    <span className="ml-3">이번달</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="period" 
                      value="nextMonth" 
                      className="text-accent focus:ring-accent"
                      onChange={(e) => setFormData({ ...formData, applicationPeriod: e.target.value })}
                      required
                      data-testid="radio-period-next-month"
                    />
                    <span className="ml-3">다음달</span>
                  </label>
                </div>
              </div>

              <div>
                <Label className="text-white">회원 유형</Label>
                <div className="space-y-3 mt-2">
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="membership" 
                      value="regular" 
                      className="text-accent focus:ring-accent"
                      onChange={(e) => setFormData({ ...formData, membershipType: e.target.value })}
                      required
                      data-testid="radio-membership-regular"
                    />
                    <span className="ml-3">정규 회원 (₩10,000/월2회)</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="membership" 
                      value="dormant" 
                      className="text-accent focus:ring-accent"
                      onChange={(e) => setFormData({ ...formData, membershipType: e.target.value })}
                      required
                      data-testid="radio-membership-dormant"
                    />
                    <span className="ml-3">정규 회원 (₩20,000/월4회)</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="membership" 
                      value="firefighter" 
                      className="text-accent focus:ring-accent"
                      onChange={(e) => setFormData({ ...formData, membershipType: e.target.value })}
                      required
                      data-testid="radio-membership-firefighter"
                    />
                    <span className="ml-3">입단전 게스트 (게스트비 적용)</span>
                  </label>
                </div>
              </div>

              {/* Generated message preview */}
              <div className="bg-black border border-gray-700 rounded-lg p-4">
                <Label className="text-white mb-2 block">생성된 메시지</Label>
                <p className="text-gray-300 text-sm leading-relaxed" data-testid="text-generated-message">
                  {generateMessage()}
                </p>
              </div>

              {/* Copy and Submit buttons */}
              <div className="grid md:grid-cols-2 gap-4">
                <Button 
                  type="button"
                  onClick={copyToClipboard}
                  className="bg-gray-700 text-white hover:bg-gray-600 py-4 rounded-lg font-bold text-lg"
                  data-testid="button-copy"
                >
                  <Copy className="w-5 h-5 mr-2" />
                  복사
                </Button>

                <Button 
                  type="submit" 
                  className="bg-accent text-white hover:bg-red-600 py-4 rounded-lg font-bold text-lg disabled:opacity-50"
                  data-testid="button-submit"
                  disabled={isSubmitting}
                >
                  <Send className="w-5 h-5 mr-2" />
                  {isSubmitting ? "여는중..." : "신청서 제출, 카카오톡 연결"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
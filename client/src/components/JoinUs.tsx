import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Copy, Send } from "lucide-react";

export default function JoinUs() {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    position: "",
    jerseySize: "",
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
      s: "소형 (S)",
      m: "중형 (M)",
      l: "대형 (L)",
      xl: "특대 (XL)",
      xxl: "특특대 (XXL)"
    };
    return sizeMap[size] || size;
  };

  const getMembershipText = (type: string) => {
    const membershipMap: { [key: string]: string } = {
      regular: "정규 회원",
      dormant: "휴면 회원",
      firefighter: "학교 재학생 혹은 합격자"
    };
    return membershipMap[type] || type;
  };

  const generateMessage = () => {
    if (!formData.name || !formData.contact || !formData.position || !formData.jerseySize || !formData.membershipType) {
      return "모든 필드를 입력해주세요.";
    }
    
    return `안녕하세요 이름 ${formData.name}, 연락처 ${formData.contact}, 포지션 ${getPositionText(formData.position)}, 유니폼사이즈 ${getSizeText(formData.jerseySize)}, ${getMembershipText(formData.membershipType)}으로 인천소방농구에 가입 문의입니다.`;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agreeRules || !formData.dataConsent) {
      toast({
        title: "동의사항 확인",
        description: "모든 동의사항에 체크해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.name || !formData.contact || !formData.position || !formData.jerseySize || !formData.membershipType) {
      toast({
        title: "입력사항 확인",
        description: "모든 필드를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    // Redirect to KakaoTalk open chat
    window.open("https://open.kakao.com/o/s5gBNvNh", "_blank");
  };

  return (
    <section className="py-32 bg-black text-white relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-black mb-6">작성 중</h2>
          <p className="text-xl text-gray-400 font-light max-w-3xl mx-auto">
            수정중
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-8">
            <div className="bg-gray-900 rounded-2xl p-8">
              <h3 className="font-bold text-2xl mb-4">회비 안내</h3>
              
              <div className="space-y-6">
                <div className="border border-gray-700 rounded-xl p-6 hover:border-accent transition-colors">
                  <h4 className="font-bold text-lg mb-2">정규 회원</h4>
                  <p className="text-gray-400 mb-3">월 2회 이상 참석 시 최적</p>
                  <p className="text-2xl font-bold text-accent">₩19,000/월</p>
                </div>

                <div className="border border-gray-700 rounded-xl p-6 hover:border-accent transition-colors">
                  <h4 className="font-bold text-lg mb-2">휴면 회원</h4>
                  <p className="text-gray-400 mb-3">3개월 단위로 신청가능; 참석 시 게스트 요금 적용</p>
                  <p className="text-2xl font-bold text-accent">₩5,000/월</p>
                </div>

                <div className="border border-gray-700 rounded-xl p-6 hover:border-accent transition-colors">
                  <h4 className="font-bold text-lg mb-2">학교 재학생 혹은 합격자</h4>
                  <p className="text-gray-400 mb-3">증빙자료와 함께 담당자에게 개인 연락</p>
                  <p className="text-2xl font-bold text-green-500">무료</p>
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
                  <Input 
                    type="text" 
                    placeholder="전화번호/이메일"
                    className="bg-black border-gray-700 text-white mt-2"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    required
                    data-testid="input-contact"
                  />
                </div>
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
                  <Label className="text-white">유니폼 사이즈</Label>
                  <select 
                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-accent focus:outline-none mt-2"
                    value={formData.jerseySize}
                    onChange={(e) => setFormData({ ...formData, jerseySize: e.target.value })}
                    required
                    data-testid="select-jersey-size"
                  >
                    <option value="">사이즈 선택</option>
                    <option value="s">소형 (S)</option>
                    <option value="m">중형 (M)</option>
                    <option value="l">대형 (L)</option>
                    <option value="xl">특대 (XL)</option>
                    <option value="xxl">특특대 (XXL)</option>
                  </select>
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
                    <span className="ml-3">정규 회원 (₩19,000/월)</span>
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
                    <span className="ml-3">휴면 회원 (₩5,000/월)</span>
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
                    <span className="ml-3">학교 재학생 혹은 합격자 (무료)</span>
                  </label>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="rules"
                    checked={formData.agreeRules}
                    onCheckedChange={(checked) => setFormData({ ...formData, agreeRules: !!checked })}
                    className="border-gray-700"
                    data-testid="checkbox-rules"
                  />
                  <Label htmlFor="rules" className="text-white">클럽 규칙에 동의</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="consent"
                    checked={formData.dataConsent}
                    onCheckedChange={(checked) => setFormData({ ...formData, dataConsent: !!checked })}
                    className="border-gray-700"
                    data-testid="checkbox-consent"
                  />
                  <Label htmlFor="consent" className="text-white">개인정보 수집 동의</Label>
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
                  className="bg-accent text-white hover:bg-red-600 py-4 rounded-lg font-bold text-lg"
                  data-testid="button-submit"
                >
                  <Send className="w-5 h-5 mr-2" />
                  신청서 제출
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

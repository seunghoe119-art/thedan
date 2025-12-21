import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Copy, Send } from "lucide-react";

export default function GuestContact() {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    age: "",
    position: "",
    jerseySize: "m",
    membershipType: "firefighter",
    agreeRules: true,
    dataConsent: true,
  });

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
      s: "사이즈 S 95",
      m: "사이즈 M 100",
      l: "사이즈 L 105",
      xl: "사이즈 XL 110",
      xxl: "사이즈 XXL 115"
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

  const generateMessage = () => {
    if (!formData.name || !formData.contact || !formData.age || !formData.position) {
      return "이름, 연락처, 나이, 포지션을 입력해주세요.";
    }
    
    return `안녕하세요 이름 ${formData.name}, 연락처 ${formData.contact}, 나이 ${formData.age}, 포지션 ${getPositionText(formData.position)}`;
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

    if (!formData.name || !formData.contact || !formData.age || !formData.position) {
      toast({
        title: "입력사항 확인",
        description: "이름, 연락처, 나이, 포지션을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "신청 완료",
      description: "신청서가 작성되었습니다. 메시지를 복사하여 담당자에게 전달해주세요.",
    });
  };

  return (
    <section className="py-16 bg-black text-white relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-900 rounded-2xl p-8">
            <h3 className="font-bold text-2xl mb-6">게스트 신청서</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label className="text-white">나이</Label>
                <select 
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-accent focus:outline-none mt-2"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  required
                  data-testid="guest-select-age"
                >
                  <option value="">나이 선택</option>
                  <option value="20대">20대</option>
                  <option value="30대">30대</option>
                  <option value="40대">40대</option>
                  <option value="47세이상">47세이상</option>
                </select>
              </div>

              <div>
                <Label className="text-white">포지션</Label>
                <select 
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-accent focus:outline-none mt-2"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  required
                  data-testid="guest-select-position"
                >
                  <option value="">포지션 선택</option>
                  <option value="leading">리딩 가드 1,2번</option>
                  <option value="small">스몰포워드 2,3번</option>
                  <option value="baseline">밑선라인 4,5번</option>
                </select>
              </div>

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
                    data-testid="guest-input-name"
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
                      data-testid="guest-input-contact"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-black border border-gray-700 rounded-lg p-4">
                <Label className="text-white mb-2 block">생성된 메시지</Label>
                <p className="text-gray-300 text-sm leading-relaxed" data-testid="guest-text-generated-message">
                  {generateMessage()}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Button 
                  type="button"
                  onClick={copyToClipboard}
                  className="bg-gray-700 text-white hover:bg-gray-600 py-4 rounded-lg font-bold text-lg"
                  data-testid="guest-button-copy"
                >
                  <Copy className="w-5 h-5 mr-2" />
                  복사
                </Button>
                
                <Button 
                  type="submit" 
                  className="bg-accent text-white hover:bg-red-600 py-4 rounded-lg font-bold text-lg"
                  data-testid="guest-button-submit"
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

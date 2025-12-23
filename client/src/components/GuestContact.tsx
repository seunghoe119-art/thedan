
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Copy, Send, Plus, X, MapPin } from "lucide-react";
import { Link } from "wouter";

interface AdditionalGuest {
  id: string;
  name: string;
  age: string;
  position: string;
  height: string;
}

export default function GuestContact() {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    age: "",
    position: "",
    height: "",
    jerseySize: "m",
    membershipType: "firefighter",
    agreeRules: true,
    dataConsent: true,
  });

  const [additionalGuests, setAdditionalGuests] = useState<AdditionalGuest[]>([]);

  const addGuestField = () => {
    const newGuest: AdditionalGuest = {
      id: Date.now().toString(),
      name: "",
      age: "",
      position: "",
      height: ""
    };
    setAdditionalGuests([...additionalGuests, newGuest]);
  };

  const removeGuestField = (id: string) => {
    setAdditionalGuests(additionalGuests.filter(guest => guest.id !== id));
  };

  const updateAdditionalGuest = (id: string, field: keyof Omit<AdditionalGuest, 'id'>, value: string) => {
    setAdditionalGuests(additionalGuests.map(guest => 
      guest.id === id ? { ...guest, [field]: value } : guest
    ));
  };

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
      return "위 항목을 선택하면 자동으로 메시지가 구성됩니다.";
    }
    
    let message = `안녕하세요. 김포 삼성썬더스 게스트 신청합니다.\n[${formData.name}, ${formData.age}, ${formData.height}, ${getPositionText(formData.position)}]`;
    
    // Add contact info
    message += `\n연락처: ${formData.contact}`;
    
    // Add additional guests to the message
    additionalGuests.forEach((guest) => {
      if (guest.name && guest.age && guest.position && guest.height) {
        message += `\n[${guest.name}, ${guest.age}, ${guest.height}, ${getPositionText(guest.position)}]`;
      }
    });
    
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.contact || !formData.age || !formData.position || !formData.height) {
      toast({
        title: "입력사항 확인",
        description: "이름, 연락처, 나이, 포지션, 키를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    // Open KakaoTalk chat link
    window.open("https://open.kakao.com/o/gnHeHo7h", "_blank");

    toast({
      title: "신청 완료",
      description: "카카오톡 오픈채팅방으로 이동합니다.",
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

              <div>
                <Label className="text-white">키</Label>
                <select 
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-accent focus:outline-none mt-2"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  required
                  data-testid="guest-select-height"
                >
                  <option value="">키 선택</option>
                  <option value="170~175cm">170~175cm</option>
                  <option value="175~180cm">175~180cm</option>
                  <option value="180~185cm">180~185cm</option>
                  <option value="185~190cm">185~190cm</option>
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
                        
                        if (value.length > 0 && !value.startsWith('010')) {
                          value = '010' + value;
                        }
                        
                        if (value === '010') {
                          setFormData({ ...formData, contact: '010' });
                          return;
                        }
                        
                        if (value.length > 11) {
                          value = value.slice(0, 11);
                        }
                        
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

              {/* Additional Guests Section */}
              {additionalGuests.map((guest, index) => (
                <div key={guest.id} className="bg-black border border-gray-700 rounded-lg p-4 space-y-4 relative animate-in slide-in-from-top duration-300">
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-accent font-bold">추가 게스트 {index + 1}</Label>
                    <button
                      type="button"
                      onClick={() => removeGuestField(guest.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div>
                    <Label className="text-white text-sm">나이</Label>
                    <select 
                      className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none mt-1"
                      value={guest.age}
                      onChange={(e) => updateAdditionalGuest(guest.id, 'age', e.target.value)}
                    >
                      <option value="">나이 선택</option>
                      <option value="20대">20대</option>
                      <option value="30대">30대</option>
                      <option value="40대">40대</option>
                      <option value="47세이상">47세이상</option>
                    </select>
                  </div>

                  <div>
                    <Label className="text-white text-sm">포지션</Label>
                    <select 
                      className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none mt-1"
                      value={guest.position}
                      onChange={(e) => updateAdditionalGuest(guest.id, 'position', e.target.value)}
                    >
                      <option value="">포지션 선택</option>
                      <option value="leading">리딩 가드 1,2번</option>
                      <option value="small">스몰포워드 2,3번</option>
                      <option value="baseline">밑선라인 4,5번</option>
                    </select>
                  </div>

                  <div>
                    <Label className="text-white text-sm">키</Label>
                    <select 
                      className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none mt-1"
                      value={guest.height}
                      onChange={(e) => updateAdditionalGuest(guest.id, 'height', e.target.value)}
                    >
                      <option value="">키 선택</option>
                      <option value="170~175cm">170~175cm</option>
                      <option value="175~180cm">175~180cm</option>
                      <option value="180~185cm">180~185cm</option>
                      <option value="185~190cm">185~190cm</option>
                    </select>
                  </div>

                  <div>
                    <Label className="text-white text-sm">이름</Label>
                    <Input 
                      type="text" 
                      placeholder="성명"
                      className="bg-gray-900 border-gray-600 text-white mt-1"
                      value={guest.name}
                      onChange={(e) => updateAdditionalGuest(guest.id, 'name', e.target.value)}
                    />
                  </div>
                </div>
              ))}

              {/* Add Guest Button */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={addGuestField}
                  className="group relative bg-gradient-to-r from-accent to-red-600 text-white rounded-full p-3 hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-accent/50"
                >
                  <Plus className="w-6 h-6" />
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-gray-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    게스트 추가
                  </span>
                </button>
              </div>

              <div className="bg-black border border-gray-700 rounded-lg p-4">
                <Label className="text-white mb-2 block">생성된 메시지</Label>
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line" data-testid="guest-text-generated-message">
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
                  ① 복사
                </Button>
                
                <Button 
                  type="submit" 
                  className="bg-accent text-white hover:bg-red-600 py-4 rounded-lg font-bold text-lg"
                  data-testid="guest-button-submit"
                >
                  <Send className="w-5 h-5 mr-2" />
                  ② 신청서 제출
                </Button>
              </div>

              <div className="mt-6">
                <Link href="/about#facilities-section">
                  <Button 
                    type="button"
                    className="w-full bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-700 text-white hover:from-blue-600 hover:via-blue-700 hover:to-cyan-800 py-4 rounded-lg font-bold text-lg shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
                    onClick={() => {
                      setTimeout(() => {
                        const element = document.getElementById('facilities-section');
                        if (element) {
                          const yOffset = -80; // Navigation bar height
                          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                          window.scrollTo({ top: y, behavior: 'smooth' });
                        }
                      }, 100);
                    }}
                  >
                    <MapPin className="w-5 h-5 mr-2" />
                    ③ 코트 위치 & 시설안내
                  </Button>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

import { MessageCircle, Instagram, Mail } from "lucide-react";

const contactMethods = [
  {
    name: "카카오톡",
    description: "오픈톡방 링크",
    icon: MessageCircle,
    color: "yellow-400",
    hoverColor: "yellow-400",
    url: "https://open.kakao.com/o/gD85Jo7h",
  },
  {
    name: "인스타그램(예정)",
    description: "우리의 여정을 팔로우하세요",
    icon: Instagram,
    color: "gradient-to-br from-purple-500 to-pink-500",
    hoverColor: "purple-500",
  },
  {
    name: "온나라 메일",
    description: "이메일 문의",
    icon: Mail,
    color: "blue-500",
    hoverColor: "blue-500",
  },
];

export default function Contact() {
  return (
    <section className="py-32 bg-white relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-black text-black mb-6">Say Hello</h2>
          <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto">
            가입이나 연습에 대한 궁금한 점이 있으신가요? 언제든지 연락하세요.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {contactMethods.map((method, index) => {
            const IconComponent = method.icon;
            return (
              <a 
                key={index}
                href={method.url || "#"} 
                target={method.url ? "_blank" : "_self"}
                rel={method.url ? "noopener noreferrer" : ""}
                className="group bg-gray-50 rounded-2xl p-8 text-center hover:bg-accent hover:text-white transition-all transform hover:scale-105"
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-white transition-colors ${
                  method.name === "카카오톡" ? "bg-yellow-400 group-hover:text-yellow-400" :
                  method.name === "인스타그램" ? "bg-gradient-to-br from-purple-500 to-pink-500 group-hover:text-purple-500" :
                  "bg-blue-500 group-hover:text-blue-500"
                }`}>
                  <IconComponent className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-xl mb-2">{method.name}</h3>
                <p className="text-gray-600 group-hover:text-white/80">{method.description}</p>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

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
  return null;
}
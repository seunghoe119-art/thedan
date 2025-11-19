import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bold,
  Italic,
  Underline,
  Link as LinkIcon,
  Image as ImageIcon,
  Video,
  Smile,
  Quote,
  AlignLeft,
  AlignCenter,
  List,
  ListOrdered,
  Table,
  Code,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function GuestPage() {
  const [category, setCategory] = useState("");
  const [topic, setTopic] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleAIAssist = async () => {
    if (!title && !content) {
      toast({
        title: "입력 필요",
        description: "제목이나 내용을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai-assist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          category,
          topic,
        }),
      });

      if (!response.ok) {
        throw new Error("AI 도움 요청 실패");
      }

      const data = await response.json();
      
      if (data.suggestion) {
        setContent((prev) => prev + "\n\n" + data.suggestion);
        toast({
          title: "AI 제안 완료",
          description: "내용이 추가되었습니다.",
        });
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "AI 도움을 받는 중 문제가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "게시글 작성 완료",
      description: "게시글이 성공적으로 작성되었습니다.",
    });
    setTitle("");
    setContent("");
    setHashtags("");
    setCategory("");
    setTopic("");
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">카페 글쓰기</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger data-testid="select-category">
                  <SelectValue placeholder="수도권 게스트" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="seoul">서울 게스트</SelectItem>
                  <SelectItem value="gyeonggi">경기 게스트</SelectItem>
                  <SelectItem value="incheon">인천 게스트</SelectItem>
                </SelectContent>
              </Select>

              <Select value={topic} onValueChange={setTopic}>
                <SelectTrigger data-testid="select-topic">
                  <SelectValue placeholder="경기모임" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="game">경기모임</SelectItem>
                  <SelectItem value="practice">연습모임</SelectItem>
                  <SelectItem value="event">이벤트</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Input
                data-testid="input-title"
                type="text"
                placeholder="제목을 입력해 주세요."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="border border-gray-200 rounded-md">
              <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  data-testid="button-bold"
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  data-testid="button-italic"
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  data-testid="button-underline"
                >
                  <Underline className="h-4 w-4" />
                </Button>
                <div className="w-px h-6 bg-gray-300 mx-1" />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  data-testid="button-quote"
                >
                  <Quote className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  data-testid="button-align-left"
                >
                  <AlignLeft className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  data-testid="button-align-center"
                >
                  <AlignCenter className="h-4 w-4" />
                </Button>
                <div className="w-px h-6 bg-gray-300 mx-1" />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  data-testid="button-list"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  data-testid="button-list-ordered"
                >
                  <ListOrdered className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  data-testid="button-table"
                >
                  <Table className="h-4 w-4" />
                </Button>
                <div className="w-px h-6 bg-gray-300 mx-1" />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  data-testid="button-image"
                  title="게스트비 5천원"
                >
                  <ImageIcon className="h-4 w-4 mr-1" />
                  <span className="text-xs">5천원</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  data-testid="button-video"
                  title="게스트비 6천원"
                >
                  <Video className="h-4 w-4 mr-1" />
                  <span className="text-xs">6천원</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  data-testid="button-link"
                  title="게스트비 7천원"
                >
                  <LinkIcon className="h-4 w-4 mr-1" />
                  <span className="text-xs">7천원</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  data-testid="button-smile"
                >
                  <Smile className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  data-testid="button-code"
                >
                  <Code className="h-4 w-4" />
                </Button>
                <div className="ml-auto flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAIAssist}
                    disabled={isGenerating}
                    className="h-8 bg-[#e60000] text-white hover:bg-[#cc0000] border-[#e60000]"
                    data-testid="button-ai-assist"
                  >
                    <Sparkles className="h-4 w-4 mr-1" />
                    {isGenerating ? "생성 중..." : "AI 게스트 모집글 작성하기"}
                  </Button>
                </div>
              </div>

              <div className="p-4">
                <Textarea
                  data-testid="textarea-content"
                  placeholder="'오늘 8월 19일이야. 이번주 금요일 기준으로 모집글 작성해줘 연락처는 0100000000'
'오늘 8월 23일 토요일이야. 다음주 금요일로 만들어줘 연락처는 0100000000'
'2025년 9월 2일 기준으로 글 써줘연락처는 0100000000'
'오늘은 9월 1일, 2파전으로 작성해줘 연락처는 0100000000, 게스트비는 7천원'"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[200px] border-0 rounded-none resize-none focus-visible:ring-0 mb-4"
                />
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <img 
                    src="/guest1.jpg" 
                    alt="게스트 모집 이미지 1" 
                    className="w-full h-48 object-cover rounded-lg shadow-md"
                  />
                  <img 
                    src="/guest2.jpg" 
                    alt="게스트 모집 이미지 2" 
                    className="w-full h-48 object-cover rounded-lg shadow-md"
                  />
                  <img 
                    src="/guest3.jpg" 
                    alt="게스트 모집 이미지 3" 
                    className="w-full h-48 object-cover rounded-lg shadow-md"
                  />
                  <img 
                    src="/guest4.jpg" 
                    alt="게스트 모집 이미지 4" 
                    className="w-full h-48 object-cover rounded-lg shadow-md"
                  />
                </div>
              </div>
            </div>

            <div>
              <Input
                data-testid="input-hashtags"
                type="text"
                placeholder="#태그를 입력해주세요 (최대 10개)"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                게스트 모집이외 교류전 또는 회원 모집은 각각에 맞는 게시판을 이용해주세요
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              data-testid="button-cancel"
            >
              취소
            </Button>
            <Button
              type="submit"
              className="bg-[#e60000] hover:bg-[#cc0000]"
              data-testid="button-submit"
            >
              등록
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

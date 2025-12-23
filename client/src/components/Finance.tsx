import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Lock, ChevronDown } from "lucide-react";

interface GuestApplication {
  id: number;
  created_at: string;
  game_date: string;
  name: string;
  phone: string;
  height_range: string;
  positions: string;
}

interface WeekOption {
  value: string;
  label: string;
}

export default function Finance() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [applications, setApplications] = useState<GuestApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState<string>("");
  const [weekOptions, setWeekOptions] = useState<WeekOption[]>([]);

  const getWeekLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const weekOfMonth = Math.ceil(date.getDate() / 7);
    return `${year}년 ${month}월 ${weekOfMonth}주차`;
  };

  useEffect(() => {
    const fetchApplications = async () => {
      if (!supabase || !user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('guest_applications')
          .select('id, created_at, game_date, name, phone, height_range, positions')
          .order('game_date', { ascending: false })
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching applications:', error);
          setApplications([]);
        } else if (data) {
          setApplications(data);
          
          const uniqueDates = Array.from(new Set(data.map(app => app.game_date)));
          const options = uniqueDates.map(date => ({
            value: date,
            label: getWeekLabel(date)
          }));
          setWeekOptions(options);
          
          if (options.length > 0 && !selectedWeek) {
            setSelectedWeek(options[0].value);
          }
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user && !authLoading) {
      fetchApplications();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const filteredApplications = selectedWeek 
    ? applications.filter(app => app.game_date === selectedWeek)
    : applications;

  if (authLoading || loading) {
    return (
      <section className="py-32 bg-gray-50 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="py-32 bg-gray-50 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-gray-500" />
            </div>
            <h2 className="text-3xl font-bold text-black mb-4">관리자 전용 페이지</h2>
            <p className="text-gray-600 mb-8">이 페이지는 관리자만 볼 수 있습니다.</p>
            <Link href="/login">
              <Button className="bg-accent text-white hover:bg-red-600 rounded-full px-8 py-3">
                로그인하기
              </Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (!isAdmin && applications.length === 0) {
    return (
      <section className="py-32 bg-gray-50 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-gray-500" />
            </div>
            <h2 className="text-3xl font-bold text-black mb-4">접근 권한 없음</h2>
            <p className="text-gray-600">관리자 권한이 필요합니다.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-32 bg-gray-50 relative z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-5xl font-black text-black mb-4">금주 신청 현황</h2>
          <p className="text-base md:text-lg text-gray-600">
            {selectedWeek ? getWeekLabel(selectedWeek) : ""} 신청 명단입니다. (Supabase 연동)
          </p>
        </div>

        {weekOptions.length > 0 && (
          <div className="mb-6 flex justify-center">
            <div className="relative w-full max-w-xs">
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
                className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 text-gray-700 focus:outline-none focus:border-accent"
                data-testid="select-week"
              >
                {weekOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-4 text-center text-sm font-bold text-gray-700 border-b border-gray-200">이름</th>
                  <th className="px-4 py-4 text-center text-sm font-bold text-gray-700 border-b border-gray-200">키</th>
                  <th className="px-4 py-4 text-center text-sm font-bold text-gray-700 border-b border-gray-200">포지션</th>
                  <th className="px-4 py-4 text-center text-sm font-bold text-gray-700 border-b border-gray-200">연락처</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      신청 내역이 없습니다.
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map((app) => (
                    <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-4 text-center text-gray-800">{app.name}</td>
                      <td className="px-4 py-4 text-center text-gray-800">{app.height_range}</td>
                      <td className="px-4 py-4 text-center text-gray-800">{app.positions}</td>
                      <td className="px-4 py-4 text-center text-gray-800">{app.phone}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          총 {filteredApplications.length}명 신청
        </div>
      </div>
    </section>
  );
}

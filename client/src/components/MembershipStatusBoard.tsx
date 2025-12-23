import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatPhoneForDisplay, formatHeightForDisplay, formatPositionForDisplay } from '@/lib/gameWeekUtils';

interface MembershipApplication {
  id: string;
  name: string;
  phone: string;
  age: string;
  position: string;
  height_range: string;
  uniform_size: string;
  plan: string;
  target_month: string;
}

interface DisplayApplication extends MembershipApplication {
  cumulativeCount: number;
  planDisplay: string;
}

function getMonthOptions(range: number = 41): { label: string; value: string }[] {
  const months: { label: string; value: string }[] = [];
  const now = new Date();
  const halfRange = Math.floor(range / 2);
  
  for (let i = -halfRange; i <= halfRange; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const value = `${year}-${String(month).padStart(2, '0')}-01`;
    const label = `${year}년 ${month}월`;
    months.push({ label, value });
  }
  
  return months;
}

function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  return `${year}-${String(month).padStart(2, '0')}-01`;
}

function getPlanDisplay(plan: string): string {
  if (plan === 'regular_2') return '2회';
  if (plan === 'regular_4') return '4회';
  if (plan === 'guest_once') return '게스트';
  return plan;
}

export default function MembershipStatusBoard() {
  const [applications, setApplications] = useState<DisplayApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [monthOptions, setMonthOptions] = useState(() => getMonthOptions(41));
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(() => {
    const currentMonth = getCurrentMonth();
    const options = getMonthOptions(41);
    return options.findIndex(opt => opt.value === currentMonth);
  });
  const [isExpanded, setIsExpanded] = useState(false);

  const selectedMonth = monthOptions[selectedMonthIndex];

  useEffect(() => {
    async function fetchApplications() {
      if (!selectedMonth) return;
      
      setIsLoading(true);
      
      try {
        if (!supabase) {
          console.error('Supabase client not initialized');
          setApplications([]);
          return;
        }

        const { data: monthData, error: monthError } = await supabase
          .from('membership_applications')
          .select('*')
          .eq('target_month', selectedMonth.value)
          .in('plan', ['regular_2', 'regular_4'])
          .order('name', { ascending: true });

        if (monthError) {
          console.error('Error fetching membership applications:', monthError);
          setApplications([]);
          return;
        }

        if (!monthData || monthData.length === 0) {
          setApplications([]);
          setIsLoading(false);
          return;
        }

        const phones = Array.from(new Set(monthData.map(app => app.phone)));
        
        const { data: allHistoryData, error: historyError } = await supabase
          .from('membership_applications')
          .select('phone, id, target_month')
          .in('phone', phones)
          .in('plan', ['regular_2', 'regular_4'])
          .lte('target_month', selectedMonth.value)
          .order('target_month', { ascending: true });

        if (historyError) {
          console.error('Error fetching history:', historyError);
        }

        const phoneCounts: { [phone: string]: number } = {};
        if (allHistoryData) {
          allHistoryData.forEach(app => {
            if (!phoneCounts[app.phone]) {
              phoneCounts[app.phone] = 0;
            }
            phoneCounts[app.phone]++;
          });
        }

        const displayApps: DisplayApplication[] = monthData.map(app => ({
          ...app,
          cumulativeCount: phoneCounts[app.phone] || 1,
          planDisplay: getPlanDisplay(app.plan),
        }));

        setApplications(displayApps);
      } catch (err) {
        console.error('Fetch error:', err);
        setApplications([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchApplications();
  }, [selectedMonth]);

  return (
    <section className="py-16 bg-gradient-to-b from-gray-100 to-gray-200 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            이번달 등록 팀 멤버현황
          </h1>
          <p className="text-gray-600">
            {selectedMonth?.label || ''} 등록 멤버 명단입니다. (Supabase 연동)
          </p>
        </div>

        <div className="mb-6 flex items-center justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => {
              setSelectedMonthIndex(prev => {
                const newIndex = prev - 1;
                if (newIndex < 5) {
                  const moreMonths = getMonthOptions(monthOptions.length + 20);
                  setMonthOptions(moreMonths);
                  return newIndex + 10;
                }
                return newIndex;
              });
            }}
            className="flex items-center gap-2"
            data-testid="button-prev-month"
          >
            <ChevronLeft className="h-4 w-4" />
            이전
          </Button>
          <div className="min-w-[150px] text-center font-semibold text-lg">
            {selectedMonth?.label || ''}
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedMonthIndex(prev => {
                const newIndex = prev + 1;
                if (newIndex >= monthOptions.length - 5) {
                  const moreMonths = getMonthOptions(monthOptions.length + 20);
                  setMonthOptions(moreMonths);
                }
                return newIndex;
              });
            }}
            className="flex items-center gap-2"
            data-testid="button-next-month"
          >
            다음
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-bold text-gray-900 text-center px-1">이름</TableHead>
                {!isExpanded && (
                  <>
                    <TableHead className="font-bold text-gray-900 text-center px-1">나이</TableHead>
                    <TableHead className="font-bold text-gray-900 text-center px-1">키</TableHead>
                    <TableHead className="font-bold text-gray-900 text-center px-1">포지션</TableHead>
                    <TableHead className="font-bold text-gray-900 text-center px-1">횟수</TableHead>
                  </>
                )}
                {isExpanded && (
                  <>
                    <TableHead className="font-bold text-gray-900 text-center px-1">사이즈</TableHead>
                    <TableHead className="font-bold text-gray-900 text-center px-1">폰번호</TableHead>
                  </>
                )}
                <TableHead className="font-bold text-gray-900 text-center px-1">
                  <div className="flex items-center justify-between">
                    <span>누적</span>
                    <button
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="text-xs hover:text-blue-600 transition-colors"
                      aria-label={isExpanded ? "기본 보기" : "상세 보기"}
                    >
                      {isExpanded ? '<' : '>'}
                    </button>
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell className="px-1 py-2"><Skeleton className="h-4 w-16 mx-auto" /></TableCell>
                    {!isExpanded && (
                      <>
                        <TableCell className="px-1 py-2"><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                        <TableCell className="px-1 py-2"><Skeleton className="h-4 w-16 mx-auto" /></TableCell>
                        <TableCell className="px-1 py-2"><Skeleton className="h-4 w-20 mx-auto" /></TableCell>
                        <TableCell className="px-1 py-2"><Skeleton className="h-4 w-28 mx-auto" /></TableCell>
                      </>
                    )}
                    {isExpanded && (
                      <>
                        <TableCell className="px-1 py-2"><Skeleton className="h-4 w-16 mx-auto" /></TableCell>
                        <TableCell className="px-1 py-2"><Skeleton className="h-4 w-20 mx-auto" /></TableCell>
                      </>
                    )}
                    <TableCell className="px-1 py-2"><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                  </TableRow>
                ))
              ) : applications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isExpanded ? 4 : 6} className="text-center text-gray-500 py-8">
                    해당 월에 등록된 멤버가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                applications.map((app) => (
                  <TableRow key={app.id} data-testid={`row-member-${app.id}`}>
                    <TableCell className="text-center font-medium px-1 py-2 whitespace-nowrap">{app.name}</TableCell>
                    {!isExpanded && (
                      <>
                        <TableCell className="text-center px-1 py-2 whitespace-nowrap">{app.age}</TableCell>
                        <TableCell className="text-center px-1 py-2 whitespace-nowrap">{formatHeightForDisplay(app.height_range)}</TableCell>
                        <TableCell className="text-center px-1 py-2 whitespace-nowrap">{formatPositionForDisplay(app.position)}</TableCell>
                        <TableCell className="text-center font-semibold text-blue-600 px-1 py-2 whitespace-nowrap">{app.planDisplay}</TableCell>
                      </>
                    )}
                    {isExpanded && (
                      <>
                        <TableCell className="text-center px-1 py-2 whitespace-nowrap">{app.uniform_size}</TableCell>
                        <TableCell className="text-center px-1 py-2 whitespace-nowrap">{app.phone.substring(0, 2)}</TableCell>
                      </>
                    )}
                    <TableCell className="text-center px-1 py-2 whitespace-nowrap">
                      <button
                        onClick={() => {
                          // 출석 기능은 나중에 추가
                        }}
                        className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                      >
                        출석
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {!isLoading && applications.length > 0 && (
          <div className="mt-4 text-center text-sm text-gray-500">
            총 {applications.length}명 등록
          </div>
        )}
      </div>
    </section>
  );
}

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatPhoneForDisplay, formatHeightForDisplay, formatPositionForDisplay } from '@/lib/gameWeekUtils';
import { useToast } from '@/hooks/use-toast';

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
  used_count: number;
  group_color?: string;
}

interface DisplayApplication extends MembershipApplication {
  cumulativeCount: number;
  planDisplay: string;
  remainingCount: number;
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
  const { toast } = useToast();
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [groupHeaderColor, setGroupHeaderColor] = useState<string>('');

  const selectedMonth = monthOptions[selectedMonthIndex];

  const toggleRowSelection = (id: string) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const cycleGroupColor = async () => {
    const colorCycle = [
      'text-red-600 font-bold',
      'text-yellow-600 font-bold',
      'text-green-600 font-bold',
      'text-blue-600 font-bold',
      'text-pink-600 font-bold',
      '', // 검정(기본)
    ];

    const currentIndex = colorCycle.indexOf(groupHeaderColor);
    const nextIndex = (currentIndex + 1) % colorCycle.length;
    const nextColor = colorCycle[nextIndex];
    setGroupHeaderColor(nextColor);

    // 선택된 행이 있으면 그룹 색상 저장
    if (selectedRows.size > 0 && supabase) {
      try {
        const updates = Array.from(selectedRows).map(id =>
          supabase
            .from('membership_applications')
            .update({ group_color: nextColor || null })
            .eq('id', id)
        );

        await Promise.all(updates);

        // 데이터 다시 불러오기
        setApplications(prev =>
          prev.map(app =>
            selectedRows.has(app.id)
              ? { ...app, group_color: nextColor || undefined }
              : app
          )
        );

        toast({
          title: "그룹 색상 저장 완료",
          description: `${selectedRows.size}명의 멤버에게 그룹 색상이 적용되었습니다.`,
        });

        // 선택 해제
        setSelectedRows(new Set());
      } catch (err) {
        console.error('Error updating group colors:', err);
        toast({
          title: "그룹 색상 저장 실패",
          description: "다시 시도해주세요.",
          variant: "destructive",
        });
      }
    }
  };

  const handleAddAsGuest = async (app: DisplayApplication) => {
    if (!supabase) {
      toast({
        title: "연결 오류",
        description: "데이터베이스 연결이 없습니다.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const nowUTC = new Date();

      const { error } = await supabase
        .from('guest_applications')
        .insert({
          name: `${app.name}(정규)`,
          age: app.age,
          position: app.position,
          height: app.height_range,
          phone: app.phone,
          applied_at: nowUTC.toISOString(),
          is_hidden: false
        });

      if (error) {
        console.error('Error adding as guest:', error);
        toast({
          title: "게스트 추가 실패",
          description: "다시 시도해주세요.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "게스트로 추가됨",
        description: `${app.name}님이 게스트 목록에 추가되었습니다.`,
      });

    } catch (err) {
      console.error('Add as guest error:', err);
      toast({
        title: "오류 발생",
        description: "게스트 추가 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleAttendance = async (app: DisplayApplication) => {
    if (!supabase) {
      toast({
        title: "연결 오류",
        description: "데이터베이스 연결이 없습니다.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const newUsedCount = (app.used_count || 0) + 1;
      const totalCount = app.plan === 'regular_4' ? 4 : 2;
      
      const { error } = await supabase
        .from('membership_applications')
        .update({ 
          used_count: newUsedCount,
          last_game_date: new Date().toISOString()
        })
        .eq('id', app.id);

      if (error) {
        console.error('Error updating attendance:', error);
        toast({
          title: "출석 처리 실패",
          description: "다시 시도해주세요.",
          variant: "destructive",
        });
        return;
      }

      // Update local state
      setApplications(prev => 
        prev.map(a => 
          a.id === app.id 
            ? { 
                ...a, 
                used_count: newUsedCount,
                remainingCount: Math.max(0, totalCount - newUsedCount)
              }
            : a
        )
      );

      // Show success toast with 3 second auto-dismiss
      toast({
        title: "출석이 되었습니다",
        description: `${app.name}님의 출석이 완료되었습니다.`,
      });

    } catch (err) {
      console.error('Attendance error:', err);
      toast({
        title: "오류 발생",
        description: "출석 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

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
          .select('id, name, phone, age, position, height_range, uniform_size, plan, target_month, used_count, group_color, payment_status, created_at, last_game_date')
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

        const displayApps: DisplayApplication[] = monthData.map(app => {
          const totalCount = app.plan === 'regular_4' ? 4 : 2;
          const usedCount = app.used_count || 0;
          const remainingCount = Math.max(0, totalCount - usedCount);
          
          return {
            ...app,
            cumulativeCount: phoneCounts[app.phone] || 1,
            planDisplay: getPlanDisplay(app.plan),
            remainingCount,
          };
        });

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
          <div className="mt-4">
            <a
              href="/guest-status"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md"
            >
              금주 게스트 명단 보기
              <ChevronRight className="h-5 w-5" />
            </a>
          </div>
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
                <TableHead
                  className={`font-bold ${groupHeaderColor || 'text-gray-900'} text-center w-14 px-0 py-3 whitespace-nowrap cursor-pointer hover:bg-gray-100`}
                  onClick={cycleGroupColor}
                >
                  그룹
                </TableHead>
                <TableHead className="font-bold text-gray-900 text-center px-1">이름</TableHead>
                {!isExpanded && (
                  <>
                    <TableHead className="font-bold text-gray-900 text-center px-1">나이</TableHead>
                    <TableHead className="font-bold text-gray-900 text-center px-1">키</TableHead>
                    <TableHead className="font-bold text-gray-900 text-center px-1">포지션</TableHead>
                    <TableHead className="font-bold text-gray-900 text-center px-1">남은 횟수</TableHead>
                  </>
                )}
                {isExpanded && (
                  <>
                    <TableHead className="font-bold text-gray-900 text-center px-1">사이즈</TableHead>
                    <TableHead className="font-bold text-gray-900 text-center px-1">폰번호</TableHead>
                    <TableHead className="font-bold text-gray-900 text-center px-1">신청횟수</TableHead>
                    <TableHead className="font-bold text-gray-900 text-center px-1">출석횟수</TableHead>
                  </>
                )}
                <TableHead className="font-bold text-gray-900 text-center px-1">게스트로 추가</TableHead>
                <TableHead className="font-bold text-gray-900 text-center px-1">
                  <div className="flex items-center justify-between">
                    <span>{isExpanded ? '누적' : '출석'}</span>
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
                    <TableCell className="px-0 py-3"><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
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
                        <TableCell className="px-1 py-2"><Skeleton className="h-4 w-16 mx-auto" /></TableCell>
                        <TableCell className="px-1 py-2"><Skeleton className="h-4 w-16 mx-auto" /></TableCell>
                      </>
                    )}
                    <TableCell className="px-1 py-2"><Skeleton className="h-4 w-20 mx-auto" /></TableCell>
                    <TableCell className="px-1 py-2"><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                  </TableRow>
                ))
              ) : applications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isExpanded ? 8 : 8} className="text-center text-gray-500 py-8">
                    해당 월에 등록된 멤버가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                applications.map((app) => {
                  const isSelected = selectedRows.has(app.id);
                  const colorClass = app.group_color || '';
                  return (
                    <TableRow key={app.id} data-testid={`row-member-${app.id}`}>
                      <TableCell className="text-center px-0 py-3 whitespace-nowrap">
                        <div className="flex justify-center">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleRowSelection(app.id)}
                          />
                        </div>
                      </TableCell>
                      <TableCell className={`text-center font-medium px-1 py-2 whitespace-nowrap ${colorClass}`}>{app.name}</TableCell>
                    {!isExpanded && (
                        <>
                          <TableCell className={`text-center px-1 py-2 whitespace-nowrap ${colorClass}`}>{app.age}</TableCell>
                          <TableCell className={`text-center px-1 py-2 whitespace-nowrap ${colorClass}`}>{formatHeightForDisplay(app.height_range)}</TableCell>
                          <TableCell className={`text-center px-1 py-2 whitespace-nowrap ${colorClass}`}>{formatPositionForDisplay(app.position)}</TableCell>
                          <TableCell className={`text-center font-semibold px-1 py-2 whitespace-nowrap ${colorClass || 'text-blue-600'}`}>{app.remainingCount}회</TableCell>
                        </>
                      )}
                      {isExpanded && (
                        <>
                          <TableCell className={`text-center px-1 py-2 whitespace-nowrap ${colorClass}`}>{app.uniform_size}</TableCell>
                          <TableCell className={`text-center px-1 py-2 whitespace-nowrap ${colorClass}`}>{app.phone.substring(0, 2)}</TableCell>
                          <TableCell className={`text-center px-1 py-2 whitespace-nowrap ${colorClass}`}>
                            <span className={`font-semibold ${colorClass || 'text-blue-600'}`}>{app.planDisplay}</span>
                          </TableCell>
                          <TableCell className={`text-center px-1 py-2 whitespace-nowrap ${colorClass}`}>
                            <span className={`font-semibold ${colorClass || 'text-purple-600'}`}>{app.used_count || 0}회</span>
                          </TableCell>
                        </>
                      )}
                      <TableCell className="text-center px-1 py-2 whitespace-nowrap">
                        {!isExpanded && (
                          <button
                            onClick={() => handleAddAsGuest(app)}
                            className="px-2 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 transition-colors"
                          >
                            출석
                          </button>
                        )}
                        {isExpanded && (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center px-1 py-2 whitespace-nowrap">
                        {isExpanded ? (
                          <span className={`font-semibold ${colorClass || 'text-green-600'}`}>{app.cumulativeCount}회차</span>
                        ) : (
                          <button
                            onClick={() => handleAttendance(app)}
                            className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                          >
                            출석
                          </button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
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

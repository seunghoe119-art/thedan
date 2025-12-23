import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getGameWeeks, formatPhoneForDisplay, formatHeightForDisplay, formatPositionForDisplay, type GameWeek } from '@/lib/gameWeekUtils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// 2초 이내 신청자를 같은 일행으로 그룹화
function groupByParty(applications: GuestApplication[]): GroupedApplication[] {
  if (applications.length === 0) return [];

  const grouped: GroupedApplication[] = [];
  let currentGroup: GuestApplication[] = [];
  let colorIndex = 0;

  applications.forEach((app, index) => {
    if (index === 0) {
      currentGroup.push(app);
      return;
    }

    const prevApp = applications[index - 1];
    const currentTime = new Date(app.applied_at_kst || app.applied_at).getTime();
    const prevTime = new Date(prevApp.applied_at_kst || prevApp.applied_at).getTime();
    const timeDiff = Math.abs(currentTime - prevTime) / 1000; // 초 단위

    if (timeDiff <= 2) {
      // 같은 일행
      currentGroup.push(app);
    } else {
      // 이전 그룹 완료
      if (currentGroup.length > 1) {
        // 일행이 2명 이상일 때만 색상 적용
        const color = GROUP_COLORS[colorIndex % GROUP_COLORS.length];
        currentGroup.forEach(member => {
          grouped.push({ ...member, groupColor: color });
        });
        colorIndex++;
      } else {
        // 혼자인 경우 색상 없음
        grouped.push({ ...currentGroup[0] });
      }
      currentGroup = [app];
    }
  });

  // 마지막 그룹 처리
  if (currentGroup.length > 1) {
    const color = GROUP_COLORS[colorIndex % GROUP_COLORS.length];
    currentGroup.forEach(member => {
      grouped.push({ ...member, groupColor: color });
    });
  } else if (currentGroup.length === 1) {
    grouped.push({ ...currentGroup[0] });
  }

  return grouped;
}

interface GuestApplication {
  id: string;
  name: string;
  age: string;
  height: string;
  position: string;
  phone: string;
  applied_at: string;
  applied_at_kst?: string;
}

interface GroupedApplication extends GuestApplication {
  groupColor?: string;
}

const GROUP_COLORS = [
  'text-red-600 font-bold',
  'text-yellow-600 font-bold',
  'text-green-600 font-bold',
  'text-blue-600 font-bold',
  'text-pink-600 font-bold',
];

export default function GuestApplicationBoard() {
  const [gameWeeks, setGameWeeks] = useState<GameWeek[]>([]);
  const [selectedWeekOffset, setSelectedWeekOffset] = useState(0); // 0 = 현재 주차, -1 = 지난주, 1 = 다음주
  const [applications, setApplications] = useState<GroupedApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hiddenRows, setHiddenRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    // 현재 주차 기준으로 앞뒤 20주씩 생성 (총 41주)
    const weeks = getGameWeeks(41);
    setGameWeeks(weeks);
  }, []);

  const toggleRowVisibility = (id: string) => {
    setHiddenRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  useEffect(() => {
    if (gameWeeks.length === 0) return;
    
    const fetchApplications = async () => {
      setIsLoading(true);
      
      if (!supabase) {
        console.error('Supabase client not initialized');
        setIsLoading(false);
        return;
      }

      // offset을 실제 인덱스로 변환 (현재 주차는 배열의 중간에 위치)
      const currentWeekIndex = Math.floor(gameWeeks.length / 2);
      const actualIndex = currentWeekIndex + selectedWeekOffset;
      const selectedWeek = gameWeeks[actualIndex];
      
      try {
        const { data, error } = await supabase
          .from('guest_applications')
          .select('id, name, age, height, position, phone, applied_at, applied_at_kst')
          .gte('applied_at', selectedWeek.startDateUTC)
          .lte('applied_at', selectedWeek.endDateUTC)
          .order('applied_at', { ascending: true });

        if (error) {
          console.error('Error fetching applications:', error);
          setApplications([]);
        } else {
          // 일행 그룹화 (2초 이내 신청자)
          const groupedData = groupByParty(data || []);
          setApplications(groupedData);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setApplications([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [gameWeeks, selectedWeekOffset]);

  return (
    <section className="py-16 bg-gradient-to-b from-gray-100 to-gray-200 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            금주 신청 현황
          </h1>
          <p className="text-gray-600">
            {gameWeeks.length > 0 && gameWeeks[Math.floor(gameWeeks.length / 2) + selectedWeekOffset]?.label || ''} 신청 명단입니다. (Supabase 연동)
          </p>
        </div>

        <div className="mb-6 flex items-center justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => {
              setSelectedWeekOffset((prev) => {
                const newOffset = prev - 1;
                // 범위 끝에 가까워지면 더 많은 주차 생성
                if (Math.abs(newOffset) >= Math.floor(gameWeeks.length / 2) - 5) {
                  const moreWeeks = getGameWeeks(gameWeeks.length + 20);
                  setGameWeeks(moreWeeks);
                }
                return newOffset;
              });
            }}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            이전
          </Button>
          <div className="min-w-[200px] text-center font-semibold text-lg">
            {gameWeeks.length > 0 && gameWeeks[Math.floor(gameWeeks.length / 2) + selectedWeekOffset]?.label || ''}
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedWeekOffset((prev) => {
                const newOffset = prev + 1;
                // 범위 끝에 가까워지면 더 많은 주차 생성
                if (Math.abs(newOffset) >= Math.floor(gameWeeks.length / 2) - 5) {
                  const moreWeeks = getGameWeeks(gameWeeks.length + 20);
                  setGameWeeks(moreWeeks);
                }
                return newOffset;
              });
            }}
            className="flex items-center gap-2"
          >
            다음
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-bold text-gray-900 text-center w-20">숨김처리</TableHead>
                <TableHead className="font-bold text-gray-900 text-center">이름</TableHead>
                <TableHead className="font-bold text-gray-900 text-center">나이</TableHead>
                <TableHead className="font-bold text-gray-900 text-center">키</TableHead>
                <TableHead className="font-bold text-gray-900 text-center">포지션</TableHead>
                <TableHead className="font-bold text-gray-900 text-center">연락처</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28 mx-auto" /></TableCell>
                  </TableRow>
                ))
              ) : applications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                    해당 주차에 신청 내역이 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                applications.map((app) => {
                  const isHidden = hiddenRows.has(app.id);
                  const textColorClass = isHidden ? 'text-white' : '';
                  return (
                    <TableRow key={app.id} data-testid={`row-guest-${app.id}`}>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <Checkbox
                            checked={isHidden}
                            onCheckedChange={() => toggleRowVisibility(app.id)}
                          />
                        </div>
                      </TableCell>
                      <TableCell className={`text-center font-medium ${app.groupColor || ''} ${textColorClass}`}>{app.name}</TableCell>
                      <TableCell className={`text-center ${app.groupColor || ''} ${textColorClass}`}>{app.age}</TableCell>
                      <TableCell className={`text-center ${app.groupColor || ''} ${textColorClass}`}>{formatHeightForDisplay(app.height)}</TableCell>
                      <TableCell className={`text-center ${app.groupColor || ''} ${textColorClass}`}>{formatPositionForDisplay(app.position)}</TableCell>
                      <TableCell className={`text-center ${app.groupColor || ''} ${textColorClass}`}>{formatPhoneForDisplay(app.phone)}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {!isLoading && applications.length > 0 && (
          <div className="mt-4 text-center text-sm text-gray-500">
            총 {applications.length}명 신청
          </div>
        )}
      </div>
    </section>
  );
}

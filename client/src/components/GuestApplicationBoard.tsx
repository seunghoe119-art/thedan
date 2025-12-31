import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getGameWeeks, formatPhoneForDisplay, formatHeightForDisplay, formatPositionForDisplay, type GameWeek } from '@/lib/gameWeekUtils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toZonedTime } from 'date-fns-tz';
import { addDays, getDay } from 'date-fns';

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
  is_hidden?: boolean;
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
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [gameDateString, setGameDateString] = useState<string>("");
  const [groupHeaderColor, setGroupHeaderColor] = useState<string>('');
  const [manualColors, setManualColors] = useState<Map<string, string>>(new Map());
  const [totalSlots, setTotalSlots] = useState<number>(8);
  const [inputSlots, setInputSlots] = useState<string>('8');
  const [currentWeekStartDate, setCurrentWeekStartDate] = useState<string>('');

  const KST_TIMEZONE = 'Asia/Seoul';

  // 현재 주차의 금요일 날짜를 계산하는 함수
  const getCurrentWeekFridayDate = (offset: number = 0): string => {
    const nowUTC = new Date();
    const nowKST = toZonedTime(nowUTC, KST_TIMEZONE);

    const dayOfWeek = getDay(nowKST);
    const hour = nowKST.getHours();

    let daysUntilFriday: number;
    const isFriday = dayOfWeek === 5;
    const isPastDeadline = hour >= 21;

    if (isFriday && !isPastDeadline) {
      daysUntilFriday = 0;
    } else if (isFriday && isPastDeadline) {
      daysUntilFriday = 7;
    } else if (dayOfWeek === 6) {
      daysUntilFriday = 6;
    } else if (dayOfWeek === 0) {
      daysUntilFriday = 5;
    } else {
      daysUntilFriday = 5 - dayOfWeek;
    }

    const fridayKST = addDays(nowKST, daysUntilFriday + (offset * 7));
    const month = fridayKST.getMonth() + 1;
    const day = fridayKST.getDate();

    return `${month}월 ${day}일`;
  };

  useEffect(() => {
    // 현재 주차 기준으로 앞뒤 20주씩 생성 (총 41주)
    const weeks = getGameWeeks(41);
    setGameWeeks(weeks);
  }, []);

  useEffect(() => {
    setGameDateString(getCurrentWeekFridayDate(selectedWeekOffset));
  }, [selectedWeekOffset]);

  const toggleRowVisibility = async (id: string) => {
    const isCurrentlyHidden = hiddenRows.has(id);
    const newHiddenState = !isCurrentlyHidden;

    // Update local state immediately for better UX
    setHiddenRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });

    // Update Supabase
    if (supabase) {
      const { error } = await supabase
        .from('guest_applications')
        .update({ is_hidden: newHiddenState })
        .eq('id', id);

      if (error) {
        console.error('Error updating hidden state:', error);
        // Revert local state if update failed
        setHiddenRows((prev) => {
          const newSet = new Set(prev);
          if (isCurrentlyHidden) {
            newSet.add(id);
          } else {
            newSet.delete(id);
          }
          return newSet;
        });
      }
    }
  };

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

  const updateWeeklySlots = async () => {
    const slots = parseInt(inputSlots);
    if (isNaN(slots) || slots < 0) {
      return;
    }

    if (!supabase || !currentWeekStartDate) return;

    try {
      const { data: existingData } = await supabase
        .from('weekly_guest_slots')
        .select('*')
        .eq('week_start_date', currentWeekStartDate)
        .single();

      if (existingData) {
        await supabase
          .from('weekly_guest_slots')
          .update({ total_slots: slots, updated_at: new Date().toISOString() })
          .eq('week_start_date', currentWeekStartDate);
      } else {
        await supabase
          .from('weekly_guest_slots')
          .insert({ week_start_date: currentWeekStartDate, total_slots: slots });
      }

      setTotalSlots(slots);
    } catch (err) {
      console.error('Error updating weekly slots:', err);
    }
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

    // 선택된 행이 있으면 그 행들의 applied_at을 동일하게 변경
    if (selectedRows.size > 0) {
      const selectedApps = applications.filter(app => selectedRows.has(app.id));
      if (selectedApps.length === 0) return;

      // 첫 번째 선택된 항목의 시간을 기준으로 사용
      const targetTime = selectedApps[0].applied_at;

      // Supabase에서 모든 선택된 행들의 applied_at을 동일하게 업데이트
      if (supabase) {
        try {
          const updates = selectedApps.map(app => 
            supabase
              .from('guest_applications')
              .update({ applied_at: targetTime })
              .eq('id', app.id)
          );

          await Promise.all(updates);

          // 데이터 다시 불러오기
          const currentWeekIndex = Math.floor(gameWeeks.length / 2);
          const actualIndex = currentWeekIndex + selectedWeekOffset;
          const selectedWeek = gameWeeks[actualIndex];

          const { data, error } = await supabase
            .from('guest_applications')
            .select('id, name, age, height, position, phone, applied_at, applied_at_kst, is_hidden')
            .gte('applied_at', selectedWeek.startDateUTC)
            .lte('applied_at', selectedWeek.endDateUTC)
            .order('applied_at', { ascending: true });

          if (!error && data) {
            const groupedData = groupByParty(data);
            const sortedData = groupedData.sort((a, b) => {
              const aHidden = a.is_hidden ? 1 : 0;
              const bHidden = b.is_hidden ? 1 : 0;
              return aHidden - bHidden;
            });
            setApplications(sortedData);
          }
        } catch (err) {
          console.error('Error updating applied_at times:', err);
        }
      }
    }
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

      // Set current week start date for slots tracking
      setCurrentWeekStartDate(selectedWeek.startDateUTC);

      try {
        // Fetch applications
        const { data, error } = await supabase
          .from('guest_applications')
          .select('id, name, age, height, position, phone, applied_at, applied_at_kst, is_hidden')
          .gte('applied_at', selectedWeek.startDateUTC)
          .lte('applied_at', selectedWeek.endDateUTC)
          .order('applied_at', { ascending: true });

        if (error) {
          console.error('Error fetching applications:', error);
          setApplications([]);
        } else {
          // 일행 그룹화 (2초 이내 신청자)
          const groupedData = groupByParty(data || []);

          // Sort: non-hidden first, then hidden at the bottom
          const sortedData = groupedData.sort((a, b) => {
            const aHidden = a.is_hidden ? 1 : 0;
            const bHidden = b.is_hidden ? 1 : 0;
            return aHidden - bHidden;
          });

          setApplications(sortedData);

          // Set hidden rows from database
          const hiddenIds = new Set(
            (data || [])
              .filter(app => app.is_hidden)
              .map(app => app.id)
          );
          setHiddenRows(hiddenIds);
        }

        // Fetch weekly guest slots
        const { data: slotsData } = await supabase
          .from('weekly_guest_slots')
          .select('total_slots')
          .eq('week_start_date', selectedWeek.startDateUTC)
          .single();

        if (slotsData) {
          setTotalSlots(slotsData.total_slots);
          setInputSlots(slotsData.total_slots.toString());
        } else {
          setTotalSlots(8);
          setInputSlots('8');
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
          <div className="mt-4">
            <a
              href="/team-status"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-md"
            >
              클럽회원명단 보기
              <ChevronRight className="h-5 w-5" />
            </a>
          </div>
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
            {gameDateString}, (금)
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

        {/* 정규 멤버 게스트 목록 표시 */}
        {applications.length > 0 && applications.some(app => app.name.includes('(정규)')) && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
            <div className="bg-yellow-50 p-4 border-b border-yellow-200">
              <h3 className="font-bold text-lg text-yellow-900 mb-3">등록팀원 게스트 출석</h3>
              <div className="space-y-2">
                {applications
                  .filter(app => app.name.includes('(정규)'))
                  .reverse()
                  .map((app, index) => (
                    <div 
                      key={app.id}
                      className="flex items-center justify-between bg-yellow-100 rounded p-3 border border-yellow-300"
                    >
                      <div className="flex-1">
                        <span className="font-semibold text-yellow-900 text-sm">
                          {applications.filter(a => a.name.includes('(정규)')).length - index}. {app.name}
                        </span>
                      </div>
                      <div className="text-xs text-yellow-700">
                        {app.age} · {formatHeightForDisplay(app.height)} · {formatPositionForDisplay(app.position)}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-bold text-gray-900 text-center w-14 px-0 py-3 whitespace-nowrap">숨김</TableHead>
                <TableHead
                  className={`font-bold ${groupHeaderColor || 'text-gray-900'} text-center w-14 px-0 py-3 whitespace-nowrap cursor-pointer hover:bg-gray-100`}
                  onClick={cycleGroupColor}
                >
                  그룹
                </TableHead>
                <TableHead className="font-bold text-gray-900 text-center px-0 py-3 whitespace-nowrap">이름</TableHead>
                <TableHead className="font-bold text-gray-900 text-center px-0 py-3 whitespace-nowrap">나이</TableHead>
                <TableHead className="font-bold text-gray-900 text-center px-0 py-3 whitespace-nowrap">키</TableHead>
                <TableHead className="font-bold text-gray-900 text-center px-0 py-3 whitespace-nowrap">포지션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell className="px-0 py-3"><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                    <TableCell className="px-0 py-3"><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                    <TableCell className="px-0 py-3"><Skeleton className="h-4 w-16 mx-auto" /></TableCell>
                    <TableCell className="px-0 py-3"><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                    <TableCell className="px-0 py-3"><Skeleton className="h-4 w-16 mx-auto" /></TableCell>
                    <TableCell className="px-0 py-3"><Skeleton className="h-4 w-20 mx-auto" /></TableCell>
                  </TableRow>
                ))
              ) : applications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-12 px-0 whitespace-nowrap">
                    해당 주차에 신청 내역이 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                applications.map((app) => {
                  const isHidden = hiddenRows.has(app.id);
                  const isSelected = selectedRows.has(app.id);
                  const colorClass = isHidden ? 'text-white' : (app.groupColor || '');
                  return (
                    <TableRow key={app.id} data-testid={`row-guest-${app.id}`}>
                      <TableCell className="text-center px-0 py-3 whitespace-nowrap">
                        <div className="flex justify-center">
                          <Checkbox
                            checked={isHidden}
                            onCheckedChange={() => toggleRowVisibility(app.id)}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-center px-0 py-3 whitespace-nowrap">
                        <div className="flex justify-center">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleRowSelection(app.id)}
                          />
                        </div>
                      </TableCell>
                      <TableCell className={`text-center font-medium px-0 py-3 whitespace-nowrap ${colorClass}`}>{app.name}</TableCell>
                      <TableCell className={`text-center px-0 py-3 whitespace-nowrap ${colorClass}`}>{app.age}</TableCell>
                      <TableCell className={`text-center px-0 py-3 whitespace-nowrap ${colorClass}`}>{formatHeightForDisplay(app.height)}</TableCell>
                      <TableCell className={`text-center px-0 py-3 whitespace-nowrap ${colorClass}`}>{formatPositionForDisplay(app.position)}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {!isLoading && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-center gap-4">
              <div className="text-center text-sm text-gray-500">
                총 {applications.filter(app => !hiddenRows.has(app.id)).length}명 신청
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">/</span>
                <input
                  type="number"
                  min="0"
                  value={inputSlots}
                  onChange={(e) => setInputSlots(e.target.value)}
                  onBlur={updateWeeklySlots}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      updateWeeklySlots();
                    }
                  }}
                  className="w-16 px-2 py-1 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <p className="text-lg font-semibold text-blue-900">
                {Math.max(0, totalSlots - applications.filter(app => !hiddenRows.has(app.id)).length)}명 게스트 모집중.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
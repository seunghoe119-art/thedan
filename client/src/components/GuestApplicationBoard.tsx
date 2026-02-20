import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getGameWeeks, formatPhoneForDisplay, formatHeightForDisplay, formatPositionForDisplay, type GameWeek } from '@/lib/gameWeekUtils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronLeft, ChevronRight, X, Calculator, UserX } from 'lucide-react';
import { toZonedTime } from 'date-fns-tz';
import { addDays, getDay } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
  'text-purple-600 font-bold',
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editType, setEditType] = useState<'name' | 'time' | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [isTimeEditActive, setIsTimeEditActive] = useState(false);
  const [manualColors, setManualColors] = useState<Map<string, string>>(new Map());
  const [totalSlots, setTotalSlots] = useState<number>(18);
  const [inputSlots, setInputSlots] = useState<string>('18');
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

  const [lastUnhiddenId, setLastUnhiddenId] = useState<string | null>(null);
  const [absenteeList, setAbsenteeList] = useState<any[]>([]);
  const [isAbsenteeLoading, setIsAbsenteeLoading] = useState(false);

  const fetchAbsenteeList = async () => {
    if (!supabase) return;
    setIsAbsenteeLoading(true);
    const { data, error } = await supabase
      .from('absentee_list')
      .select('*')
      .order('created_at', { ascending: true });
    if (!error && data) setAbsenteeList(data);
    setIsAbsenteeLoading(false);
  };

  useEffect(() => {
    fetchAbsenteeList();
  }, []);

  const handleAddAbsentee = async (type: string) => {
    if (!supabase) return;
    const name = window.prompt('이름을 입력하세요:');
    if (!name) return;
    
    const { error } = await supabase
      .from('absentee_list')
      .insert([{ name, type, count: 1 }]);
    
    if (!error) fetchAbsenteeList();
  };

  const handleUpdateAbsenteeCount = async (id: string, newCount: number) => {
    if (!supabase || newCount < 1) return;
    const { error } = await supabase
      .from('absentee_list')
      .update({ count: newCount })
      .eq('id', id);
    if (!error) fetchAbsenteeList();
  };

  const handleDeleteAbsentee = async (id: string) => {
    if (!supabase || !window.confirm('삭제하시겠습니까?')) return;
    const { error } = await supabase
      .from('absentee_list')
      .delete()
      .eq('id', id);
    if (!error) fetchAbsenteeList();
  };
  const [calcValues, setCalcValues] = useState({
    icnfCount: 0,
    icnfPrice: 5000,
    regCount: 0,
    regPrice: 5000,
    guestCount: 0,
    guestPrice: 8000,
    friendCount: 0,
    friendPrice: 0
  });

  useEffect(() => {
    const activeApps = applications.filter(app => !hiddenRows.has(app.id));
    setCalcValues(prev => ({
      ...prev,
      icnfCount: activeApps.filter(app => app.name.includes('(ICNF)')).length,
      regCount: activeApps.filter(app => app.name.includes('(정규)')).length,
      guestCount: activeApps.filter(app => !app.name.includes('(ICNF)') && !app.name.includes('(정규)') && !app.name.includes('(지인)')).length,
      friendCount: activeApps.filter(app => app.name.includes('(지인)')).length
    }));
  }, [applications, hiddenRows]);

  const handleCalcChange = (field: keyof typeof calcValues, value: string) => {
    const numValue = parseInt(value) || 0;
    setCalcValues(prev => ({ ...prev, [field]: numValue }));
  };

  const toggleRowVisibility = async (id: string) => {
    const isNowHidden = !hiddenRows.has(id);
    const app = applications.find(a => a.id === id);
    
    if (isNowHidden) {
      setLastUnhiddenId(null);
    } else {
      setLastUnhiddenId(id);
      setTimeout(() => setLastUnhiddenId(null), 3000);
    }

    // ICNF 멤버인 경우 icn_members 테이블의 카운트와 이력 조정
    if (app && app.name.includes('(ICNF)') && supabase) {
      try {
        const cleanName = app.name.replace('(ICNF)', '');
        const { data: member } = await supabase
          .from('icn_members')
          .select('*')
          .eq('name', cleanName)
          .single();
          
        if (member) {
          const gameDayKST = new Date(new Date(app.applied_at).getTime() + (9 * 60 * 60 * 1000));
          const formattedDate = gameDayKST.toISOString().substring(0, 10);
          
          let updatedHistory = member.attendance_history || [];
          let firstHalfCount = member.first_half_count || 0;
          let secondHalfCount = member.second_half_count || 0;
          
          const month = gameDayKST.getMonth() + 1;
          const isFirstHalf = month >= 1 && month <= 6;
          
          if (isNowHidden) {
            // 숨김 처리 시: 이력에서 제거 및 카운트 감소
            updatedHistory = updatedHistory.filter((d: string) => d.split(' ')[0] !== formattedDate);
            if (isFirstHalf) firstHalfCount = Math.max(0, firstHalfCount - 1);
            else secondHalfCount = Math.max(0, secondHalfCount - 1);
          } else {
            // 숨김 해제 시: 이력에 추가 및 카운트 증가 (중복 방지)
            if (!updatedHistory.some((d: string) => d.split(' ')[0] === formattedDate)) {
              updatedHistory = [formattedDate, ...updatedHistory];
              if (isFirstHalf) firstHalfCount += 1;
              else secondHalfCount += 1;
            }
          }
          
          await supabase
            .from('icn_members')
            .update({
              attendance_history: updatedHistory,
              first_half_count: firstHalfCount,
              second_half_count: secondHalfCount
            })
            .eq('id', member.id);
        }
      } catch (err) {
        console.error('Error updating ICN member attendance on visibility toggle:', err);
      }
    }

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
        .update({ is_hidden: isNowHidden })
        .eq('id', id);

      if (error) {
        console.error('Error updating hidden state:', error);
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

  const deleteApplication = async (id: string) => {
    if (!supabase) return;
    
    const { error } = await supabase
      .from('guest_applications')
      .delete()
      .eq('id', id);

    if (!error) {
      setApplications(prev => prev.filter(app => app.id !== id));
    } else {
      console.error('Error deleting application:', error);
    }
  };

  const handleNameUpdate = async (id: string, newName: string) => {
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from('guest_applications')
        .update({ name: newName })
        .eq('id', id);

      if (error) throw error;

      setApplications(prev =>
        prev.map(app => (app.id === id ? { ...app, name: newName } : app))
      );
      setEditingId(null);
      setEditType(null);
    } catch (err) {
      console.error('Error updating name:', err);
    }
  };

  const handleTimeUpdate = async (id: string, newTime: string) => {
    if (!supabase) return;
    try {
      let normalizedTime = newTime.replace(/오전/g, 'AM').replace(/오후/g, 'PM');
      const date = new Date(normalizedTime);
      if (isNaN(date.getTime())) {
        console.error('Invalid date format');
        return;
      }

      const { error } = await supabase
        .from('guest_applications')
        .update({ applied_at: date.toISOString() })
        .eq('id', id);

      if (error) throw error;

      setApplications(prev =>
        prev.map(app => (app.id === id ? { ...app, applied_at: date.toISOString() } : app))
      );
      setEditingId(null);
      setEditType(null);
    } catch (err) {
      console.error('Error updating time:', err);
    }
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
      'text-purple-600 font-bold',
      '', // 검정(기본)
    ];

    const currentIndex = colorCycle.indexOf(groupHeaderColor);
    const nextIndex = (currentIndex + 1) % colorCycle.length;
    const nextColor = colorCycle[nextIndex];
    
    // UI 우선 반영
    setGroupHeaderColor(nextColor);

    // 선택된 행이 있으면 그 행들의 applied_at을 변경
    if (selectedRows.size > 0) {
      const selectedApps = applications.filter(app => selectedRows.has(app.id));
      if (selectedApps.length === 0) return;

      let targetTime: string;
      if (nextColor === '') {
        targetTime = new Date().toISOString();
      } else {
        targetTime = selectedApps[0].applied_at;
      }

      if (supabase) {
        try {
          const updates = selectedApps.map((app, index) => {
            const finalTime = nextColor === '' 
              ? new Date(new Date(targetTime).getTime() + (index * 5000)).toISOString() 
              : targetTime;
              
            return supabase
              .from('guest_applications')
              .update({ applied_at: finalTime })
              .eq('id', app.id);
          });

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
      if (gameWeeks.length === 0) return;
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
          // 불참자 명단을 가져와서 가상 신청자로 변환
          const { data: absentees } = await supabase
            .from('absentee_list')
            .select('*');
          
          const virtualApplications = (absentees || [])
            .filter((a: any) => {
              // 해당 주차에 동일한 이름의 신청자가 있고, 숨김 처리가 되지 않은 경우에만 표시
              // 또한 해당 신청자가 '정규'나 'ICNF'가 아닌 일반 게스트인 경우에만 불참자 처리 (선택 사항)
              return (data || []).some(app => app.name === a.name && !app.is_hidden);
            })
            .map((a: any) => {
              // 원본 신청 데이터를 찾아서 필요한 정보(groupColor 등)를 가져옴
              const originalApp = (data || []).find(app => app.name === a.name && !app.is_hidden);
              
              return {
                id: `absentee-${a.id}`,
                name: `${a.name} (불참자)`,
                age: a.type === 'noshow' ? '무단노쇼' : (a.type === 'refund' ? `환불 ${a.count}회` : `당일불참 ${a.count}회`),
                type: a.type,
                height: originalApp?.height || '0',
                position: originalApp?.position || '',
                phone: originalApp?.phone || '',
                groupColor: originalApp?.groupColor,
                applied_at: new Date(2099, 0, 1).toISOString(), // 항상 최하단 정렬을 위한 미래 시간
                is_hidden: false
              };
            });

          const allApps = [...(data || []), ...virtualApplications];

          // 일행 그룹화 (2초 이내 신청자)
          const groupedData = groupByParty(allApps);

          // Sort: non-hidden first, then hidden at the bottom
          const sortedData = groupedData.sort((a, b) => {
            const aHidden = a.is_hidden ? 1 : 0;
            const bHidden = b.is_hidden ? 1 : 0;
            if (aHidden !== bHidden) return aHidden - bHidden;

            // 불참자 여부 정렬 (불참자가 최하단)
            const aIsAbsentee = a.name.includes('(불참자)');
            const bIsAbsentee = b.name.includes('(불참자)');
            if (!aIsAbsentee && bIsAbsentee) return -1;
            if (aIsAbsentee && !bIsAbsentee) return 1;

            return new Date(a.applied_at).getTime() - new Date(b.applied_at).getTime();
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
          setTotalSlots(18);
          setInputSlots('18');
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
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            <a
              href="/team-status"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-md"
            >
              클럽회원명단 보기
              <ChevronRight className="h-5 w-5" />
            </a>
            <a
              href="/mainteam"
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold shadow-md"
            >
              ICNF 보기
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
                      <div className="flex-1 flex items-center gap-2">
                        <button
                          onClick={() => deleteApplication(app.id)}
                          className="text-yellow-700 hover:text-red-600 transition-colors p-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
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
                [...applications]
                  .sort((a, b) => {
                    const aIsHidden = hiddenRows.has(a.id);
                    const bIsHidden = hiddenRows.has(b.id);
                    
                    // 1. 숨김 여부 우선 정렬 (숨겨진 항목이 뒤로)
                    if (!aIsHidden && bIsHidden) return -1;
                    if (aIsHidden && !bIsHidden) return 1;
                    
                    // 2. 불참자 여부 정렬 (불참자가 최하단)
                    const aIsAbsentee = a.name.includes('(불참자)');
                    const bIsAbsentee = b.name.includes('(불참자)');
                    if (!aIsAbsentee && bIsAbsentee) return -1;
                    if (aIsAbsentee && !bIsAbsentee) return 1;

                    // 3. ICNF 여부 정렬 (ICNF 항목이 앞으로)
                    const aIsICNF = a.name.includes('(ICNF)');
                    const bIsICNF = b.name.includes('(ICNF)');
                    if (aIsICNF && !bIsICNF) return -1;
                    if (!aIsICNF && bIsICNF) return 1;
                    
                    return 0;
                  })
                  .map((app) => {
                    const isHidden = hiddenRows.has(app.id);
                    const isSelected = selectedRows.has(app.id);
                    const isICNF = app.name.includes('(ICNF)');
                    const isAbsentee = app.name.includes('(불참자)');
                    const colorClass = isHidden ? 'text-white' : (app.groupColor || '');
                    const isJustUnhidden = lastUnhiddenId === app.id;

                    if (isAbsentee) {
                      let bgColor = 'bg-black';
                      let textColor = 'text-white';
                      
                      if (app.type === 'refund') {
                        bgColor = 'bg-gray-400';
                        textColor = 'text-white';
                      } else if (app.type === 'absent') {
                        bgColor = 'bg-black';
                        textColor = 'text-white';
                      } else if (app.type === 'noshow') {
                        bgColor = 'bg-black';
                        textColor = 'text-red-500';
                      }

                      return (
                        <TableRow 
                          key={app.id} 
                          className="transition-all duration-500"
                        >
                          <TableCell colSpan={6} className="p-0">
                            <div className={`flex w-full items-center ${bgColor} ${textColor} py-3`}>
                              <div className="w-14 text-center px-0">
                                <Checkbox
                                  checked={isHidden}
                                  onCheckedChange={() => toggleRowVisibility(app.id)}
                                  className="border-white data-[state=checked]:bg-white data-[state=checked]:text-black"
                                />
                              </div>
                              <div className="w-14 text-center px-0">
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() => toggleRowSelection(app.id)}
                                  className="border-white data-[state=checked]:bg-white data-[state=checked]:text-black"
                                />
                              </div>
                              <div className="flex-1 text-center font-bold px-0">
                                {app.name.replace(' (불참자)', '')}
                              </div>
                              <div className="flex-1 text-center px-0">{app.age}</div>
                              <div className="flex-1 text-center px-0">-</div>
                              <div className="flex-1 text-center px-0">-</div>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    }

                    return (
                      <TableRow 
                        key={app.id} 
                        data-testid={`row-guest-${app.id}`}
                        className={`transition-all duration-500 ${isJustUnhidden ? 'bg-blue-100 animate-pulse' : ''}`}
                      >
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
                        <TableCell 
                          className={`text-center font-medium px-0 py-3 whitespace-nowrap ${isTimeEditActive ? 'cursor-pointer hover:bg-gray-100 rounded' : ''} ${isICNF && !isHidden ? 'bg-red-600 text-white font-bold' : colorClass}`}
                          onClick={() => {
                            if (!isTimeEditActive) return;
                            setEditingId(app.id);
                            setEditType('name');
                            setEditValue(app.name);
                          }}
                        >
                          {editingId === app.id && editType === 'name' ? (
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => {
                                if (editValue !== app.name) {
                                  handleNameUpdate(app.id, editValue);
                                } else {
                                  setEditingId(null);
                                  setEditType(null);
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleNameUpdate(app.id, editValue);
                                if (e.key === 'Escape') {
                                  setEditingId(null);
                                  setEditType(null);
                                }
                              }}
                              autoFocus
                              className="w-full px-1 py-0.5 border rounded text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            app.name
                          )}
                        </TableCell>
                      <TableCell 
                        className={`text-center px-0 py-3 whitespace-nowrap ${isTimeEditActive ? 'cursor-pointer hover:bg-gray-100 rounded' : ''} ${colorClass}`}
                        onClick={() => {
                          if (!isTimeEditActive) return;
                          setEditingId(app.id);
                          setEditType('time');
                          // ISO 형식을 사용자가 수정하기 편한 YYYY-MM-DD HH:mm:ss 형식으로 변환
                          const date = new Date(app.applied_at_kst || app.applied_at);
                          const year = date.getFullYear();
                          const month = String(date.getMonth() + 1).padStart(2, '0');
                          const day = String(date.getDate()).padStart(2, '0');
                          const hours = String(date.getHours()).padStart(2, '0');
                          const minutes = String(date.getMinutes()).padStart(2, '0');
                          const seconds = String(date.getSeconds()).padStart(2, '0');
                          setEditValue(`${year}-${month}-${day} ${hours}:${minutes}:${seconds}`);
                        }}
                      >
                        {editingId === app.id && editType === 'time' ? (
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => {
                              if (editValue) handleTimeUpdate(app.id, editValue);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && editValue) handleTimeUpdate(app.id, editValue);
                              if (e.key === 'Escape') {
                                setEditingId(null);
                                setEditType(null);
                              }
                            }}
                            autoFocus
                            className="w-full px-1 py-0.5 border rounded text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          app.age
                        )}
                      </TableCell>
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
            <div className="flex justify-center">
              <button 
                onClick={() => setIsTimeEditActive(!isTimeEditActive)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  isTimeEditActive 
                    ? 'bg-red-600 text-white shadow-md hover:bg-red-700' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                이름/등록시간 변경
              </button>
            </div>
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

            <div className="flex justify-center pt-2 gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2 bg-white hover:bg-gray-50 border-gray-300 shadow-sm"
                  >
                    <Calculator className="h-4 w-4 text-blue-600" />
                    입금 계산기
                  </Button>
                </DialogTrigger>
                {/* ... existing dialog content ... */}
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2 bg-gray-900 text-white hover:bg-gray-800 border-gray-700 shadow-sm"
                  >
                    <UserX className="h-4 w-4" />
                    불참자 관리
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold">불참자 명단 관리</DialogTitle>
                    <p className="text-sm text-gray-500">주차에 상관없이 유지되는 명단입니다.</p>
                  </DialogHeader>
                  <div className="py-4 space-y-6">
                    {/* 환불 게스트 */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-sm text-blue-600">환불 게스트</h4>
                        <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => handleAddAbsentee('refund')}>+ 추가</Button>
                      </div>
                      <div className="space-y-1">
                        {absenteeList.filter(a => a.type === 'refund').map(item => (
                          <div key={item.id} className="flex justify-between items-center bg-gray-50 p-2 rounded text-sm">
                            <span>{item.name}</span>
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleUpdateAbsenteeCount(item.id, item.count - 1)}>-</button>
                              <span className="font-bold w-4 text-center">{item.count}회</span>
                              <button onClick={() => handleUpdateAbsenteeCount(item.id, item.count + 1)}>+</button>
                              <button onClick={() => handleDeleteAbsentee(item.id)} className="text-red-500 ml-2">×</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 당일 불참 게스트 */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-sm text-orange-600">당일 불참 게스트</h4>
                        <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => handleAddAbsentee('absent')}>+ 추가</Button>
                      </div>
                      <div className="space-y-1">
                        {absenteeList.filter(a => a.type === 'absent').map(item => (
                          <div key={item.id} className="flex justify-between items-center bg-gray-50 p-2 rounded text-sm">
                            <span>{item.name}</span>
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleUpdateAbsenteeCount(item.id, item.count - 1)}>-</button>
                              <span className="font-bold w-4 text-center">{item.count}회</span>
                              <button onClick={() => handleUpdateAbsenteeCount(item.id, item.count + 1)}>+</button>
                              <button onClick={() => handleDeleteAbsentee(item.id)} className="text-red-500 ml-2">×</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 무단노쇼 */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-sm text-red-600">무단노쇼</h4>
                        <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => handleAddAbsentee('noshow')}>+ 추가</Button>
                      </div>
                      <div className="space-y-1">
                        {absenteeList.filter(a => a.type === 'noshow').map(item => (
                          <div key={item.id} className="flex justify-between items-center bg-gray-50 p-2 rounded text-sm">
                            <span>{item.name}</span>
                            <button onClick={() => handleDeleteAbsentee(item.id)} className="text-red-500">×</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
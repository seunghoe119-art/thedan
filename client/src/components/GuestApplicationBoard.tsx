import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getGameWeeks, formatPhoneForDisplay, formatHeightForDisplay, formatPositionForDisplay, type GameWeek } from '@/lib/gameWeekUtils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

interface GuestApplication {
  id: string;
  name: string;
  age: string;
  height: string;
  position: string;
  phone: string;
  applied_at: string;
}

export default function GuestApplicationBoard() {
  const [gameWeeks, setGameWeeks] = useState<GameWeek[]>([]);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);
  const [applications, setApplications] = useState<GuestApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const weeks = getGameWeeks(8);
    setGameWeeks(weeks);
  }, []);

  useEffect(() => {
    if (gameWeeks.length === 0) return;
    
    const fetchApplications = async () => {
      setIsLoading(true);
      
      if (!supabase) {
        console.error('Supabase client not initialized');
        setIsLoading(false);
        return;
      }

      const selectedWeek = gameWeeks[selectedWeekIndex];
      
      try {
        const { data, error } = await supabase
          .from('guest_applications')
          .select('id, name, age, height, position, phone, applied_at')
          .gte('applied_at', selectedWeek.startDateUTC)
          .lte('applied_at', selectedWeek.endDateUTC)
          .order('applied_at', { ascending: true });

        if (error) {
          console.error('Error fetching applications:', error);
          setApplications([]);
        } else {
          setApplications(data || []);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setApplications([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [gameWeeks, selectedWeekIndex]);

  return (
    <section className="py-16 bg-gradient-to-b from-gray-100 to-gray-200 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            금주 신청 현황
          </h1>
          <p className="text-gray-600">
            {gameWeeks[selectedWeekIndex]?.label || ''} 신청 명단입니다. (Supabase 연동)
          </p>
        </div>

        <div className="mb-6">
          <Select
            value={selectedWeekIndex.toString()}
            onValueChange={(value) => setSelectedWeekIndex(parseInt(value))}
          >
            <SelectTrigger className="w-full md:w-64 bg-white" data-testid="select-week">
              <SelectValue placeholder="주차 선택" />
            </SelectTrigger>
            <SelectContent>
              {gameWeeks.map((week, index) => (
                <SelectItem key={index} value={index.toString()} data-testid={`select-week-${index}`}>
                  {week.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
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
                    <TableCell><Skeleton className="h-4 w-16 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28 mx-auto" /></TableCell>
                  </TableRow>
                ))
              ) : applications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                    해당 주차에 신청 내역이 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                applications.map((app) => (
                  <TableRow key={app.id} data-testid={`row-guest-${app.id}`}>
                    <TableCell className="text-center font-medium">{app.name}</TableCell>
                    <TableCell className="text-center">{app.age}</TableCell>
                    <TableCell className="text-center">{formatHeightForDisplay(app.height)}</TableCell>
                    <TableCell className="text-center">{formatPositionForDisplay(app.position)}</TableCell>
                    <TableCell className="text-center">{formatPhoneForDisplay(app.phone)}</TableCell>
                  </TableRow>
                ))
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

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronRight } from 'lucide-react';
import { formatHeightForDisplay, formatPositionForDisplay } from '@/lib/gameWeekUtils';
import { useToast } from '@/hooks/use-toast';

interface IcnMember {
  id: string;
  name: string;
  phone?: string;
  age?: string;
  position?: string;
  height_range?: string;
  uniform_size?: string;
  is_active: boolean;
  first_half_count: number;
  second_half_count: number;
  created_at: string;
}

export default function IcnMemberBoard() {
  const [members, setMembers] = useState<IcnMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const currentMonth = new Date().getMonth() + 1;
  const isFirstHalf = currentMonth >= 1 && currentMonth <= 6;

  const handleAddAsGuest = async (member: IcnMember) => {
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
          name: `${member.name}(정규)`,
          age: member.age || '',
          position: member.position || '',
          height: member.height_range || '',
          phone: member.phone || '',
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

      const countField = isFirstHalf ? 'first_half_count' : 'second_half_count';
      const newCount = isFirstHalf 
        ? (member.first_half_count || 0) + 1 
        : (member.second_half_count || 0) + 1;

      const { error: updateError } = await supabase
        .from('icn_members')
        .update({ [countField]: newCount })
        .eq('id', member.id);

      if (updateError) {
        console.error('Error updating count:', updateError);
      } else {
        setMembers(prev => 
          prev.map(m => 
            m.id === member.id 
              ? { ...m, [countField]: newCount }
              : m
          )
        );
      }

      toast({
        title: "게스트로 추가됨",
        description: `${member.name}님이 게스트 목록에 추가되었습니다.`,
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

  useEffect(() => {
    async function fetchMembers() {
      setIsLoading(true);
      
      try {
        if (!supabase) {
          console.error('Supabase client not initialized');
          setMembers([]);
          return;
        }

        const { data, error } = await supabase
          .from('icn_members')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching ICN members:', error);
          setMembers([]);
          return;
        }

        setMembers(data || []);
      } catch (err) {
        console.error('Fetch error:', err);
        setMembers([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMembers();
  }, []);

  return (
    <section className="py-16 bg-gradient-to-b from-gray-100 to-gray-200 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            ICN 멤버 현황
          </h1>
          <p className="text-gray-600">
            ICN 고정 멤버 명단입니다. (Supabase 연동)
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

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-bold text-gray-900 text-center px-2">이름</TableHead>
                <TableHead className="font-bold text-gray-900 text-center px-2">나이</TableHead>
                <TableHead className="font-bold text-gray-900 text-center px-2">키</TableHead>
                <TableHead className="font-bold text-gray-900 text-center px-2">포지션</TableHead>
                <TableHead className="font-bold text-gray-900 text-center px-2">상반기</TableHead>
                <TableHead className="font-bold text-gray-900 text-center px-2">하반기</TableHead>
                <TableHead className="font-bold text-gray-900 text-center px-2">게스트로 참가</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell className="px-2 py-3"><Skeleton className="h-4 w-16 mx-auto" /></TableCell>
                    <TableCell className="px-2 py-3"><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                    <TableCell className="px-2 py-3"><Skeleton className="h-4 w-16 mx-auto" /></TableCell>
                    <TableCell className="px-2 py-3"><Skeleton className="h-4 w-16 mx-auto" /></TableCell>
                    <TableCell className="px-2 py-3"><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                    <TableCell className="px-2 py-3"><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                    <TableCell className="px-2 py-3"><Skeleton className="h-6 w-12 mx-auto" /></TableCell>
                  </TableRow>
                ))
              ) : members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                    등록된 ICN 멤버가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                members.map((member) => (
                  <TableRow key={member.id} data-testid={`row-icn-member-${member.id}`}>
                    <TableCell className="text-center font-medium px-2 py-3 whitespace-nowrap text-red-600">
                      {member.name}
                    </TableCell>
                    <TableCell className="text-center px-2 py-3 whitespace-nowrap">
                      {member.age || '-'}
                    </TableCell>
                    <TableCell className="text-center px-2 py-3 whitespace-nowrap">
                      {formatHeightForDisplay(member.height_range || '')}
                    </TableCell>
                    <TableCell className="text-center px-2 py-3 whitespace-nowrap">
                      {formatPositionForDisplay(member.position || '')}
                    </TableCell>
                    <TableCell className="text-center px-2 py-3 whitespace-nowrap font-semibold">
                      {member.first_half_count || 0}회
                    </TableCell>
                    <TableCell className="text-center px-2 py-3 whitespace-nowrap font-semibold">
                      {member.second_half_count || 0}회
                    </TableCell>
                    <TableCell className="text-center px-2 py-3">
                      <Button
                        size="sm"
                        onClick={() => handleAddAsGuest(member)}
                        className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1"
                        data-testid={`button-add-guest-${member.id}`}
                      >
                        참가
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>상반기: 1월~6월 | 하반기: 7월~12월</p>
          <p className="mt-1">현재 {isFirstHalf ? '상반기' : '하반기'} 기간입니다.</p>
        </div>
      </div>
    </section>
  );
}

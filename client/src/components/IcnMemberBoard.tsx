import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronRight, UserPlus, X } from 'lucide-react';
import { formatHeightForDisplay, formatPositionForDisplay } from '@/lib/gameWeekUtils';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  attendance_history?: string[];
  created_at: string;
}

export default function IcnMemberBoard() {
  const [members, setMembers] = useState<IcnMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    age: '',
    height_range: '',
    position: '',
    phone: '010-0000-0000'
  });
  const { toast } = useToast();

  const currentMonth = new Date().getMonth() + 1;
  const isFirstHalf = currentMonth >= 1 && currentMonth <= 6;

  const handleAddMember = async () => {
    if (!supabase) return;
    if (!newMember.name) {
      toast({ title: "이름을 입력해주세요.", variant: "destructive" });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('icn_members')
        .insert({
          ...newMember,
          is_active: true,
          first_half_count: 0,
          second_half_count: 0
        })
        .select()
        .single();

      if (error) throw error;

      setMembers(prev => [...prev, data]);
      setIsAddDialogOpen(false);
      setNewMember({ name: '', age: '', height_range: '', position: '', phone: '010-0000-0000' });
      toast({ title: "멤버가 추가되었습니다." });
    } catch (err) {
      console.error('Add member error:', err);
      toast({ title: "멤버 추가 실패", variant: "destructive" });
    }
  };

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
      const kstTime = new Date(nowUTC.getTime() + (9 * 60 * 60 * 1000));
      const formattedTime = kstTime.toISOString().replace('T', ' ').substring(0, 19);

      const { error } = await supabase
        .from('guest_applications')
        .insert({
          name: `${member.name}(ICNF)`,
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

      // Update attendance history for the member
      const { data: currentMember } = await supabase
        .from('icn_members')
        .select('attendance_history')
        .eq('id', member.id)
        .single();

      const history = currentMember?.attendance_history || [];
      const updatedHistory = [...history, formattedTime];

      const countField = isFirstHalf ? 'first_half_count' : 'second_half_count';
      const newCount = isFirstHalf 
        ? (member.first_half_count || 0) + 1 
        : (member.second_half_count || 0) + 1;

      const { error: updateError } = await supabase
        .from('icn_members')
        .update({ 
          [countField]: newCount,
          attendance_history: updatedHistory 
        })
        .eq('id', member.id);

      if (updateError) {
        console.error('Error updating count:', updateError);
      } else {
        setMembers(prev => 
          prev.map(m => 
            m.id === member.id 
              ? { ...m, [countField]: newCount, attendance_history: updatedHistory }
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
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            <a
              href="/guest-status"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md"
            >
              금주 게스트 명단 보기
              <ChevronRight className="h-5 w-5" />
            </a>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold h-[52px] px-6">
                  <UserPlus className="mr-2 h-5 w-5" />
                  신규 멤버 등록
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>ICN 신규 멤버 등록</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">이름</Label>
                    <Input 
                      id="name" 
                      value={newMember.name} 
                      onChange={e => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                      className="col-span-3" 
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="age" className="text-right">나이</Label>
                    <Select 
                      value={newMember.age} 
                      onValueChange={val => setNewMember(prev => ({ ...prev, age: val }))}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="나이 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="20대">20대</SelectItem>
                        <SelectItem value="30대">30대</SelectItem>
                        <SelectItem value="40대">40대</SelectItem>
                        <SelectItem value="47대">47대</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="height" className="text-right">키</Label>
                    <Select 
                      value={newMember.height_range} 
                      onValueChange={val => setNewMember(prev => ({ ...prev, height_range: val }))}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="키 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="under_170">170cm 미만</SelectItem>
                        <SelectItem value="170_175">170~175cm</SelectItem>
                        <SelectItem value="175_180">175~180cm</SelectItem>
                        <SelectItem value="180_185">180~185cm</SelectItem>
                        <SelectItem value="over_185">185cm 이상</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="position" className="text-right">포지션</Label>
                    <Select 
                      value={newMember.position} 
                      onValueChange={val => setNewMember(prev => ({ ...prev, position: val }))}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="포지션 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="가드">가드</SelectItem>
                        <SelectItem value="포워드">포워드</SelectItem>
                        <SelectItem value="센터">센터</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="phone" className="text-right">연락처</Label>
                    <Input 
                      id="phone" 
                      value={newMember.phone} 
                      disabled
                      className="col-span-3 bg-gray-100" 
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>취소</Button>
                  <Button onClick={handleAddMember} className="bg-blue-600 hover:bg-blue-700">등록하기</Button>
                </div>
              </DialogContent>
            </Dialog>
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
                      <Dialog>
                        <DialogTrigger asChild>
                          <span className="cursor-pointer hover:underline">{member.name}</span>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{member.name} 멤버 상세 정보</DialogTitle>
                          </DialogHeader>
                          <div className="py-4">
                            <h4 className="font-bold mb-2">참석 이력 (KST)</h4>
                            <div className="max-h-60 overflow-y-auto border rounded p-2 bg-gray-50">
                              {member.attendance_history && member.attendance_history.length > 0 ? (
                                <ul className="space-y-1">
                                  {member.attendance_history.map((time, idx) => (
                                    <li key={idx} className="text-sm text-gray-600 py-1 border-b last:border-0">
                                      {time}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-sm text-gray-400 text-center py-4">참석 이력이 없습니다.</p>
                              )}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
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

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, UserX, ChevronLeft, ChevronRight, UserPlus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
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
  created_at?: string;
  last_game_date?: string | null;
  is_hidden?: boolean;
}

interface DisplayApplication extends MembershipApplication {
  cumulativeCount: number;
  planDisplay: string;
  remainingCount: number;
}

function getMonthOptions(range: number = 41) {
  const months: { label: string; value: string }[] = [];
  const now = new Date();
  const halfRange = Math.floor(range / 2);
  for (let i = -halfRange; i <= halfRange; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const value = `${year}-${String(month).padStart(2, '0')}-01`;
    months.push({ label: `${year}년 ${month}월`, value });
  }
  return months;
}

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}

function getPlanDisplay(plan: string) {
  if (plan === 'regular_2') return '2회';
  if (plan === 'regular_4') return '4회';
  if (plan === 'guest_once') return '게스트';
  return plan;
}

export default function MembershipStatusBoard() {
  const [applications, setApplications] = useState<DisplayApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [monthOptions] = useState(() => getMonthOptions(41));
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(() => {
    const currentMonth = getCurrentMonth();
    return getMonthOptions(41).findIndex(opt => opt.value === currentMonth);
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [groupHeaderColor, setGroupHeaderColor] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editType, setEditType] = useState<'name' | 'time' | 'count' | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editCount, setEditCount] = useState(0);
  const [isTimeEditActive, setIsTimeEditActive] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [historyMember, setHistoryMember] = useState<DisplayApplication | null>(null);
  const [memberGameHistory, setMemberGameHistory] = useState<string[]>([]);
  const [isNextRegDialogOpen, setIsNextRegDialogOpen] = useState(false);
  const [nextRegMember, setNextRegMember] = useState<DisplayApplication | null>(null);
  const [nextRegParams, setNextRegData] = useState({ targetMonth: '', plan: 'regular_2' });

  const selectedMonth = monthOptions[selectedMonthIndex];

  useEffect(() => {
    async function fetchGameHistory() {
      if (!historyMember || !supabase) {
        setMemberGameHistory([]);
        return;
      }
      const { data, error } = await supabase.from('membership_applications').select('last_game_date, created_at').eq('phone', historyMember.phone).not('last_game_date', 'is', null).order('created_at', { ascending: false });
      if (error) {
        setMemberGameHistory([]);
        return;
      }
      const unique = Array.from(new Set((data || []).map((item: any) => item.last_game_date).filter(Boolean)));
      setMemberGameHistory(unique);
    }
    fetchGameHistory();
  }, [historyMember]);

  useEffect(() => {
    async function fetchApplications() {
      if (!selectedMonth) return;
      setIsLoading(true);
      if (!supabase) {
        setApplications([]);
        setIsLoading(false);
        return;
      }
      const { data, error } = await supabase.from('membership_applications').select('id, name, phone, age, position, height_range, uniform_size, plan, target_month, used_count, group_color, created_at, last_game_date, is_hidden').eq('target_month', selectedMonth.value).in('plan', ['regular_2', 'regular_4']).order('created_at', { ascending: true });
      if (error || !data) {
        setApplications([]);
        setIsLoading(false);
        return;
      }
      const displayApps = (data as MembershipApplication[])
        .filter(app => !app.is_hidden)
        .map(app => {
          const total = app.plan === 'regular_4' ? 4 : 2;
          const used = app.used_count || 0;
          return {
            ...app,
            cumulativeCount: used,
            remainingCount: Math.max(0, total - used),
            planDisplay: getPlanDisplay(app.plan),
          };
        });
      setApplications(displayApps);
      setIsLoading(false);
    }
    fetchApplications();
  }, [selectedMonth]);

  return null;
}

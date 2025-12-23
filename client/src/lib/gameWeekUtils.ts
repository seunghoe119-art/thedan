import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { addDays, subDays, getDay } from 'date-fns';

const KST_TIMEZONE = 'Asia/Seoul';

export interface GameWeek {
  label: string;
  startDate: Date;
  endDate: Date;
  startDateUTC: string;
  endDateUTC: string;
}

function createKSTDate(year: number, month: number, day: number, hour: number = 0, minute: number = 0, second: number = 0): Date {
  const kstDateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;
  return fromZonedTime(kstDateString, KST_TIMEZONE);
}

export function getGameWeeks(weeksCount: number = 8): GameWeek[] {
  const nowUTC = new Date();
  const nowKST = toZonedTime(nowUTC, KST_TIMEZONE);
  
  const currentDeadlineUTC = getCurrentWeekDeadline(nowKST);
  
  const weeks: GameWeek[] = [];
  
  for (let i = 0; i < weeksCount; i++) {
    const weekDeadlineUTC = addDays(currentDeadlineUTC, i * 7);
    const weekDeadlineKST = toZonedTime(weekDeadlineUTC, KST_TIMEZONE);
    
    const weekStartUTC = subDays(weekDeadlineUTC, 6);
    const startKST = toZonedTime(weekStartUTC, KST_TIMEZONE);
    const weekStartMidnightUTC = createKSTDate(
      startKST.getFullYear(),
      startKST.getMonth() + 1,
      startKST.getDate(),
      0, 0, 0
    );
    
    const year = weekDeadlineKST.getFullYear();
    const month = weekDeadlineKST.getMonth() + 1;
    const weekOfMonth = Math.ceil(weekDeadlineKST.getDate() / 7);
    
    weeks.push({
      label: `${year}년 ${month}월 ${weekOfMonth}주차`,
      startDate: weekStartMidnightUTC,
      endDate: weekDeadlineUTC,
      startDateUTC: weekStartMidnightUTC.toISOString(),
      endDateUTC: weekDeadlineUTC.toISOString(),
    });
  }
  
  return weeks;
}

function getCurrentWeekDeadline(nowKST: Date): Date {
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
  
  const fridayKST = addDays(nowKST, daysUntilFriday);
  
  return createKSTDate(
    fridayKST.getFullYear(),
    fridayKST.getMonth() + 1,
    fridayKST.getDate(),
    21, 0, 0
  );
}

export function formatPhoneForDisplay(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  } else if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

export function formatHeightForDisplay(height: string): string {
  if (!height) return '';
  const match = height.match(/(\d+)~?(\d+)?/);
  if (match) {
    if (match[2]) {
      // Calculate average of the range
      const min = parseInt(match[1]);
      const max = parseInt(match[2]);
      const average = Math.round((min + max) / 2);
      return `${average}cm`;
    }
    return `${match[1]}cm`;
  }
  return height;
}

export function formatPositionForDisplay(position: string): string {
  const positionMap: { [key: string]: string } = {
    '리딩 가드 1,2번': '가드',
    'leading': '가드',
    '스몰포워드 2,3번': '포워드',
    'small': '포워드',
    '밑선라인 4,5번': '센터',
    'baseline': '수비수',
  };
  return positionMap[position] || position;
}

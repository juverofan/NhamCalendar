import { LunarDate } from 'vietnamese-lunar-calendar';

export interface FullLunarInfo {
  solarDate: Date; solarDay: number; solarMonth: number; solarYear: number;
  lunarDay: number; lunarMonth: number; lunarYear: number;
  canDay: string; canMonth: string; canYear: string; dayOfWeekName: string;
}

export const getYearCanChi = (year: number) => {
  const can = ["Canh", "Tân", "Nhâm", "Quý", "Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ"];
  const chi = ["Thân", "Dậu", "Tuất", "Hợi", "Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi"];
  return `${can[year % 10]} ${chi[year % 12]}`;
};

export const getMonthCanChi = (year: number, month: number) => {
  const cans = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
  const chis = ["Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi", "Tý", "Sửu"];
  const yearCanIndex = (year + 6) % 10;
  let startCan = 0;
  if (yearCanIndex === 0 || yearCanIndex === 5) startCan = 2;
  else if (yearCanIndex === 1 || yearCanIndex === 6) startCan = 4;
  else if (yearCanIndex === 2 || yearCanIndex === 7) startCan = 6;
  else if (yearCanIndex === 3 || yearCanIndex === 8) startCan = 8;
  else if (yearCanIndex === 4 || yearCanIndex === 9) startCan = 0;
  return `${cans[(startCan + month - 1) % 10]} ${chis[(month - 1) % 12]}`;
};

export const getDayCanChi = (date: Date) => {
  const t = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const jd = Math.floor(t / 86400000) + 2440588;
  const cans = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
  const chis = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
  return `${cans[(jd + 9) % 10]} ${chis[(jd + 1) % 12]}`;
};

export const getHourCanChi = (date: Date, canDayName: string) => {
  const hour = date.getHours();
  const chiIndex = Math.floor((hour + 1) % 24 / 2); 
  const chis = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
  const cans = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
  const canDay = canDayName.split(' ')[0]; 
  let startCanIndex = 0;
  if (canDay === "Giáp" || canDay === "Kỷ") startCanIndex = 0;
  else if (canDay === "Ất" || canDay === "Canh") startCanIndex = 2;
  else if (canDay === "Bính" || canDay === "Tân") startCanIndex = 4;
  else if (canDay === "Đinh" || canDay === "Nhâm") startCanIndex = 6;
  else if (canDay === "Mậu" || canDay === "Quý") startCanIndex = 8;
  return `${cans[(startCanIndex + chiIndex) % 10]} ${chis[chiIndex]}`;
};

export const getFullLunarInfo = (date: Date): FullLunarInfo => {
  const rawLunar: any = new LunarDate(date); 
  const daysOfWeek = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
  const lDay = rawLunar.day || rawLunar.date || 1;
  const lMonth = rawLunar.month || 1;
  const lYear = rawLunar.year || date.getFullYear();

  return {
    solarDate: date, solarDay: date.getDate(), solarMonth: date.getMonth() + 1, solarYear: date.getFullYear(),
    lunarDay: lDay, lunarMonth: lMonth, lunarYear: lYear,
    canDay: getDayCanChi(date), canMonth: getMonthCanChi(lYear, lMonth), canYear: getYearCanChi(lYear),
    dayOfWeekName: daysOfWeek[date.getDay()],
  };
};
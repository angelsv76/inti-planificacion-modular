
import { addDays, format, isSameDay } from "date-fns";

/**
 * Calculates Easter Sunday using Gauss Algorithm
 */
export function getEasterSunday(year: number): Date {
  const a = year % 19;
  const b = year % 4;
  const c = year % 7;
  const k = Math.floor(year / 100);
  const p = Math.floor((13 + 8 * k) / 25);
  const q = Math.floor(k / 4);
  const M = (15 - p + k - q) % 30;
  const N = (4 + k - q) % 7;
  const d = (19 * a + M) % 30;
  const e = (2 * b + 4 * c + 6 * d + N) % 7;

  let day = 22 + d + e;
  let month = 3; // March

  if (day > 31) {
    day -= 31;
    month = 4; // April
  }

  // Exceptions
  if (d === 29 && e === 6) {
    day = 19;
    month = 4;
  }
  if (d === 28 && e === 6 && a > 10) {
    day = 18;
    month = 4;
  }

  return new Date(year, month - 1, day);
}

/**
 * Returns the 14 days around Holy Week (3 days before Palm Sunday to 3 days after Easter Sunday)
 */
export function getHolyWeekRange(year: number): Date[] {
  const easter = getEasterSunday(year);
  const startRange = addDays(easter, -10); // 3 days before Palm Sunday (which is easter - 7)
  const range: Date[] = [];
  for (let i = 0; i < 14; i++) {
    range.push(addDays(startRange, i));
  }
  return range;
}

export function getFixedHolidays(year: number) {
  return [
    { date: `${year}-01-01`, name: 'Año Nuevo' },
    { date: `${year}-05-01`, name: 'Día del Trabajo' },
    { date: `${year}-05-10`, name: 'Día de la Madre' },
    { date: `${year}-06-17`, name: 'Día del Padre' },
    { date: `${year}-06-22`, name: 'Día del Maestro' },
    { date: `${year}-08-03`, name: 'Fiestas Agostinas' },
    { date: `${year}-08-04`, name: 'Fiestas Agostinas' },
    { date: `${year}-08-05`, name: 'Fiestas Agostinas' },
    { date: `${year}-08-06`, name: 'Fiestas Agostinas' },
    { date: `${year}-09-15`, name: 'Día de la Independencia' },
    { date: `${year}-11-02`, name: 'Día de los Difuntos' },
    { date: `${year}-12-25`, name: 'Navidad' },
  ];
}

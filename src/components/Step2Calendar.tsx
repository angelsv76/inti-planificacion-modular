
import { useState, useEffect } from 'react';
import { AppData, Holiday } from '../types';
import { getHolyWeekRange, getFixedHolidays, getEasterSunday } from '../utils/dateUtils';
import { format, isSameDay, parseISO, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon, Plus, Trash2, Info } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Props {
  data: AppData;
  updateData: (newData: Partial<AppData>) => void;
}

export default function Step2Calendar({ data, updateData }: Props) {
  const [newHolidayName, setNewHolidayName] = useState('');
  const [newHolidayDate, setNewHolidayDate] = useState('');

  const holyWeek = getHolyWeekRange(data.year);

  useEffect(() => {
    // Pre-load fixed holidays when year changes
    const fixed = getFixedHolidays(data.year);
    const existingDates = data.holidays.map(h => h.date);
    const toAdd = fixed.filter(f => !existingDates.includes(f.date)).map(f => ({ ...f, isFixed: true }));
    if (toAdd.length > 0) {
      updateData({ holidays: [...data.holidays, ...toAdd] });
    }
  }, [data.year]);

  const addHoliday = () => {
    if (!newHolidayName || !newHolidayDate) return;
    const newHoliday: Holiday = {
      name: newHolidayName,
      date: newHolidayDate,
      isFixed: false,
    };
    updateData({ holidays: [...data.holidays, newHoliday] });
    setNewHolidayName('');
    setNewHolidayDate('');
  };

  const removeHoliday = (date: string) => {
    updateData({ holidays: data.holidays.filter(h => h.date !== date) });
  };

  const toggleVacationDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const isStart = data.vacationRange?.start === dateStr;
    const isEnd = data.vacationRange?.end === dateStr;

    if (!data.vacationRange || (data.vacationRange.start && data.vacationRange.end)) {
      updateData({ vacationRange: { start: dateStr, end: '' } });
    } else if (data.vacationRange.start && !data.vacationRange.end) {
      const start = parseISO(data.vacationRange.start);
      if (date < start) {
        updateData({ vacationRange: { start: dateStr, end: data.vacationRange.start } });
      } else {
        updateData({ vacationRange: { ...data.vacationRange, end: dateStr } });
      }
    }
  };

  const isInVacationRange = (date: Date) => {
    if (!data.vacationRange?.start || !data.vacationRange?.end) return false;
    const start = parseISO(data.vacationRange.start);
    const end = parseISO(data.vacationRange.end);
    return date >= start && date <= end;
  };

  const isCoreHolyWeek = (date: Date) => {
    const easter = getEasterSunday(data.year);
    const palmSunday = addDays(easter, -7);
    return date >= palmSunday && date <= easter;
  };

  const getVacationDaysCount = () => {
    if (!data.vacationRange?.start || !data.vacationRange?.end) return 0;
    const start = parseISO(data.vacationRange.start);
    const end = parseISO(data.vacationRange.end);
    return Math.max(0, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  };

  const totalDays = data.holidays.length + getVacationDaysCount();

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-2xl font-bold text-slate-900">Calendario y Asuetos</h2>
        <p className="text-slate-500">Define el inicio del periodo y gestiona los días no lectivos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Fecha de Inicio del Periodo</label>
            <div className="relative">
              <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="date"
                value={data.startDate}
                onChange={(e) => updateData({ startDate: e.target.value })}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-slate-50/50"
              />
            </div>
          </div>

          <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 space-y-4">
            <div className="flex items-center gap-2 text-amber-900 font-bold">
              <Info className="w-5 h-5" />
              <h3>Rango de Semana Santa {data.year}</h3>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              Hemos extendido el rango (3 días antes y después). La zona central resaltada es la Semana Santa oficial.
            </p>
            <div className="grid grid-cols-7 gap-1.5">
              {holyWeek.map((date) => {
                const isSelected = data.vacationRange?.start === format(date, 'yyyy-MM-dd') || 
                                 data.vacationRange?.end === format(date, 'yyyy-MM-dd') ||
                                 isInVacationRange(date);
                const isCore = isCoreHolyWeek(date);
                
                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => toggleVacationDay(date)}
                    className={cn(
                      "p-1.5 rounded-lg text-[10px] font-bold transition-all border flex flex-col items-center",
                      isSelected 
                        ? 'bg-amber-500 border-amber-600 text-white shadow-sm scale-105 z-10' 
                        : isCore
                          ? 'bg-white border-amber-300 text-amber-700 hover:bg-amber-100'
                          : 'bg-slate-50/50 border-slate-200 text-slate-400 hover:bg-slate-100'
                    )}
                  >
                    <div className="uppercase text-[8px] opacity-70">{format(date, 'EEE', { locale: es })}</div>
                    <div className="text-sm">{format(date, 'd')}</div>
                    {isCore && !isSelected && <div className="w-1 h-1 bg-amber-400 rounded-full mt-0.5" />}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-white border border-amber-300 rounded" />
                <span>Semana Santa</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-slate-50 border border-slate-200 rounded" />
                <span>Buffer (+/- 3d)</span>
              </div>
            </div>
            {data.vacationRange?.start && (
              <div className="flex items-center justify-between text-xs font-medium text-amber-900 bg-white/50 p-2 rounded-lg border border-amber-200/50">
                <span>Rango: {format(parseISO(data.vacationRange.start), 'dd/MM')} 
                {data.vacationRange.end ? ` al ${format(parseISO(data.vacationRange.end), 'dd/MM')}` : ' (selecciona fin)'}</span>
                {data.vacationRange.end && (
                  <span className="bg-amber-100 px-2 py-0.5 rounded-full text-[10px] font-black">
                    {getVacationDaysCount()} DÍAS
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-700 uppercase text-xs tracking-widest">Total No Lectivos</h3>
              <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-sm">
                {totalDays} DÍAS TOTALES
              </span>
            </div>
            <div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
              {/* Holy Week Summary in List */}
              {data.vacationRange?.start && data.vacationRange?.end && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-100">
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-500 text-white w-10 h-10 rounded-lg flex flex-col items-center justify-center text-[10px] font-bold">
                      <span className="uppercase">VAC</span>
                      <span className="text-sm leading-none">{getVacationDaysCount()}</span>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-amber-900">Vacaciones Semana Santa</div>
                      <div className="text-[10px] text-amber-700 uppercase font-bold">Rango Seleccionado</div>
                    </div>
                  </div>
                </div>
              )}
              {data.holidays.sort((a, b) => a.date.localeCompare(b.date)).map((h) => (
                <div key={h.date} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-100 text-slate-600 w-10 h-10 rounded-lg flex flex-col items-center justify-center text-[10px] font-bold">
                      <span className="uppercase">{format(parseISO(h.date), 'MMM', { locale: es })}</span>
                      <span className="text-sm leading-none">{format(parseISO(h.date), 'd')}</span>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{h.name}</div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold">{h.isFixed ? 'Feriado Nacional' : 'Personalizado'}</div>
                    </div>
                  </div>
                  {!h.isFixed && (
                    <button 
                      onClick={() => removeHoliday(h.date)}
                      className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Nombre del asueto"
                  value={newHolidayName}
                  onChange={(e) => setNewHolidayName(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="date"
                  value={newHolidayDate}
                  onChange={(e) => setNewHolidayDate(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={addHoliday}
                className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-600 py-2 rounded-lg text-sm font-bold hover:bg-slate-100 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Agregar Asueto
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

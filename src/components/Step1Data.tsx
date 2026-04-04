
import { AppData, Specialty, Level, Period } from '../types';
import { SPECIALTIES, LEVELS, PERIODS, SECTIONS } from '../constants';

interface Props {
  data: AppData;
  updateData: (newData: Partial<AppData>) => void;
}

export default function Step1Data({ data, updateData }: Props) {
  const sectionCode = `${data.specialty}${data.level.charAt(0)}${data.section}`;

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-2xl font-bold text-slate-900">Datos de la Planificación</h2>
        <p className="text-slate-500">Ingresa la información básica del docente y la sección.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Nombre del Docente</label>
          <input
            type="text"
            value={data.teacherName}
            onChange={(e) => updateData({ teacherName: e.target.value })}
            placeholder="Ej. Ing. Juan Pérez"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-slate-50/50"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Año Lectivo</label>
          <input
            type="number"
            value={data.year}
            onChange={(e) => updateData({ year: parseInt(e.target.value) })}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-slate-50/50"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Especialidad</label>
          <select
            value={data.specialty}
            onChange={(e) => updateData({ specialty: e.target.value as Specialty })}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-slate-50/50"
          >
            {SPECIALTIES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Nivel</label>
            <select
              value={data.level}
              onChange={(e) => updateData({ level: e.target.value as Level })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-slate-50/50"
            >
              {LEVELS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Sección</label>
            <select
              value={data.section}
              onChange={(e) => updateData({ section: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-slate-50/50"
            >
              {SECTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Periodo</label>
            <select
              value={data.period}
              onChange={(e) => updateData({ period: e.target.value as Period })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-slate-50/50"
            >
              {PERIODS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-center justify-between">
        <div>
          <h3 className="text-blue-900 font-bold">Código de Sección Generado</h3>
          <p className="text-blue-700 text-sm">Este código se usará en los documentos oficiales.</p>
        </div>
        <div className="text-4xl font-black text-blue-600 tracking-tighter">
          {sectionCode}
        </div>
      </div>
    </div>
  );
}

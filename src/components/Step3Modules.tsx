
import { useState, useEffect } from 'react';
import { AppData, Module } from '../types';
import { Plus, Trash2, Clock, Calendar, User, UserCheck, Layers, Edit2, X, Sparkles, Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { suggestCompetencies } from '../services/aiService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Props {
  data: AppData;
  updateData: (newData: Partial<AppData>) => void;
}

export default function Step3Modules({ data, updateData }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newModule, setNewModule] = useState<Partial<Module>>({
    code: '',
    name: '',
    objective: '',
    competencies: '',
    weeks: 1,
    hoursPerWeek: 1,
    isExternal: false,
    startWeek: 1,
  });

  // Auto-calculate start week for sequential execution
  useEffect(() => {
    if (!editingId && data.modules.length > 0) {
      const lastModule = [...data.modules].sort((a, b) => (a.startWeek + a.weeks) - (b.startWeek + b.weeks)).pop();
      if (lastModule) {
        const nextWeek = lastModule.startWeek + lastModule.weeks;
        if (nextWeek <= 10) {
          setNewModule(prev => ({ ...prev, startWeek: nextWeek }));
        }
      }
    }
  }, [data.modules.length, editingId]);

  const generateCompetencies = async () => {
    if (!newModule.name || !newModule.objective) {
      alert("Por favor, ingresa el nombre y el objetivo del módulo para generar las competencias.");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await suggestCompetencies(
        data.specialty,
        newModule.name,
        newModule.objective
      );
      setNewModule(prev => ({ ...prev, competencies: result }));
    } catch (error) {
      console.error(error);
      alert("Error al generar competencias. Inténtalo de nuevo.");
    } finally {
      setIsGenerating(false);
    }
  };

  const addModule = () => {
    if (!newModule.code || !newModule.name) return;

    if (editingId) {
      const updatedModules = data.modules.map(m => 
        m.id === editingId ? { ...m, ...newModule as Module } : m
      );
      updateData({ modules: updatedModules });
      setEditingId(null);
    } else {
      const module: Module = {
        id: Math.random().toString(36).substr(2, 9),
        code: newModule.code!,
        name: newModule.name!,
        objective: newModule.objective || '',
        competencies: newModule.competencies || '',
        weeks: newModule.weeks || 1,
        hoursPerWeek: newModule.hoursPerWeek || 1,
        isExternal: !!newModule.isExternal,
        startWeek: newModule.startWeek || 1,
      };
      updateData({ modules: [...data.modules, module] });
    }

    setNewModule({
      code: '',
      name: '',
      objective: '',
      competencies: '',
      weeks: 1,
      hoursPerWeek: 1,
      isExternal: false,
      startWeek: 1,
    });
  };

  const startEdit = (module: Module) => {
    setEditingId(module.id);
    setNewModule(module);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewModule({
      code: '',
      name: '',
      objective: '',
      competencies: '',
      weeks: 1,
      hoursPerWeek: 1,
      isExternal: false,
      startWeek: 1,
    });
  };
// ... rest of the file ...

  const removeModule = (id: string) => {
    updateData({ modules: data.modules.filter(m => m.id !== id) });
  };

  const totalWeeks = data.modules.reduce((acc, m) => acc + m.weeks, 0);

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-2xl font-bold text-slate-900">Módulos del Periodo</h2>
        <p className="text-slate-500">Registra los módulos técnicos y transversales del periodo actual.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-slate-900 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {editingId ? <Edit2 className="w-5 h-5 text-amber-500" /> : <Plus className="w-5 h-5 text-blue-600" />}
                {editingId ? 'Editar Módulo' : 'Nuevo Módulo'}
              </div>
              {editingId && (
                <button onClick={cancelEdit} className="p-1 hover:bg-slate-100 rounded-full text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              )}
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Código (N.X)</label>
                <input
                  type="text"
                  value={newModule.code}
                  onChange={(e) => setNewModule({ ...newModule, code: e.target.value })}
                  placeholder="Ej. 1.1"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre del Módulo</label>
                <input
                  type="text"
                  value={newModule.name}
                  onChange={(e) => setNewModule({ ...newModule, name: e.target.value })}
                  placeholder="Ej. Mantenimiento de Hardware"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Objetivo del Módulo</label>
                <textarea
                  value={newModule.objective}
                  onChange={(e) => setNewModule({ ...newModule, objective: e.target.value })}
                  placeholder="Describe el objetivo principal del módulo..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Competencias</label>
                  <button
                    onClick={generateCompetencies}
                    disabled={isGenerating}
                    className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    GENERAR CON IA
                  </button>
                </div>
                <textarea
                  value={newModule.competencies}
                  onChange={(e) => setNewModule({ ...newModule, competencies: e.target.value })}
                  placeholder="Competencias técnicas, sociales y de gestión..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Semanas</label>
                  <input
                    type="number"
                    value={newModule.weeks}
                    onChange={(e) => setNewModule({ ...newModule, weeks: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Horas/Semana</label>
                  <input
                    type="number"
                    value={newModule.hoursPerWeek}
                    onChange={(e) => setNewModule({ ...newModule, hoursPerWeek: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Semana de Inicio</label>
                <select
                  value={newModule.startWeek}
                  onChange={(e) => setNewModule({ ...newModule, startWeek: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(w => (
                    <option key={w} value={w}>Semana {w}</option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  checked={newModule.isExternal}
                  onChange={(e) => setNewModule({ ...newModule, isExternal: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-700">Módulo Externo</span>
                  <span className="text-[10px] text-slate-500">Inglés Técnico, Emprendedurismo, etc.</span>
                </div>
              </label>

              <button
                onClick={addModule}
                className={cn(
                  "w-full text-white py-3 rounded-xl font-bold transition-all active:scale-95 shadow-sm",
                  editingId ? "bg-amber-500 hover:bg-amber-600" : "bg-blue-600 hover:bg-blue-700"
                )}
              >
                {editingId ? 'Guardar Cambios' : 'Agregar Módulo'}
              </button>
              {editingId && (
                <button
                  onClick={cancelEdit}
                  className="w-full bg-slate-100 text-slate-600 py-2 rounded-xl font-bold hover:bg-slate-200 transition-all text-xs"
                >
                  Cancelar Edición
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {/* Timeline Visualization */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm overflow-x-auto">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Distribución en el Periodo (10 Semanas)
            </h3>
            
            <div className="relative min-w-[600px]">
              {/* Grid Lines */}
              <div className="grid grid-cols-10 gap-0 border-l border-slate-200 h-32">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="border-r border-slate-100 relative">
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-400">S{i + 1}</span>
                  </div>
                ))}
              </div>

              {/* Module Bars */}
              <div className="absolute top-0 left-0 w-full h-full pt-4 space-y-2">
                {data.modules.map((m, idx) => (
                  <div
                    key={m.id}
                    className={cn(
                      "h-8 rounded-lg flex items-center px-3 text-[10px] font-bold shadow-sm transition-all truncate",
                      m.isExternal 
                        ? "bg-slate-100 text-slate-500 border border-slate-200" 
                        : "bg-blue-500 text-white border border-blue-600"
                    )}
                    style={{
                      marginLeft: `${(m.startWeek - 1) * 10}%`,
                      width: `${m.weeks * 10}%`,
                    }}
                  >
                    {m.code} - {m.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Module List */}
          <div className="space-y-3">
            {data.modules.map((m) => (
              <div key={m.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between group hover:border-blue-200 transition-all">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm",
                    m.isExternal ? "bg-slate-100 text-slate-400" : "bg-blue-100 text-blue-600"
                  )}>
                    {m.code}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900">{m.name}</h4>
                      {m.isExternal ? (
                        <span className="flex items-center gap-1 text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">
                          <User className="w-3 h-3" /> EXTERNO
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold">
                          <UserCheck className="w-3 h-3" /> PROPIO
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Calendar className="w-3 h-3" /> {m.weeks} semanas
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="w-3 h-3" /> {m.hoursPerWeek}h/sem
                      </div>
                      <div className="text-xs font-bold text-blue-600">
                        Total: {m.weeks * m.hoursPerWeek}h
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEdit(m)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar módulo"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeModule(m.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar módulo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {data.modules.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
                <Layers className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-medium">No hay módulos registrados aún.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

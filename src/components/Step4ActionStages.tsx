
import { useState } from 'react';
import { AppData, Module, ActionStages, ActionStage } from '../types';
import { ACTION_STAGES_KEYS, INITIAL_STAGE } from '../constants';
import { suggestStage, suggestAllStages } from '../services/aiService';
import { Sparkles, Loader2, Save, ChevronRight, ChevronLeft, Info, Wand2, AlertCircle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Props {
  data: AppData;
  updateData: (newData: Partial<AppData>) => void;
}

export default function Step4ActionStages({ data, updateData }: Props) {
  const ownModules = data.modules.filter(m => !m.isExternal);
  const [selectedModuleId, setSelectedModuleId] = useState(ownModules[0]?.id || '');
  const [selectedStageKey, setSelectedStageKey] = useState<keyof ActionStages>('inform');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedModule = data.modules.find(m => m.id === selectedModuleId);

  const updateModuleObjective = (moduleId: string, objective: string) => {
    const newModules = data.modules.map(m => {
      if (m.id === moduleId) {
        return { ...m, objective };
      }
      return m;
    });
    updateData({ modules: newModules });
  };

  const updateModuleCompetencies = (moduleId: string, competencies: string) => {
    const newModules = data.modules.map(m => {
      if (m.id === moduleId) {
        return { ...m, competencies };
      }
      return m;
    });
    updateData({ modules: newModules });
  };

  const updateStageFields = (moduleId: string, stageKey: keyof ActionStages, fields: Partial<ActionStage>) => {
    const newModules = data.modules.map(m => {
      if (m.id === moduleId) {
        const stages = m.stages || {
          inform: { ...INITIAL_STAGE },
          plan: { ...INITIAL_STAGE },
          decide: { ...INITIAL_STAGE },
          execute: { ...INITIAL_STAGE },
          control: { ...INITIAL_STAGE },
          value: { ...INITIAL_STAGE },
        };
        return {
          ...m,
          stages: {
            ...stages,
            [stageKey]: {
              ...stages[stageKey],
              ...fields
            }
          }
        };
      }
      return m;
    });
    updateData({ modules: newModules });
  };

  const handleSuggestStage = async () => {
    if (!selectedModule) return;
    setIsGenerating(true);
    setError(null);
    try {
      const stageLabel = ACTION_STAGES_KEYS.find(k => k.key === selectedStageKey)?.label || '';
      const suggestion = await suggestStage(
        data.specialty, 
        selectedModule.name, 
        stageLabel, 
        selectedModule.competencies,
        ""
      );
      updateStageFields(selectedModule.id, selectedStageKey, suggestion);
    } catch (err: any) {
      console.error("AI Suggestion failed:", err);
      setError(err.message || "Error al generar sugerencia.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSuggestAll = async () => {
    if (!selectedModule) return;
    setIsGeneratingAll(true);
    setError(null);
    try {
      const suggestions = await suggestAllStages(
        data.specialty, 
        selectedModule.name, 
        selectedModule.hoursPerWeek,
        selectedModule.competencies,
        ""
      );
      
      const newModules = data.modules.map(m => {
        if (m.id === selectedModule.id) {
          return { ...m, stages: suggestions };
        }
        return m;
      });
      updateData({ modules: newModules });
    } catch (err: any) {
      console.error("AI All Suggestion failed:", err);
      setError(err.message || "Error al generar planificación completa.");
    } finally {
      setIsGeneratingAll(false);
    }
  };

  const getTotalHours = () => {
    if (!selectedModule?.stages) return 0;
    return Object.values(selectedModule.stages).reduce((acc, stage) => {
      const hours = parseInt(stage.time) || 0;
      return acc + hours;
    }, 0);
  };

  const totalHours = getTotalHours();
  const isOverLimit = selectedModule ? totalHours > selectedModule.hoursPerWeek : false;

  const getGroupHours = (keys: (keyof ActionStages)[]) => {
    if (!selectedModule?.stages) return 0;
    return keys.reduce((acc, key) => acc + (parseInt(selectedModule.stages![key].time) || 0), 0);
  };

  const prepHours = getGroupHours(['inform', 'plan', 'decide']);
  const execHours = getGroupHours(['execute']);
  const valHours = getGroupHours(['control', 'value']);

  if (ownModules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="bg-slate-100 p-6 rounded-full">
          <Info className="w-12 h-12 text-slate-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900">No hay módulos propios</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            La metodología de Acción Completa solo se aplica a los módulos técnicos de tu especialidad. 
            Regresa al paso anterior y agrega módulos que no sean "Externos".
          </p>
        </div>
      </div>
    );
  }

  const currentStages = selectedModule?.stages || {
    inform: { ...INITIAL_STAGE },
    plan: { ...INITIAL_STAGE },
    decide: { ...INITIAL_STAGE },
    execute: { ...INITIAL_STAGE },
    control: { ...INITIAL_STAGE },
    value: { ...INITIAL_STAGE },
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-100 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Etapas de Acción Completa</h2>
          <p className="text-slate-500">Desarrolla las 6 etapas pedagógicas para cada módulo.</p>
        </div>
        
        <div className="flex flex-col md:items-end gap-2">
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Módulo:</label>
            <select
              value={selectedModuleId}
              onChange={(e) => setSelectedModuleId(e.target.value)}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ownModules.map(m => (
                <option key={m.id} value={m.id}>{m.code} - {m.name}</option>
              ))}
            </select>
          </div>
          {selectedModule && (
            <div className={cn(
              "flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold",
              isOverLimit ? "bg-red-100 text-red-600" : "bg-blue-50 text-blue-600"
            )}>
              <Info className="w-3 h-3" />
              <span>
                Horas: {totalHours} / {selectedModule.hoursPerWeek} por semana
              </span>
              {isOverLimit && <span className="ml-1">(Excede el límite)</span>}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="font-medium">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
            <ChevronRight className="w-4 h-4 rotate-90" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1 space-y-2">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4 shadow-sm space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Objetivo del Módulo</label>
              <textarea
                value={selectedModule?.objective || ''}
                onChange={(e) => updateModuleObjective(selectedModuleId, e.target.value)}
                placeholder="Escribe el objetivo del módulo..."
                rows={3}
                className="w-full px-3 py-2 rounded-xl border border-slate-100 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none text-xs resize-none transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Competencias</label>
              <textarea
                value={selectedModule?.competencies || ''}
                onChange={(e) => updateModuleCompetencies(selectedModuleId, e.target.value)}
                placeholder="Competencias a desarrollar..."
                rows={3}
                className="w-full px-3 py-2 rounded-xl border border-slate-100 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none text-xs resize-none transition-all"
              />
            </div>
          </div>

          {ACTION_STAGES_KEYS.map((stage) => (
            <button
              key={stage.key}
              onClick={() => setSelectedStageKey(stage.key)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-4 rounded-2xl border transition-all text-left",
                selectedStageKey === stage.key
                  ? "bg-blue-600 border-blue-700 text-white shadow-md shadow-blue-100 translate-x-2"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              )}
            >
              <div className="flex flex-col">
                <span className="font-bold">{stage.label}</span>
                {currentStages[stage.key].time && (
                  <span className={cn("text-[10px] font-medium", selectedStageKey === stage.key ? "text-blue-100" : "text-slate-400")}>
                    {currentStages[stage.key].time}
                  </span>
                )}
              </div>
              <ChevronRight className={cn("w-4 h-4 transition-transform", selectedStageKey === stage.key ? "rotate-0" : "opacity-0")} />
            </button>
          ))}

          <div className="pt-6 space-y-4">
            <button
              onClick={handleSuggestAll}
              disabled={isGeneratingAll}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-br from-indigo-600 to-blue-700 text-white p-4 rounded-2xl font-bold hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              {isGeneratingAll ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Wand2 className="w-5 h-5" />
              )}
              Sugerir todo con IA
            </button>

            {selectedModule && (
              <div className="bg-slate-900 rounded-2xl p-4 text-white shadow-xl">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Distribución del Módulo</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-1">
                    <span className="text-slate-400">Preparación</span>
                    <span className="font-bold text-blue-400">{prepHours}h</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-800 pb-1">
                    <span className="text-slate-400">Ejecución</span>
                    <span className="font-bold text-green-400">{execHours}h</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-800 pb-1">
                    <span className="text-slate-400">Valoración</span>
                    <span className="font-bold text-amber-400">{valHours}h</span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="font-black uppercase tracking-tighter">Total</span>
                    <span className={cn("font-black text-sm", isOverLimit ? "text-red-400" : "text-white")}>
                      {totalHours}h
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Editor Area */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h3 className="font-black text-slate-700 uppercase tracking-widest text-xs">
                  Editando: {ACTION_STAGES_KEYS.find(k => k.key === selectedStageKey)?.label}
                </h3>
                <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1 rounded-lg">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tiempo:</label>
                  <input
                    type="text"
                    value={currentStages[selectedStageKey].time}
                    onChange={(e) => updateStageFields(selectedModuleId, selectedStageKey, { time: e.target.value })}
                    placeholder="Ej. 2 horas"
                    className="text-xs font-bold text-slate-600 outline-none w-20"
                  />
                </div>
              </div>
              <button
                onClick={handleSuggestStage}
                disabled={isGenerating}
                className="flex items-center gap-2 bg-white border border-blue-200 text-blue-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-50 transition-all active:scale-95 disabled:opacity-50"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                Sugerir con IA
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { key: 'guidingQuestions', label: 'Preguntas Guía' },
                { key: 'teacherActivities', label: 'Actividades del Docente' },
                { key: 'studentActivities', label: 'Actividades de los Estudiantes' },
                { key: 'methodologicalStrategies', label: 'Estrategias Metodológicas' },
                { key: 'evaluation', label: 'Evaluación' },
                { key: 'resources', label: 'Recursos' },
              ].map((field) => (
                <div key={field.key} className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{field.label}</label>
                  <textarea
                    value={currentStages[selectedStageKey][field.key as keyof ActionStage]}
                    onChange={(e) => updateStageFields(selectedModuleId, selectedStageKey, { [field.key]: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-slate-50/30 resize-none transition-all"
                    placeholder={`Ingresa ${field.label.toLowerCase()}...`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

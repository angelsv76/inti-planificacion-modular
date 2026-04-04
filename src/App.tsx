/**
 * Planificación por Módulo — INTI
 * © 2026 Angel Sanchez. Todos los derechos reservados.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppData, Specialty, Level, Period, Module } from './types';
import Step1Data from './components/Step1Data';
import Step2Calendar from './components/Step2Calendar';
import Step3Modules from './components/Step3Modules';
import Step4ActionStages from './components/Step4ActionStages';
import Step5Generate from './components/Step5Generate';
import { ChevronRight, ChevronLeft, GraduationCap, FileText, Calendar, Layers, Sparkles, Download } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const STEPS = [
  { id: 1, title: 'Datos', icon: GraduationCap },
  { id: 2, title: 'Calendario', icon: Calendar },
  { id: 3, title: 'Módulos', icon: Layers },
  { id: 4, title: 'Acción Completa', icon: Sparkles },
  { id: 5, title: 'Generar', icon: Download },
];

export default function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<AppData>({
    specialty: 'DS',
    level: '1°',
    section: 'A',
    period: '1°',
    teacherName: '',
    year: new Date().getFullYear(),
    startDate: '',
    holidays: [],
    modules: [],
    vacationRange: null,
  });

  const updateData = (newData: Partial<AppData>) => {
    setData(prev => ({ ...prev, ...newData }));
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 5));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <FileText className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">Planificación por Módulo — INTI</h1>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Instituto Nacional Técnico Industrial</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div 
                  key={step.id}
                  className={cn(
                    "flex flex-col items-center gap-1 transition-colors",
                    isActive ? "text-blue-600" : isCompleted ? "text-green-600" : "text-slate-400"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all",
                    isActive ? "border-blue-600 bg-blue-50" : isCompleted ? "border-green-600 bg-green-50" : "border-slate-200"
                  )}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest">{step.title}</span>
                </div>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[600px] flex flex-col">
          <div className="p-6 sm:p-8 flex-grow">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {currentStep === 1 && <Step1Data data={data} updateData={updateData} />}
                {currentStep === 2 && <Step2Calendar data={data} updateData={updateData} />}
                {currentStep === 3 && <Step3Modules data={data} updateData={updateData} />}
                {currentStep === 4 && <Step4ActionStages data={data} updateData={updateData} />}
                {currentStep === 5 && <Step5Generate data={data} />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer Navigation */}
          <div className="bg-slate-50 border-t border-slate-200 p-4 sm:px-8 flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
                currentStep === 1 
                  ? "text-slate-300 cursor-not-allowed" 
                  : "text-slate-600 hover:bg-slate-100 active:scale-95"
              )}
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>
            
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Paso {currentStep} de 5</span>
            </div>

            <button
              onClick={nextStep}
              disabled={currentStep === 5}
              className={cn(
                "flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all shadow-sm",
                currentStep === 5
                  ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95 hover:shadow-md"
              )}
            >
              {currentStep === 5 ? 'Finalizado' : 'Siguiente'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>

      {/* Copyright Footer */}
      <footer className="text-center py-4 text-xs text-slate-400">
        © {new Date().getFullYear()} Angel Sanchez. Todos los derechos reservados.
      </footer>
    </div>
  );
}

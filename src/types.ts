
export type Specialty = 'MA' | 'MI' | 'EL' | 'SEER' | 'DS' | 'ITSI';
export type Level = '1°' | '2°' | '3°';
export type Period = '1°' | '2°' | '3°' | '4°';

export interface Module {
  id: string;
  code: string;
  name: string;
  objective: string;
  competencies: string;
  weeks: number;
  hoursPerWeek: number;
  isExternal: boolean; // For English/Entrepreneurship
  startWeek: number; // 1-10
  stages?: ActionStages;
}

export interface ActionStage {
  time: string; // Suggested time (e.g. "2 horas")
  guidingQuestions: string;
  teacherActivities: string;
  studentActivities: string;
  methodologicalStrategies: string;
  evaluation: string;
  resources: string;
}

export interface ActionStages {
  inform: ActionStage;
  plan: ActionStage;
  decide: ActionStage;
  execute: ActionStage;
  control: ActionStage;
  value: ActionStage;
}

export interface Holiday {
  date: string; // ISO format
  name: string;
  isFixed: boolean;
}

export interface AppData {
  specialty: Specialty;
  level: Level;
  section: string;
  period: Period;
  teacherName: string;
  year: number;
  startDate: string;
  holidays: Holiday[];
  modules: Module[];
  vacationRange: { start: string; end: string } | null;
}


import { Holiday, Specialty } from "./types";

export const SPECIALTIES: { value: Specialty; label: string }[] = [
  { value: 'MA', label: 'Mantenimiento Automotriz' },
  { value: 'MI', label: 'Mecánica Industrial' },
  { value: 'EL', label: 'Electrónica' },
  { value: 'SEER', label: 'Sistemas Eléctricos y Energías Renovables' },
  { value: 'DS', label: 'Desarrollo de Software' },
  { value: 'ITSI', label: 'Infraestructura Tecnológica y Servicios Informáticos' },
];

export const LEVELS = ['1°', '2°', '3°'];
export const PERIODS = ['1°', '2°', '3°', '4°'];
export const SECTIONS = Array.from({ length: 16 }, (_, i) => String.fromCharCode(65 + i)); // A-P

export const SALVADORAN_HOLIDAYS: Omit<Holiday, 'date'>[] = [
  { name: 'Año Nuevo', isFixed: true }, // Jan 1
  { name: 'Día del Trabajo', isFixed: true }, // May 1
  { name: 'Día de la Madre', isFixed: true }, // May 10
  { name: 'Día del Padre', isFixed: true }, // Jun 17
  { name: 'Día del Maestro', isFixed: true }, // Jun 22
  { name: 'Fiestas Agostinas', isFixed: true }, // Aug 3-6
  { name: 'Día de la Independencia', isFixed: true }, // Sep 15
  { name: 'Día de los Difuntos', isFixed: true }, // Nov 2
  { name: 'Navidad', isFixed: true }, // Dec 25
];

export const ACTION_STAGES_KEYS = [
  { key: 'inform', label: 'Informarse' },
  { key: 'plan', label: 'Planificar' },
  { key: 'decide', label: 'Decidir' },
  { key: 'execute', label: 'Ejecutar' },
  { key: 'control', label: 'Controlar' },
  { key: 'value', label: 'Valorar' },
] as const;

export const INITIAL_STAGE: any = {
  time: '',
  guidingQuestions: '',
  teacherActivities: '',
  studentActivities: '',
  methodologicalStrategies: '',
  evaluation: '',
  resources: '',
};

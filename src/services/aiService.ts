
import { GoogleGenAI, Type } from "@google/genai";
import { ActionStages, Specialty } from "../types";

export async function suggestCompetencies(
  specialty: Specialty,
  moduleName: string,
  objective: string
) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY no está configurada. Por favor, agrégala en los Secretos.");
  }
  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";
  const prompt = `
    Eres un experto pedagogo técnico del MINEDUCYT de El Salvador.
    Genera las competencias a desarrollar para un módulo técnico.
    Especialidad: ${specialty}
    Módulo: ${moduleName}
    Objetivo del módulo: ${objective}

    Genera una lista de competencias (técnicas, sociales y de gestión) que el estudiante debe alcanzar.
    Responde ÚNICAMENTE con el texto de las competencias, separadas por puntos o en una lista breve.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });

  return response.text || "";
}

export async function suggestStage(
  specialty: Specialty,
  moduleName: string,
  stageLabel: string,
  competencies: string = "",
  context: string = ""
) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY no está configurada. Por favor, agrégala en los Secretos.");
  }
  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";
  const prompt = `
    Eres un experto pedagogo técnico del MINEDUCYT de El Salvador.
    Genera sugerencias para la etapa "${stageLabel}" de la metodología de Acción Completa.
    Especialidad: ${specialty}
    Módulo: ${moduleName}
    Competencias a desarrollar: ${competencies}
    Contexto adicional: ${context}

    Proporciona sugerencias para:
    0. Tiempo sugerido (ej. "2 horas", "4 horas", etc.)
    1. Preguntas guía
    2. Actividades del docente
    3. Actividades de los estudiantes
    4. Estrategias metodológicas
    5. Evaluación
    6. Recursos

    Responde en formato JSON con estas llaves exactas:
    time, guidingQuestions, teacherActivities, studentActivities, methodologicalStrategies, evaluation, resources
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          time: { type: Type.STRING },
          guidingQuestions: { type: Type.STRING },
          teacherActivities: { type: Type.STRING },
          studentActivities: { type: Type.STRING },
          methodologicalStrategies: { type: Type.STRING },
          evaluation: { type: Type.STRING },
          resources: { type: Type.STRING },
        },
        required: ["time", "guidingQuestions", "teacherActivities", "studentActivities", "methodologicalStrategies", "evaluation", "resources"],
      },
    },
  });

  return JSON.parse(response.text);
}

export async function suggestAllStages(
  specialty: Specialty,
  moduleName: string,
  hoursPerWeek: number,
  competencies: string = "",
  context: string = ""
) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY no está configurada. Por favor, agrégala en los Secretos.");
  }
  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";
  const prompt = `
    Eres un experto pedagogo técnico del MINEDUCYT de El Salvador.
    Genera una planificación completa de las 6 etapas de la metodología de Acción Completa.
    Especialidad: ${specialty}
    Módulo: ${moduleName}
    Competencias a desarrollar: ${competencies}
    Contexto adicional: ${context}

    REGLAS DE TIEMPO (CRÍTICO):
    - El tiempo total asignado al módulo es de ${hoursPerWeek} horas por semana.
    - La sumatoria del tiempo de las 6 etapas NO DEBE SUPERAR las ${hoursPerWeek} horas.
    - El tiempo debe estar balanceado, dando PRIORIDAD (más horas) a las etapas de:
      1. Informarse (inform)
      2. Planificar (plan)
      3. Ejecutar (execute)
      4. Valorar (value)
    - Las etapas de Decidir (decide) y Controlar (control) deben tener menos tiempo asignado.

    Las 6 etapas son: Informarse, Planificar, Decidir, Ejecutar, Controlar, Valorar.
    Para cada etapa, proporciona:
    - Tiempo sugerido (ej. "2 horas", "4 horas", etc. Solo el número y la palabra "horas")
    - Preguntas guía
    - Actividades del docente
    - Actividades de los estudiantes
    - Estrategias metodológicas
    - Evaluación
    - Recursos

    Responde en formato JSON donde las llaves sean: inform, plan, decide, execute, control, value.
    Cada una debe contener el objeto con las 7 sub-llaves mencionadas (incluyendo 'time').
  `;

  const stageSchema = {
    type: Type.OBJECT,
    properties: {
      time: { type: Type.STRING },
      guidingQuestions: { type: Type.STRING },
      teacherActivities: { type: Type.STRING },
      studentActivities: { type: Type.STRING },
      methodologicalStrategies: { type: Type.STRING },
      evaluation: { type: Type.STRING },
      resources: { type: Type.STRING },
    },
    required: ["time", "guidingQuestions", "teacherActivities", "studentActivities", "methodologicalStrategies", "evaluation", "resources"],
  };

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          inform: stageSchema,
          plan: stageSchema,
          decide: stageSchema,
          execute: stageSchema,
          control: stageSchema,
          value: stageSchema,
        },
        required: ["inform", "plan", "decide", "execute", "control", "value"],
      },
    },
  });

  return JSON.parse(response.text);
}

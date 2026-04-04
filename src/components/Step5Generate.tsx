
import { AppData, ActionStages } from '../types';
import { SPECIALTIES, ACTION_STAGES_KEYS, INITIAL_STAGE } from '../constants';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, PageOrientation } from 'docx';
import { saveAs } from 'file-saver';
import { FileText, Download, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  data: AppData;
}

export default function Step5Generate({ data }: Props) {
  const sectionCode = `${data.specialty}${data.level.charAt(0)}${data.section}`;
  const specialtyLabel = SPECIALTIES.find(s => s.value === data.specialty)?.label || data.specialty;

  const generateWord = async () => {
    const doc = new Document({
      sections: [
        ...data.modules.filter(m => !m.isExternal).map(module => {
          const totalModuleHours = module.weeks * module.hoursPerWeek;
          const stages = module.stages || {
            inform: { ...INITIAL_STAGE },
            plan: { ...INITIAL_STAGE },
            decide: { ...INITIAL_STAGE },
            execute: { ...INITIAL_STAGE },
            control: { ...INITIAL_STAGE },
            value: { ...INITIAL_STAGE },
          };

          const getHours = (stageKey: keyof ActionStages) => parseInt(stages[stageKey].time) || 0;
          const prepHours = getHours('inform') + getHours('plan') + getHours('decide');
          const execHours = getHours('execute');
          const valHours = getHours('control') + getHours('value');
          const totalHoursCalculated = prepHours + execHours + valHours;

          const getEndDate = (start: string, weeks: number) => {
            if (!start) return "";
            const d = new Date(start);
            d.setDate(d.getDate() + (weeks * 7) - 1);
            return d.toLocaleDateString('es-ES');
          };

          return {
            properties: {
              page: {
                size: {
                  orientation: PageOrientation.LANDSCAPE,
                },
              },
            },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "INSTITUTO NACIONAL TÉCNICO INDUSTRIAL",
                    bold: true,
                    size: 24,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "PLANIFICACIÓN POR MÓDULO",
                    bold: true,
                    size: 20,
                  }),
                ],
              }),
              new Paragraph({ text: "" }),

              // Header Table
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Institución", bold: true, size: 18 })] })], width: { size: 15, type: WidthType.PERCENTAGE } }),
                      new TableCell({ children: [new Paragraph("INSTITUTO NACIONAL TÉCNICO INDUSTRIAL")], columnSpan: 2 }),
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Docente facilitador", bold: true, size: 18 })] })], width: { size: 15, type: WidthType.PERCENTAGE } }),
                      new TableCell({ children: [new Paragraph(data.teacherName)], columnSpan: 2 }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Módulo", bold: true, size: 18 })] })] }),
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Competencia", bold: true, size: 18 })] })], columnSpan: 2 }),
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Especialidad de BTV", bold: true, size: 18 })] })], columnSpan: 2 }),
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Nivel", bold: true, size: 18 })] })] }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph(module.code)] }),
                      new TableCell({ children: [new Paragraph(module.competencies || module.name)], columnSpan: 2 }),
                      new TableCell({ children: [new Paragraph(specialtyLabel)], columnSpan: 2 }),
                      new TableCell({ children: [new Paragraph(data.level)] }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Objetivo del módulo", bold: true, size: 18 })] })] }),
                      new TableCell({ children: [new Paragraph(module.objective)], columnSpan: 3 }),
                      new TableCell({ 
                        children: [
                          new Paragraph(`No. horas: ${module.hoursPerWeek}`),
                          new Paragraph(`No. semanas: ${module.weeks}`)
                        ],
                        columnSpan: 1 
                      }),
                      new TableCell({ 
                        children: [
                          new Paragraph(`Fecha inicio: ${data.startDate || ""}`),
                          new Paragraph(`Fecha fin: ${getEndDate(data.startDate, module.weeks)}`)
                        ],
                        columnSpan: 1 
                      }),
                    ],
                  }),
                ],
              }),
              new Paragraph({ text: "" }),

              // Main Action Stages Table
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Etapa", bold: true, size: 18 })] })], verticalAlign: AlignmentType.CENTER }),
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Preguntas guías", bold: true, size: 18 })] })], verticalAlign: AlignmentType.CENTER }),
                      new TableCell({ 
                        children: [
                          new Paragraph({ children: [new TextRun({ text: "Actividades", bold: true, size: 18 })], alignment: AlignmentType.CENTER }),
                          new Table({
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.SINGLE } },
                            rows: [
                              new TableRow({
                                children: [
                                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Docente", bold: true, size: 16 })], alignment: AlignmentType.CENTER })] }),
                                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Estudiantes", bold: true, size: 16 })], alignment: AlignmentType.CENTER })] }),
                                ],
                              }),
                            ],
                          })
                        ],
                        columnSpan: 1
                      }),
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Estrategias", bold: true, size: 18 })] })], verticalAlign: AlignmentType.CENTER }),
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Evaluación", bold: true, size: 18 })] })], verticalAlign: AlignmentType.CENTER }),
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Recursos", bold: true, size: 18 })] })], verticalAlign: AlignmentType.CENTER }),
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Duración horas", bold: true, size: 18 })] })], verticalAlign: AlignmentType.CENTER }),
                    ],
                  }),
                  ...ACTION_STAGES_KEYS.map(stage => {
                    const s = module.stages?.[stage.key];
                    return new TableRow({
                      children: [
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: stage.label, bold: true, size: 18 })] })] }),
                        new TableCell({ children: [new Paragraph(s?.guidingQuestions || "")] }),
                        new TableCell({ 
                          children: [
                            new Table({
                              width: { size: 100, type: WidthType.PERCENTAGE },
                              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.SINGLE } },
                              rows: [
                                new TableRow({
                                  children: [
                                    new TableCell({ children: [new Paragraph(s?.teacherActivities || "")] }),
                                    new TableCell({ children: [new Paragraph(s?.studentActivities || "")] }),
                                  ],
                                }),
                              ],
                            })
                          ]
                        }),
                        new TableCell({ children: [new Paragraph(s?.methodologicalStrategies || "")] }),
                        new TableCell({ children: [new Paragraph(s?.evaluation || "")] }),
                        new TableCell({ children: [new Paragraph(s?.resources || "")] }),
                        new TableCell({ children: [new Paragraph(s?.time || "")] }),
                      ],
                    });
                  }),
                ],
              }),
              new Paragraph({ text: "" }),
              new Paragraph({ text: "" }),

              // Distribution Table
              new Paragraph({
                children: [new TextRun({ text: "DISTRIBUCIÓN DEL MÓDULO", bold: true, size: 20 })],
              }),
              new Table({
                alignment: AlignmentType.CENTER,
                width: { size: 60, type: WidthType.PERCENTAGE },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({ 
                        children: [new Paragraph({ children: [new TextRun({ text: "Distribución de horas por etapas de la acción completa", bold: true, size: 14 })], alignment: AlignmentType.CENTER })],
                        columnSpan: 3
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Etapa", bold: true, size: 14 })], alignment: AlignmentType.CENTER })], columnSpan: 2 }),
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Horas", bold: true, size: 14 })], alignment: AlignmentType.CENTER })] }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `Preparación\n${prepHours} horas`, bold: true, size: 12 })], alignment: AlignmentType.CENTER })], verticalMerge: "restart" }),
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Informarse", size: 12 })] })] }),
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: stages.inform.time, size: 12 })], alignment: AlignmentType.CENTER })] }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({ children: [], verticalMerge: "continue" }),
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Planificar", size: 12 })] })] }),
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: stages.plan.time, size: 12 })], alignment: AlignmentType.CENTER })] }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({ children: [], verticalMerge: "continue" }),
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Decidir", size: 12 })] })] }),
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: stages.decide.time, size: 12 })], alignment: AlignmentType.CENTER })] }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `Ejecución\n${execHours} horas`, bold: true, size: 12 })], alignment: AlignmentType.CENTER })] }),
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Ejecutar", size: 12 })] })] }),
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: stages.execute.time, size: 12 })], alignment: AlignmentType.CENTER })] }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `Valoración\n${valHours} horas`, bold: true, size: 12 })], alignment: AlignmentType.CENTER })], verticalMerge: "restart" }),
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Controlar", size: 12 })] })] }),
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: stages.control.time, size: 12 })], alignment: AlignmentType.CENTER })] }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({ children: [], verticalMerge: "continue" }),
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Valorar", size: 12 })] })] }),
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: stages.value.time, size: 12 })], alignment: AlignmentType.CENTER })] }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Total", bold: true, size: 12 })], alignment: AlignmentType.RIGHT })], columnSpan: 2 }),
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${totalHoursCalculated} horas`, bold: true, size: 12 })], alignment: AlignmentType.CENTER })] }),
                    ],
                  }),
                ],
              }),
              new Paragraph({ text: "" }),
              new Paragraph({ text: "" }),

              // Signatures
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: {
                  top: { style: BorderStyle.NONE },
                  bottom: { style: BorderStyle.NONE },
                  left: { style: BorderStyle.NONE },
                  right: { style: BorderStyle.NONE },
                  insideHorizontal: { style: BorderStyle.NONE },
                  insideVertical: { style: BorderStyle.NONE },
                },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph({ text: "f. __________________________", alignment: AlignmentType.CENTER }), new Paragraph({ text: "Docente", alignment: AlignmentType.CENTER })] }),
                      new TableCell({ children: [new Paragraph({ text: "f. __________________________", alignment: AlignmentType.CENTER }), new Paragraph({ text: "Coordinador de Especialidad", alignment: AlignmentType.CENTER })] }),
                      new TableCell({ children: [new Paragraph({ text: "f. __________________________", alignment: AlignmentType.CENTER }), new Paragraph({ text: "Subdirector Técnico", alignment: AlignmentType.CENTER })] }),
                    ],
                  }),
                ],
              }),
              new Paragraph({ text: "", pageBreakBefore: true }),
            ],
          };
        }),
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Planificacion_${sectionCode}_P${data.period.charAt(0)}_${data.year}.docx`);
  };

  const isComplete = data.teacherName && data.startDate && data.modules.length > 0 && data.modules.every(m => m.isExternal || m.stages);

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-2xl font-bold text-slate-900">Vista Previa y Descarga</h2>
        <p className="text-slate-500">Revisa tu planificación antes de generar el documento oficial.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-900 p-8 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-black tracking-tight">INTI</h1>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Planificación Modular</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-blue-400">{sectionCode}</div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Periodo {data.period}</p>
                </div>
              </div>
              
              <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500 block text-[10px] font-black uppercase tracking-widest">Docente</span>
                  <span className="font-bold">{data.teacherName || 'No especificado'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] font-black uppercase tracking-widest">Especialidad</span>
                  <span className="font-bold">{specialtyLabel}</span>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-8">
              <div>
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-4 border-b pb-2">Módulos a Planificar</h3>
                <div className="space-y-4">
                  {data.modules.map(m => (
                    <div key={m.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-black text-slate-600">
                          {m.code}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700">{m.name}</span>
                          {m.objective && (
                            <span className="text-[10px] text-slate-400 line-clamp-1 italic">"{m.objective}"</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {m.isExternal ? (
                          <span className="text-[10px] font-black text-slate-400 uppercase">Externo</span>
                        ) : m.stages ? (
                          <span className="flex items-center gap-1 text-[10px] font-black text-green-600 uppercase">
                            <CheckCircle2 className="w-3 h-3" /> Completo
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] font-black text-amber-600 uppercase">
                            <AlertCircle className="w-3 h-3" /> Pendiente
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-4">Resumen de Calendario</h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-1">Inicio de Periodo</span>
                    <span className="font-bold text-slate-700">{data.startDate || 'No definida'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Días de Asueto</span>
                    <span className="font-bold text-slate-700">{data.holidays.length} días</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-100 space-y-6">
            <div className="bg-blue-500/30 w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Generar Documento</h3>
              <p className="text-blue-100 text-sm mt-2">
                Se generará un archivo .docx en formato horizontal listo para imprimir y firmar.
              </p>
            </div>

            <button
              onClick={generateWord}
              className="w-full bg-white text-blue-600 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-blue-50 transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Descargar Word
            </button>

            {!isComplete && (
              <div className="flex items-start gap-2 text-blue-200 text-[10px] font-bold uppercase leading-relaxed">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Atención: Faltan datos por completar. El documento podría estar incompleto.</span>
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
            <h4 className="font-black text-slate-900 uppercase tracking-widest text-[10px]">Próximos Pasos</h4>
            <ul className="space-y-3">
              {[
                'Imprimir en papel bond tamaño carta',
                'Solicitar firma del Coordinador',
                'Entregar a Subdirección Técnica',
                'Subir copia digital a Google Drive'
              ].map((step, i) => (
                <li key={i} className="flex items-center gap-3 text-xs text-slate-600 font-medium">
                  <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
                    {i + 1}
                  </div>
                  {step}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

import pdfMake from 'pdfmake/build/pdfmake';
import vfsFonts from 'pdfmake/build/vfs_fonts';
import {
  QUESTIONNAIRE_STATUS,
  getQuestionnaireType,
  getQuestionnaireFields,
  getQuestionnaireConditionalFields,
  computeQuestionnaireStatus,
} from './questionnaireTypes';
import { achievementYearLabel } from './birthdayAnketa';
import { formatTimestamptzIrkutskDateTime, formatTimestamptzIrkutskDate } from './irkutskTime';

pdfMake.vfs = vfsFonts.pdfMake?.vfs ?? vfsFonts;

function answersOf(row) {
  return row?.payload?.answers && typeof row.payload.answers === 'object' ? row.payload.answers : {};
}

function achievementsOf(row) {
  return Array.isArray(row?.payload?.achievements) ? row.payload.achievements : [];
}

function answerTable(title, rows) {
  if (!rows.length) return null;
  return [
    { text: title, style: 'section', margin: [0, 12, 0, 4] },
    {
      table: {
        widths: ['40%', '60%'],
        body: rows,
      },
      layout: 'lightHorizontalLines',
    },
  ];
}

/** Формирует и скачивает PDF-файл анкеты. Работает полностью на клиенте. */
export function downloadQuestionnairePdf(row) {
  if (!row) return;
  const answers = answersOf(row);
  const achievements = achievementsOf(row);
  const typeConfig = getQuestionnaireType(row.type);
  const status = computeQuestionnaireStatus(row);
  const statusLabel = QUESTIONNAIRE_STATUS[status] ?? status;

  const metaBody = [
    ['ID', String(row.id)],
    ['Тип анкеты', typeConfig?.label ?? row.type],
    ['Статус', statusLabel],
    ['Имя ребёнка', row.child_name || '-'],
    ['Дата дня рождения', answers.birthdayDate || '-'],
    ['Телефон', row.phone || '-'],
    ['Email', row.email || '-'],
    ['Создана', formatTimestamptzIrkutskDateTime(row.created_at)],
    ['Открыта до', formatTimestamptzIrkutskDate(row.expires_at)],
  ];

  const fields = [
    ...(getQuestionnaireFields(row.type) ?? []),
    ...getQuestionnaireConditionalFields(row.type).filter((f) => f.when(answers)),
  ];
  const fieldsBody = fields.map((f) => [f.label, String(answers[f.key] ?? '').trim() || '-']);

  const achievementsBody = achievements.map((text, i) => [
    achievementYearLabel(i + 1),
    String(text ?? '').trim() || '-',
  ]);

  const docDefinition = {
    info: { title: `Анкета #${row.id}${row.child_name ? ` - ${row.child_name}` : ''}` },
    content: [
      { text: `Анкета #${row.id}${row.child_name ? ` - ${row.child_name}` : ''}`, style: 'header' },
      {
        table: { widths: ['30%', '70%'], body: metaBody },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 4],
      },
      ...[
        answerTable('Ответы анкеты', fieldsBody),
        typeConfig?.hasAchievements ? answerTable('Главные достижения каждого года', achievementsBody) : null,
      ].filter(Boolean),
    ].flat(),
    styles: {
      header: { fontSize: 16, bold: true, margin: [0, 0, 0, 10] },
      section: { fontSize: 12, bold: true },
    },
    defaultStyle: { fontSize: 10 },
  };

  pdfMake.createPdf(docDefinition).download(`anketa-${row.id}.pdf`);
}

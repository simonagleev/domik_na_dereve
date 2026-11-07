import {
  BIRTHDAY_TYPE,
  BIRTHDAY_FIELDS,
  BIRTHDAY_CONDITIONAL_FIELDS,
  birthdayProgress,
} from '@/lib/birthdayAnketa';

/**
 * Реестр видов анкет. Новый вид = новый элемент в QUESTIONNAIRE_TYPES
 * + конфиг полей (как birthdayAnketa.js) + рендер формы на клиенте.
 * Таблица в БД (questionnaires) и админ-страница общие для всех типов.
 *
 * progress(payload) - сколько полей заполнено/всего (без достижений по годам;
 * их количество берётся из years_count конкретной анкеты). Нужно для статуса.
 */
export const QUESTIONNAIRE_TYPES = [
  {
    type: BIRTHDAY_TYPE,
    label: 'Анкета для дней рождения',
    progress: birthdayProgress,
    hasAchievements: true,
  },
  {
    type: 'santa',
    label: 'Анкета для поздравления Деда Мороза',
    progress: null,
    hasAchievements: false,
  },
];

export const QUESTIONNAIRE_STATUS = {
  new: 'Новая',
  filling: 'Заполняется',
  completed: 'Заполнена',
  closed: 'Закрыта',
};

export const QUESTIONNAIRE_STATUS_COLORS = {
  new: 'gray',
  filling: 'yellow',
  completed: 'green',
  closed: 'red',
};

export function getQuestionnaireType(type) {
  return QUESTIONNAIRE_TYPES.find((t) => t.type === type) ?? null;
}

/** Поля анкеты по типу (null - формы для этого вида ещё нет). */
export function getQuestionnaireFields(type) {
  switch (type) {
    case BIRTHDAY_TYPE:
      return BIRTHDAY_FIELDS;
    default:
      return null;
  }
}

/** Условные поля анкеты по типу (показываются только при выполнении условия). */
export function getQuestionnaireConditionalFields(type) {
  switch (type) {
    case BIRTHDAY_TYPE:
      return BIRTHDAY_CONDITIONAL_FIELDS;
    default:
      return [];
  }
}

export function questionnaireLink(token) {
  return `/anketa/${token}`;
}

export function isQuestionnaireRowClosed(row) {
  if (row?.closed_at) return true;
  if (!row?.expires_at) return false;
  return new Date(row.expires_at).getTime() <= Date.now();
}

function defaultProgress(payload, type) {
  const fields = getQuestionnaireFields(type) ?? [];
  const answers = payload?.answers && typeof payload.answers === 'object' ? payload.answers : {};
  let filled = 0;
  let total = 0;
  for (const f of fields) {
    total += 1;
    if (String(answers[f.key] ?? '').trim()) filled += 1;
  }
  return { filled, total };
}

/**
 * Прогресс заполнения анкеты: { filled, total } - поля анкеты + достижения каждого года.
 * Условные поля считаются только когда показаны (например, детали при ответе «Да»).
 */
export function computeQuestionnaireProgress(row) {
  const typeConfig = getQuestionnaireType(row?.type);
  const payload = row?.payload ?? {};
  const base = typeof typeConfig?.progress === 'function' ? typeConfig.progress(payload) : defaultProgress(payload, row?.type);

  const achievements = Array.isArray(payload.achievements) ? payload.achievements : [];
  let achFilled = 0;
  for (const v of achievements) {
    if (String(v ?? '').trim()) achFilled += 1;
  }

  return {
    filled: base.filled + achFilled,
    total: base.total + (row?.years_count || 0),
  };
}

/**
 * Статус вычисляется, а не хранится:
 * - 'closed'    - админ закрыл анкету (closed_at) или вышел срок жизни (expires_at)
 * - 'new'       - не заполнено ни одного поля
 * - 'completed' - заполнены ВСЕ поля (включая достижения каждого года)
 * - 'filling'   - заполнено хотя бы одно, но не все
 */
export function computeQuestionnaireStatus(row) {
  if (isQuestionnaireRowClosed(row)) return 'closed';

  const { filled, total } = computeQuestionnaireProgress(row);
  if (total === 0 || filled === 0) return 'new';
  if (filled >= total) return 'completed';
  return 'filling';
}

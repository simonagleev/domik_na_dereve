export const BIRTHDAY_TYPE = 'birthday';

export const BIRTHDAY_TITLE = 'Анкета для дня рождения';

export const BIRTHDAY_HERO_LEAD =
  'Расскажите об имениннике - чем больше мы знаем, тем ярче получится праздник. Анкету можно заполнять не ' +
  'спеша: сохраните её и вернитесь по этой же ссылке в любой момент.';

export const BIRTHDAY_FORM_SECTION = 'О имениннике';

/**
 * Поля анкеты: key = ключ в payload.answers, label = подпись в форме и в админке.
 * input: 'select' - выпадающий список из options; 'date' - календарь; 'digits' - только цифры.
 * required: true - обязательный для сохранения.
 */
export const BIRTHDAY_FIELDS = [
  { key: 'name', label: 'Имя' },
  { key: 'petName', label: 'Как называют дома ласково' },
  { key: 'age', label: 'Возраст (сколько исполняется)', input: 'digits' },
  { key: 'birthdayDate', label: 'Дата дня рождения', input: 'date' },
  { key: 'parentName', label: 'Имя мамы/папы' },
  { key: 'siblingName', label: 'Имя брат/сестра' },
  { key: 'pet', label: 'Питомец (любимое животное)' },
  { key: 'favoriteToy', label: 'Любимая игрушка (имя)' },
  { key: 'hobbies', label: 'Увлечения' },
  { key: 'favoriteStory', label: 'Любимая сказка/фильм/книга' },
  { key: 'favoriteCharacter', label: 'Любимый персонаж' },
  { key: 'fears', label: 'Какие страхи?' },
  { key: 'favoriteColor', label: 'Какой любимый цвет?' },
  { key: 'bestFriend', label: 'Имя лучшей подруги/друга' },
  { key: 'dreamJob', label: 'Кем хочет стать' },
  {
    key: 'wasAtBirthdayGuest',
    label: 'Вы уже были на Дне Рождения в Домике на Дереве в качестве гостя?',
    input: 'select',
    options: ['Да', 'Нет'],
  },
];

/**
 * Условные поля: показываются, только когда when(answers) === true.
 * fullWidth - на всю ширину сетки (обе колонки).
 */
export const BIRTHDAY_CONDITIONAL_FIELDS = [
  {
    key: 'wasAtBirthdayDetails',
    label: 'У кого были на дне рождения и в каком месяце?',
    fullWidth: true,
    when: (answers) => answers?.wasAtBirthdayGuest === 'Да',
  },
];

export const DEFAULT_YEARS_COUNT = 7;

/** «1-й год», «2-й год», ... */
export function achievementYearLabel(index) {
  return `${index}-й год`;
}

/** Прогресс заполнения (без достижений по годам - они добавляются отдельно). */
export function birthdayProgress(payload) {
  const answers = payload?.answers && typeof payload.answers === 'object' ? payload.answers : {};
  let filled = 0;
  let total = 0;
  for (const f of BIRTHDAY_FIELDS) {
    total += 1;
    if (String(answers[f.key] ?? '').trim()) filled += 1;
  }
  for (const f of BIRTHDAY_CONDITIONAL_FIELDS) {
    if (!f.when(answers)) continue; // скрытое условное поле в прогресс не считаем
    total += 1;
    if (String(answers[f.key] ?? '').trim()) filled += 1;
  }
  return { filled, total };
}

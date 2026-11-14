export const SANTA_TYPE = 'santa';

export const SANTA_TITLE = 'Анкета для поздравления Деда Мороза';

export const SANTA_HERO_LEAD =
  'Здравствуй, дорогой Дедушка Мороз! Расскажите о ребёнке - по этим ответам мы подготовим поздравление. ' +
  'Анкету можно заполнять не спеша: сохраните её и вернитесь по этой же ссылке в любой момент.';

export const SANTA_FORM_SECTION = 'Письмо Деду Морозу';

/**
 * Поля по анкете «Анкета_для_поздравления_деда_мороза_1.docx».
 */
/** Порядок для сетки 2×N на десктопе: пары половинной ширины, адрес и «мечта» - на всю строку. */
export const SANTA_FIELDS = [
  { key: 'name', label: 'Меня зовут' },
  { key: 'petName', label: 'Дома меня называют' },
  { key: 'age', label: 'Мне исполнилось в этом году', input: 'digits' },
  { key: 'giftWish', label: 'Я хочу получить в подарок (планируемый подарок)' },
  {
    key: 'address',
    label: 'Я живу (точный адрес и домофон)',
    input: 'textarea',
    fullWidth: true,
    rows: 2,
    textareaSize: 'compact',
  },
  { key: 'hobbies', label: 'Больше всего я люблю (увлечения, интересы)' },
  { key: 'learnedThisYear', label: 'В этом году я научился' },
  { key: 'motherName', label: 'Мою маму зовут' },
  { key: 'fatherName', label: 'Моего папу зовут' },
  {
    key: 'dream',
    label: 'Я мечтаю (нематериальное)?',
    input: 'textarea',
    fullWidth: true,
    rows: 5,
    textareaSize: 'tall',
    maxLength: 2000,
  },
];

export const SANTA_CONDITIONAL_FIELDS = [];

export function santaProgress(payload) {
  const answers = payload?.answers && typeof payload.answers === 'object' ? payload.answers : {};
  let filled = 0;
  let total = 0;
  for (const f of SANTA_FIELDS) {
    total += 1;
    if (String(answers[f.key] ?? '').trim()) filled += 1;
  }
  return { filled, total };
}
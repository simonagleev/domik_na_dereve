/** Заявка на выезд Деда Мороза (feedback_requests), не длинная анкета. */
export const DED_MOROZ_REQUEST_TYPE = 'ded_moroz_request';

/** Показывать открытку, пока календарный день Иркутска не позже этой даты (включительно). */
export const DED_MOROZ_BANNER_UNTIL_DATE = '2027-01-14';

/** Доступные даты выезда в календаре заявки (включительно). */
export const DED_MOROZ_BOOKING_FROM = '2026-12-26';
export const DED_MOROZ_BOOKING_TO = '2026-12-31';

export function isDedMorozBookingDate(value) {
  const date = String(value || '').trim();
  return date >= DED_MOROZ_BOOKING_FROM && date <= DED_MOROZ_BOOKING_TO;
}

export const DED_MOROZ_BANNER_STORAGE_KEY = 'ded_moroz_banner_hidden_until';

export const DED_MOROZ_BANNER_DELAY_MS = 1200;

export const DED_MOROZ_BANNER_HIDE_MS = 12 * 60 * 60 * 1000;

/**
 * [СТАРАЯ БД SUPABASE] Клиент и переменные окружения SUPABASE_* больше не используются —
 * чтение/запись идёт в Postgres (см. src/lib/postgres.js).
 * Код ниже сохранён только для истории; при необходимости отката к Supabase раскомментировать.
 *
 * import { createClient } from '@supabase/supabase-js';
 *
 * const supabaseUrl = process.env.SUPABASE_URL;
 * const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
 *
 * export const supabase = createClient(supabaseUrl, supabaseAnonKey);
 */

export {};

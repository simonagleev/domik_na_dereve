'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BIRTHDAY_TITLE,
  BIRTHDAY_FIELDS,
  BIRTHDAY_CONDITIONAL_FIELDS,
  BIRTHDAY_TYPE,
  achievementYearLabel,
} from '@/lib/birthdayAnketa';
import { irkutskTodayDateString, formatTimestamptzIrkutskDateTime } from '@/lib/irkutskTime';
import styles from './anketa.module.css';

const ANSWER_MAX_LENGTH = 500;
const ACHIEVEMENT_MAX_LENGTH = 2000;

function onlyDigits(value) {
  return value.replace(/[^0-9]/g, '');
}

function isFilled(value) {
  return typeof value === 'string' && value.trim() !== '';
}

export default function AnketaClient({ token }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editable, setEditable] = useState(true);
  const [closeReason, setCloseReason] = useState(null); // 'expired' | 'closed' | null
  const [unsupportedType, setUnsupportedType] = useState(false);

  const [answers, setAnswers] = useState({});
  const [achievements, setAchievements] = useState([]);
  const [yearsCount, setYearsCount] = useState(0);

  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [saveError, setSaveError] = useState('');
  const dirtyRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/public/questionnaires?token=${encodeURIComponent(token)}`);
        const json = await res.json();
        if (cancelled) return;

        if (!res.ok) {
          setError(json.error || 'Не удалось загрузить анкету');
          return;
        }

        const q = json.questionnaire;
        if (!q || q.type !== BIRTHDAY_TYPE) {
          setUnsupportedType(true);
          return;
        }

        const loadedAnswers = q?.payload?.answers && typeof q.payload.answers === 'object' ? q.payload.answers : {};
        const loadedAchievements = Array.isArray(q?.payload?.achievements) ? q.payload.achievements : [];
        const count = q?.yearsCount || 0;

        setEditable(Boolean(json.editable));
        setCloseReason(json.reason || null);
        setAnswers(loadedAnswers);
        setYearsCount(count);
        setAchievements(Array.from({ length: count }, (_, i) => String(loadedAchievements[i] ?? '')));
        if (q?.updatedAt && Object.keys(loadedAnswers).length) {
          setSavedAt(new Date(q.updatedAt));
        }
      } catch {
        if (!cancelled) setError('Ошибка сети. Проверьте подключение и обновите страницу.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  // предупреждение об уходе с несохранёнными изменениями
  useEffect(() => {
    const handler = (e) => {
      if (!dirtyRef.current) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  const handleAnswerChange = useCallback(
    (key, value) => {
      if (!editable) return;
      dirtyRef.current = true;
      setSaveError('');
      setAnswers((prev) => {
        const next = { ...prev, [key]: value };
        // ответ изменился не на «Да» - прячем условный вопрос и чистим его ответ
        if (key === 'wasAtBirthdayGuest' && value !== 'Да') {
          delete next.wasAtBirthdayDetails;
        }
        return next;
      });
    },
    [editable]
  );

  const handleAchievementChange = useCallback(
    (index, value) => {
      if (!editable) return;
      dirtyRef.current = true;
      setSaveError('');
      setAchievements((prev) => prev.map((v, i) => (i === index ? value : v)));
    },
    [editable]
  );

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaveError('');
    try {
      const res = await fetch('/api/public/questionnaires', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          payload: { answers, achievements },
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        if (res.status === 403) {
          setEditable(false);
          setCloseReason('closed');
          return;
        }
        if (res.status === 410) {
          setEditable(false);
          setCloseReason('expired');
          return;
        }
        setSaveError(json.error || 'Не удалось сохранить анкету');
        return;
      }
      dirtyRef.current = false;
      setSavedAt(new Date());
    } catch {
      setSaveError('Ошибка сети. Попробуйте ещё раз.');
    } finally {
      setSaving(false);
    }
  }, [token, answers, achievements]);

  if (loading) {
    return (
      <section className={styles.section}>
        <div className={styles.statusCard} role="status" aria-live="polite">
          <p className={styles.statusText}>Загружаем анкету…</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.section}>
        <div className={styles.statusCard}>
          <h1 className={styles.statusTitle}>{BIRTHDAY_TITLE}</h1>
          <p className={styles.errorText} role="alert">
            {error}
          </p>
        </div>
      </section>
    );
  }

  if (unsupportedType) {
    return (
      <section className={styles.section}>
        <div className={styles.statusCard}>
          <p className={styles.statusText}>Этот вид анкеты скоро появится.</p>
        </div>
      </section>
    );
  }

  const closedNotice =
    closeReason === 'expired'
      ? 'Срок заполнения анкеты истёк. Просмотр доступен, редактирование нет.'
      : 'Анкета закрыта для редактирования.';

  // Прогресс считаем только для отображения, на payload он не влияет
  const totalCount = BIRTHDAY_FIELDS.length + yearsCount;
  const filledCount =
    BIRTHDAY_FIELDS.filter((f) => isFilled(answers[f.key])).length +
    achievements.filter((v) => isFilled(v)).length;
  const progressPercent = totalCount ? Math.round((filledCount / totalCount) * 100) : 0;

  return (
    <section className={styles.section}>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>{BIRTHDAY_TITLE}</h1>
        <p className={styles.heroLead}>
          Расскажите об имениннике - чем больше мы знаем, тем ярче получится праздник. Анкету можно заполнять не
          спеша: сохраните её и вернитесь по этой же ссылке в любой момент.
        </p>
      </header>

      {!editable ? <p className={styles.closedBanner}>{closedNotice}</p> : null}

      {editable && totalCount > 0 ? (
        <div className={styles.progress}>
          <div className={styles.progressRow}>
            <span>Заполнено</span>
            <span>
              {filledCount} из {totalCount}
            </span>
          </div>
          <div
            className={styles.progressTrack}
            role="progressbar"
            aria-label="Заполнение анкеты"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progressPercent}
          >
            <div className={styles.progressBar} style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      ) : null}

      <div className={styles.card}>
        <div className={styles.cardHead}>
          <h2 className={styles.subtitle}>О имениннике</h2>
        </div>

        <div className={styles.fields}>
          {BIRTHDAY_FIELDS.map((field) => (
            <div className={styles.field} key={field.key}>
              <label className={styles.label} htmlFor={`field-${field.key}`}>
                {field.label}
              </label>
              {field.input === 'select' ? (
                <select
                  id={`field-${field.key}`}
                  className={styles.input}
                  disabled={!editable}
                  value={answers[field.key] ?? ''}
                  onChange={(e) => handleAnswerChange(field.key, e.target.value)}
                >
                  <option value="">Выберите…</option>
                  {field.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : field.input === 'date' ? (
                <input
                  id={`field-${field.key}`}
                  className={styles.input}
                  type="date"
                  max={irkutskTodayDateString()}
                  disabled={!editable}
                  value={answers[field.key] ?? ''}
                  onChange={(e) => handleAnswerChange(field.key, e.target.value)}
                />
              ) : (
                <input
                  id={`field-${field.key}`}
                  className={styles.input}
                  type="text"
                  inputMode={field.input === 'digits' ? 'numeric' : undefined}
                  maxLength={field.input === 'digits' ? 3 : ANSWER_MAX_LENGTH}
                  disabled={!editable}
                  value={answers[field.key] ?? ''}
                  onChange={(e) =>
                    handleAnswerChange(
                      field.key,
                      field.input === 'digits' ? onlyDigits(e.target.value) : e.target.value
                    )
                  }
                />
              )}
            </div>
          ))}

          {/* Условные вопросы: на всю ширину сетки, только когда выполнено условие */}
          {BIRTHDAY_CONDITIONAL_FIELDS.filter((f) => f.when(answers)).map((field) => (
            <div className={`${styles.field} ${styles.fullWidth}`} key={field.key}>
              <label className={styles.label} htmlFor={`field-${field.key}`}>
                {field.label}
              </label>
              <input
                id={`field-${field.key}`}
                className={styles.input}
                type="text"
                maxLength={ANSWER_MAX_LENGTH}
                disabled={!editable}
                value={answers[field.key] ?? ''}
                onChange={(e) => handleAnswerChange(field.key, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      {yearsCount > 0 ? (
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <h2 className={styles.subtitle}>Главные достижения каждого года</h2>
            <p className={styles.hint}>Пара фраз на каждый год - этого достаточно</p>
          </div>

          <div className={styles.years}>
            {Array.from({ length: yearsCount }, (_, i) => {
              const value = achievements[i] ?? '';
              return (
                <div className={styles.yearCard} key={i}>
                  <div className={styles.yearNumber} aria-hidden="true">
                    {i + 1}
                  </div>
                  <div className={`${styles.field} ${styles.yearBody}`}>
                    <label className={styles.label} htmlFor={`achievement-${i}`}>
                      {achievementYearLabel(i + 1)}
                    </label>
                    <textarea
                      id={`achievement-${i}`}
                      className={`${styles.input} ${styles.textarea}`}
                      rows={3}
                      maxLength={ACHIEVEMENT_MAX_LENGTH}
                      disabled={!editable}
                      value={value}
                      onChange={(e) => handleAchievementChange(i, e.target.value)}
                    />
                    {editable && value.length > ACHIEVEMENT_MAX_LENGTH * 0.8 ? (
                      <span className={styles.counter}>
                        {value.length} / {ACHIEVEMENT_MAX_LENGTH}
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className={styles.footer}>
        {editable ? (
          <>
            <button type="button" className={styles.saveButton} onClick={handleSave} disabled={saving}>
              {saving ? 'Сохраняем…' : 'Сохранить анкету'}
            </button>
            {saveError ? (
              <p className={styles.errorText} role="alert">
                {saveError}
              </p>
            ) : null}
          </>
        ) : (
          <p className={styles.closedText}>Анкета закрыта для редактирования</p>
        )}
        {savedAt && !saveError ? (
          <p className={styles.savedText} role="status" aria-live="polite">
            Сохранено {formatTimestamptzIrkutskDateTime(savedAt)}
          </p>
        ) : null}
      </div>
    </section>
  );
}

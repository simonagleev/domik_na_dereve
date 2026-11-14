'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BIRTHDAY_TITLE,
  BIRTHDAY_TYPE,
  BIRTHDAY_HERO_LEAD,
  BIRTHDAY_FORM_SECTION,
  achievementYearLabel,
} from '@/lib/birthdayAnketa';
import {
  SANTA_TITLE,
  SANTA_TYPE,
  SANTA_HERO_LEAD,
  SANTA_FORM_SECTION,
} from '@/lib/santaAnketa';
import {
  getQuestionnaireFields,
  getQuestionnaireConditionalFields,
} from '@/lib/questionnaireTypes';
import { irkutskTodayDateString, formatTimestamptzIrkutskDateTime } from '@/lib/irkutskTime';
import styles from './anketa.module.css';

const ANSWER_MAX_LENGTH = 500;
const ACHIEVEMENT_MAX_LENGTH = 2000;

const TYPE_UI = {
  [BIRTHDAY_TYPE]: {
    title: BIRTHDAY_TITLE,
    lead: BIRTHDAY_HERO_LEAD,
    section: BIRTHDAY_FORM_SECTION,
  },
  [SANTA_TYPE]: {
    title: SANTA_TITLE,
    lead: SANTA_HERO_LEAD,
    section: SANTA_FORM_SECTION,
  },
};

function onlyDigits(value) {
  return value.replace(/[^0-9]/g, '');
}

function isFilled(value) {
  return typeof value === 'string' && value.trim() !== '';
}

function pruneHiddenConditionalAnswers(answers, conditionalFields) {
  const next = { ...answers };
  for (const f of conditionalFields) {
    if (!f.when(answers)) delete next[f.key];
  }
  return next;
}

function FieldControl({ field, editable, value, onChange }) {
  const id = `field-${field.key}`;

  if (field.input === 'select') {
    return (
      <select
        id={id}
        className={styles.input}
        disabled={!editable}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Выберите…</option>
        {(field.options ?? []).map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  }

  if (field.input === 'date') {
    return (
      <input
        id={id}
        className={styles.input}
        type="date"
        max={irkutskTodayDateString()}
        disabled={!editable}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  if (field.input === 'textarea') {
    const rows = field.rows ?? 3;
    const sizeClass =
      field.textareaSize === 'compact'
        ? styles.textareaCompact
        : field.textareaSize === 'tall'
          ? styles.textareaTall
          : '';
    const maxLen = field.maxLength ?? ANSWER_MAX_LENGTH;

    return (
      <textarea
        id={id}
        className={`${styles.input} ${styles.textarea} ${sizeClass}`.trim()}
        rows={rows}
        maxLength={maxLen}
        disabled={!editable}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  return (
    <input
      id={id}
      className={styles.input}
      type="text"
      inputMode={field.input === 'digits' ? 'numeric' : undefined}
      maxLength={field.input === 'digits' ? 3 : ANSWER_MAX_LENGTH}
      disabled={!editable}
      value={value}
      onChange={(e) => onChange(field.input === 'digits' ? onlyDigits(e.target.value) : e.target.value)}
    />
  );
}

export default function AnketaClient({ token }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editable, setEditable] = useState(true);
  const [closeReason, setCloseReason] = useState(null);
  const [unsupportedType, setUnsupportedType] = useState(false);

  const [anketaType, setAnketaType] = useState(null);
  const [answers, setAnswers] = useState({});
  const [achievements, setAchievements] = useState([]);
  const [yearsCount, setYearsCount] = useState(0);

  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [saveError, setSaveError] = useState('');
  const dirtyRef = useRef(false);

  const baseFields = useMemo(
    () => (anketaType ? getQuestionnaireFields(anketaType) ?? [] : []),
    [anketaType]
  );
  const conditionalFields = useMemo(
    () => (anketaType ? getQuestionnaireConditionalFields(anketaType) : []),
    [anketaType]
  );
  const visibleConditional = useMemo(
    () => conditionalFields.filter((f) => f.when(answers)),
    [conditionalFields, answers]
  );
  const ui = anketaType ? TYPE_UI[anketaType] : null;

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
        if (!q?.type || !getQuestionnaireFields(q.type)) {
          setUnsupportedType(true);
          return;
        }

        const loadedAnswers = q?.payload?.answers && typeof q.payload.answers === 'object' ? q.payload.answers : {};
        const loadedAchievements = Array.isArray(q?.payload?.achievements) ? q.payload.achievements : [];
        const count = q?.yearsCount || 0;

        setAnketaType(q.type);
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
      setAnswers((prev) => pruneHiddenConditionalAnswers({ ...prev, [key]: value }, conditionalFields));
    },
    [editable, conditionalFields]
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
      const payloadAnswers = pruneHiddenConditionalAnswers(answers, conditionalFields);
      const res = await fetch('/api/public/questionnaires', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          payload: { answers: payloadAnswers, achievements },
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
  }, [token, answers, achievements, conditionalFields]);

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
          <h1 className={styles.statusTitle}>{ui?.title ?? 'Анкета'}</h1>
          <p className={styles.errorText} role="alert">
            {error}
          </p>
        </div>
      </section>
    );
  }

  if (unsupportedType || !ui) {
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

  const totalCount =
    baseFields.length + visibleConditional.length + yearsCount;
  const filledCount =
    baseFields.filter((f) => isFilled(answers[f.key])).length +
    visibleConditional.filter((f) => isFilled(answers[f.key])).length +
    achievements.filter((v) => isFilled(v)).length;
  const progressPercent = totalCount ? Math.round((filledCount / totalCount) * 100) : 0;

  return (
    <section className={styles.section}>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>{ui.title}</h1>
        <p className={styles.heroLead}>{ui.lead}</p>
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
          <h2 className={styles.subtitle}>{ui.section}</h2>
        </div>

        <div className={styles.fields}>
          {baseFields.map((field) => (
            <div
              className={`${styles.field} ${field.fullWidth ? styles.fullWidth : ''}`}
              key={field.key}
            >
              <label className={styles.label} htmlFor={`field-${field.key}`}>
                {field.label}
              </label>
              <FieldControl
                field={field}
                editable={editable}
                value={answers[field.key] ?? ''}
                onChange={(v) => handleAnswerChange(field.key, v)}
              />
            </div>
          ))}

          {visibleConditional.map((field) => (
            <div className={`${styles.field} ${styles.fullWidth}`} key={field.key}>
              <label className={styles.label} htmlFor={`field-${field.key}`}>
                {field.label}
              </label>
              <FieldControl
                field={{ ...field, input: field.input ?? 'text' }}
                editable={editable}
                value={answers[field.key] ?? ''}
                onChange={(v) => handleAnswerChange(field.key, v)}
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
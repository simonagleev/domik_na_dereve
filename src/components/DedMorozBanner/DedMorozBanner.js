'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import FeedbackRequestForm from '@/components/FeedbackRequestForm/FeedbackRequestForm';
import { useFeedbackRequestFormStore } from '@/store/feedbackRequestFormStore';
import { irkutskTodayDateString } from '@/lib/irkutskTime';
import {
  DED_MOROZ_REQUEST_TYPE,
  DED_MOROZ_BANNER_UNTIL_DATE,
  DED_MOROZ_BANNER_STORAGE_KEY,
  DED_MOROZ_BANNER_DELAY_MS,
  DED_MOROZ_BANNER_HIDE_MS,
} from '@/lib/dedMorozRequest';
import styles from './DedMorozBanner.module.css';

const SNOWFLAKE_COUNT = 26;

function makeSnowflakes() {
  return Array.from({ length: SNOWFLAKE_COUNT }, (_, i) => ({
    id: i,
    left: `${(i * 37 + 11) % 100}%`,
    delay: `${((i * 0.41) % 7).toFixed(2)}s`,
    duration: `${8 + (i % 6)}s`,
    size: 5 + (i % 8),
    drift: (i % 2 === 0 ? 1 : -1) * (12 + (i % 18)),
  }));
}

function isBannerStillOn() {
  return irkutskTodayDateString() <= DED_MOROZ_BANNER_UNTIL_DATE;
}

function isDismissed() {
  try {
    const until = window.localStorage.getItem(DED_MOROZ_BANNER_STORAGE_KEY);
    if (!until) return false;
    const ts = Number(until);
    return Number.isFinite(ts) && Date.now() < ts;
  } catch {
    return false;
  }
}

function rememberDismiss() {
  try {
    window.localStorage.setItem(
      DED_MOROZ_BANNER_STORAGE_KEY,
      String(Date.now() + DED_MOROZ_BANNER_HIDE_MS)
    );
  } catch {
    /* private mode */
  }
}

export default function DedMorozBanner() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const { isFeedbackRequestFormOpen, openFeedbackRequestForm } = useFeedbackRequestFormStore();
  const snowflakes = useMemo(makeSnowflakes, []);

  useEffect(() => {
    setMounted(true);
    if (!isBannerStillOn() || isDismissed()) return undefined;

    const t = window.setTimeout(() => setOpen(true), DED_MOROZ_BANNER_DELAY_MS);
    return () => window.clearTimeout(t);
  }, []);

  const dismiss = useCallback(() => {
    rememberDismiss();
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape' && !isFeedbackRequestFormOpen) dismiss();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, isFeedbackRequestFormOpen, dismiss]);

  const handleApply = () => {
    rememberDismiss();
    setOpen(false);
    openFeedbackRequestForm(DED_MOROZ_REQUEST_TYPE);
  };

  const showPostcard = mounted && open && !isFeedbackRequestFormOpen;

  const postcard = showPostcard ? (
    <div
      className={styles.overlay}
      onClick={dismiss}
      role="dialog"
      aria-modal="true"
      aria-label="Поздравление Деда Мороза"
    >
      <div className={styles.snow} aria-hidden="true">
        {snowflakes.map((f) => (
          <span
            key={f.id}
            className={styles.flake}
            style={{
              left: f.left,
              animationDelay: f.delay,
              animationDuration: f.duration,
              width: f.size,
              height: f.size,
              ['--drift']: `${f.drift}px`,
            }}
          />
        ))}
      </div>

      <div className={styles.postcardWrap} onClick={(e) => e.stopPropagation()}>
        <span className={`${styles.spark} ${styles.spark1}`} aria-hidden="true" />
        <span className={`${styles.spark} ${styles.spark2}`} aria-hidden="true" />
        <span className={`${styles.spark} ${styles.spark3}`} aria-hidden="true" />
        <span className={`${styles.spark} ${styles.spark4}`} aria-hidden="true" />
        <span className={`${styles.spark} ${styles.spark5}`} aria-hidden="true" />

        <article className={styles.postcard}>
          <button
            type="button"
            className={styles.close}
            onClick={dismiss}
            aria-label="Закрыть"
          >
            ×
          </button>
          <div className={styles.posterFrame}>
            <img
              src="/img/ded_moroz_banner.jpg"
              alt="Настоящая новогодняя сказка у вас дома"
              className={styles.poster}
            />
          </div>
          <div className={styles.ctaBar}>
            <button type="button" className={styles.cta} onClick={handleApply}>
              Отправить заявку
            </button>
          </div>
        </article>
      </div>
    </div>
  ) : null;

  return (
    <>
      {mounted && postcard ? createPortal(postcard, document.body) : null}
      {isFeedbackRequestFormOpen ? (
        <FeedbackRequestForm type={DED_MOROZ_REQUEST_TYPE} />
      ) : null}
    </>
  );
}

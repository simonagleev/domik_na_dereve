'use client';

/**
 * Глобальный тост для форм обратной связи: сообщение из feedbackRequestFormStore
 * (showFeedbackToast из FeedbackRequestForm и др.), автоскрытие через TOAST_MS миллисекунд.
 */

import { useEffect } from 'react';
import { useFeedbackRequestFormStore } from '@/store/feedbackRequestFormStore';
import styles from './FeedbackToastHost.module.css';

const TOAST_MS = 4500;

export default function FeedbackToastHost() {
  const feedbackToast = useFeedbackRequestFormStore((s) => s.feedbackToast);
  const clearFeedbackToast = useFeedbackRequestFormStore((s) => s.clearFeedbackToast);

  useEffect(() => {
    if (!feedbackToast) return;
    const t = window.setTimeout(() => clearFeedbackToast(), TOAST_MS);
    return () => window.clearTimeout(t);
  }, [feedbackToast, clearFeedbackToast]);

  if (!feedbackToast) return null;

  return (
    <div
      className={`${styles.toast} ${feedbackToast.variant === 'success' ? styles.toastSuccess : styles.toastError}`}
      role="status"
      aria-live="polite"
    >
      {feedbackToast.message}
    </div>
  );
}

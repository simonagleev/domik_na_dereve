'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './clickToEdit.module.css';

export default function ClickToEdit({
  value,
  onSave,
  multiline = false,
  className,
  placeholder = 'Нажмите, чтобы изменить',
  format,
  parse,
  prefix = '',
  suffix = '',
  type = 'text',
  emptyLabel,
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const ref = useRef(null);
  const ignoreBlurRef = useRef(false);

  const shown = format ? format(value) : value == null ? '' : String(value);
  const isEmpty = shown.trim() === '';

  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus();
      if (typeof ref.current.select === 'function' && !multiline) {
        ref.current.select();
      }
    }
  }, [editing, multiline]);

  const startEdit = (e) => {
    e.stopPropagation();
    ignoreBlurRef.current = false;
    setDraft(shown);
    setEditing(true);
  };

  const commit = () => {
    if (ignoreBlurRef.current) return;
    ignoreBlurRef.current = true;
    setEditing(false);
    const parsed = parse ? parse(draft) : draft;
    const current = parse ? parse(shown) : shown;
    if (parsed === current) return;
    if (String(parsed ?? '') === String(current ?? '')) return;
    void onSave(parsed);
  };

  const cancel = () => {
    ignoreBlurRef.current = true;
    setEditing(false);
    setDraft(shown);
  };

  if (editing) {
    const shared = {
      ref,
      className: `${styles.input} ${multiline ? styles.textarea : ''} ${className || ''}`,
      value: draft,
      onChange: (e) => setDraft(e.target.value),
      onBlur: commit,
      onClick: (e) => e.stopPropagation(),
      onKeyDown: (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          cancel();
        } else if (e.key === 'Enter' && !multiline) {
          e.preventDefault();
          commit();
        } else if (e.key === 'Enter' && multiline && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          commit();
        }
      },
    };

    if (multiline) {
      return <textarea {...shared} rows={8} />;
    }
    return <input {...shared} type={type} />;
  }

  return (
    <span
      className={`${styles.display} ${multiline ? styles.block : ''} ${isEmpty ? styles.empty : ''} ${className || ''}`}
      onClick={startEdit}
      title="Нажмите, чтобы изменить"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          startEdit(e);
        }
      }}
    >
      {isEmpty ? emptyLabel || placeholder : `${prefix}${shown}${suffix}`}
    </span>
  );
}

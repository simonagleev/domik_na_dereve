'use client';

import { useRef, useState } from 'react';
import { ActionIcon, Switch, Tooltip } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconGripVertical, IconPhoto, IconPlus, IconX } from '@tabler/icons-react';
import ClickToEdit from './ClickToEdit';
import cardStyles from '@/app/creativeWorkshops/components/card/card.module.css';
import styles from './adminCw.module.css';

export default function AdminCwCard({
  row,
  saving,
  dragging,
  dropTarget,
  onUpdate,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const src = row.image_path ? String(row.image_path).trim() : '';

  const handleImageUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'creative_workshops');
      const res = await fetch('/api/admin/upload-image', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) {
        notifications.show({
          color: 'red',
          title: 'Ошибка загрузки',
          message: data.error || 'Не удалось загрузить файл',
        });
        return;
      }
      await onUpdate({ image_path: data.imagePath || '' });
    } catch {
      notifications.show({
        color: 'red',
        title: 'Ошибка сети',
        message: 'Не удалось загрузить файл',
      });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const updateScheduleLine = (index, text) => {
    const next = [...(row.schedule || [])];
    next[index] = text;
    void onUpdate({ schedule: next });
  };

  const removeScheduleLine = (index) => {
    const next = (row.schedule || []).filter((_, i) => i !== index);
    void onUpdate({ schedule: next });
  };

  const addScheduleLine = () => {
    void onUpdate({ schedule: [...(row.schedule || []), ''] });
  };

  return (
    <div
      className={`${cardStyles.card} ${dragging ? styles.dragging : ''} ${dropTarget ? styles.dropTarget : ''} ${row.is_active ? '' : styles.hiddenCard}`}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver(e, row.id);
      }}
      onDrop={(e) => onDrop(e, row.id)}
    >
      <div className={cardStyles.workshop_items_container}>
        <div className={cardStyles.workshop_item}>
          <div className={styles.toolbar}>
            <Tooltip label="Перетащите, чтобы изменить порядок">
              <div
                className={styles.grip}
                role="button"
                tabIndex={0}
                aria-label="Перетащить карточку"
                draggable
                onDragStart={(e) => {
                  e.stopPropagation();
                  e.dataTransfer.effectAllowed = 'move';
                  e.dataTransfer.setData('text/plain', String(row.id));
                  onDragStart(e, row.id);
                }}
                onDragEnd={onDragEnd}
              >
                <IconGripVertical size={20} />
              </div>
            </Tooltip>
            <Switch
              className={styles.visibilityToggle}
              size="sm"
              checked={row.is_active}
              disabled={saving}
              label={row.is_active ? 'На сайте' : 'Скрыта'}
              onChange={(e) => void onUpdate({ is_active: e.currentTarget.checked })}
            />
          </div>

          <div
            className={`${cardStyles.card_image_container} ${styles.imageHit}`}
            onClick={() => fileRef.current?.click()}
          >
            {src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className={cardStyles.card_image} src={src} alt="" />
            ) : (
              <div className={styles.imagePlaceholder}>
                <IconPhoto size={36} />
                <span>Нажмите, чтобы добавить фото</span>
              </div>
            )}
            <div className={styles.imageOverlay}>{uploading ? 'Загрузка…' : 'Сменить фото'}</div>
            <input
              ref={fileRef}
              className={styles.fileInput}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => void handleImageUpload(e.target.files?.[0])}
            />
          </div>

          <h2 className={cardStyles.card_title}>
            <ClickToEdit
              value={row.name}
              placeholder="Название"
              onSave={(name) => void onUpdate({ name: String(name || '').trim() || 'Без названия' })}
            />
          </h2>

          <p className={cardStyles.card_text}>
            <ClickToEdit
              value={row.description}
              multiline
              placeholder="Описание — нажмите, чтобы изменить"
              onSave={(description) => void onUpdate({ description: String(description ?? '') })}
            />
          </p>

          <p className={cardStyles.card_text}>
            Возраст:{' '}
            <ClickToEdit
              value={row.age}
              placeholder="не указан"
              emptyLabel="не указан (нажмите)"
              onSave={(age) => {
                const t = String(age ?? '').trim();
                void onUpdate({ age: t || null });
              }}
            />
          </p>

          <p className={cardStyles.price}>
            Цена :{' '}
            <ClickToEdit
              value={row.price}
              type="number"
              format={(v) => (v == null || v === '' ? '' : String(v))}
              parse={(v) => {
                const n = Number(String(v).replace(',', '.'));
                return Number.isFinite(n) ? n : 0;
              }}
              suffix=" рублей"
              onSave={(price) => void onUpdate({ price })}
            />
          </p>

          <div className={cardStyles.description}>
            Расписание :
            {(row.schedule || []).map((line, index) => (
              <div className={styles.scheduleRow} key={`${row.id}-s-${index}`}>
                <ClickToEdit
                  value={line}
                  placeholder="Строка расписания"
                  onSave={(text) => updateScheduleLine(index, String(text ?? ''))}
                />
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="sm"
                  aria-label="Удалить строку расписания"
                  onClick={() => removeScheduleLine(index)}
                >
                  <IconX size={14} />
                </ActionIcon>
              </div>
            ))}
            <button type="button" className={styles.addLine} onClick={addScheduleLine}>
              <IconPlus size={12} style={{ marginRight: 4 }} />
              Добавить строку расписания
            </button>
          </div>

          <button type="button" className={`${cardStyles.buy_btn} ${styles.fakeBtn}`}>
            Записаться
          </button>
        </div>
      </div>
    </div>
  );
}

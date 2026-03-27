'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Group,
  Image,
  Modal,
  NumberInput,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  Textarea,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { resolveEventImageSrc } from '@/lib/eventImage';

function inputChangeValue(e) {
  if (typeof e === 'string') return e;
  return e?.target?.value ?? e?.currentTarget?.value ?? '';
}

export default function WorkshopFormModal({ opened, onClose, mode, initialRow, onSaved }) {
  const isMobile = useMediaQuery('(max-width: 48em)');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    price: 0,
    max_tickets: 14,
    description: '',
    comments: '',
    image_path: '',
    age: null,
    duration: null,
    people_per_ticket: 1,
  });

  useEffect(() => {
    if (!opened) return;
    setError('');
    if (mode === 'edit' && initialRow) {
      setForm({
        name: initialRow.Name ?? '',
        price: initialRow.Price ?? 0,
        max_tickets: initialRow.MaxTikets ?? 14,
        description: initialRow.Description ?? '',
        comments: initialRow.Comments ?? '',
        image_path: initialRow.ImagePath ?? '',
        age: initialRow.Age ?? null,
        duration: initialRow.Duration ?? null,
        people_per_ticket: initialRow.PeoplePerTicket ?? 1,
      });
    } else {
      setForm({
        name: '',
        price: 0,
        max_tickets: 14,
        description: '',
        comments: '',
        image_path: '',
        age: null,
        duration: null,
        people_per_ticket: 1,
      });
    }
  }, [opened, mode, initialRow]);

  const previewSrc = useMemo(() => resolveEventImageSrc(form), [form]);

  const handleImageUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'workshops');
      const res = await fetch('/api/admin/upload-image', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Ошибка загрузки');
        return;
      }
      setForm((f) => ({ ...f, image_path: data.imagePath || '' }));
    } catch {
      setError('Ошибка сети при загрузке файла');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    const nameTrim = String(form.name || '').trim();
    const descriptionTrim = String(form.description || '').trim();
    const imagePathTrim = String(form.image_path || '').trim();
    const priceValue = Number(form.price) || 0;

    if (!nameTrim || !descriptionTrim || !imagePathTrim || priceValue <= 0) {
      const missing = [];
      if (!nameTrim) missing.push('name');
      if (priceValue <= 0) missing.push('price');
      if (!descriptionTrim) missing.push('description');
      if (!imagePathTrim) missing.push('image_path');
      const message = `Заполните обязательные поля: ${missing.join(', ')}`;
      setError(message);
      notifications.show({
        color: 'red',
        title: 'Не хватает данных',
        message,
      });
      return;
    }

    setSaving(true);
    setError('');
    try {
      const payload = {
        name: nameTrim,
        price: priceValue,
        max_tickets: Number(form.max_tickets) || 0,
        description: descriptionTrim,
        comments: form.comments?.trim() ? form.comments.trim() : null,
        image_path: imagePathTrim,
        age: form.age == null || form.age === '' ? null : Number(form.age),
        duration: form.duration == null || form.duration === '' ? null : Number(form.duration),
        people_per_ticket:
          form.people_per_ticket == null || form.people_per_ticket === ''
            ? 1
            : Math.max(1, Number(form.people_per_ticket) || 1),
      };

      if (mode === 'create') {
        const res = await fetch('/api/admin/postgres/raw-sql-exec', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sql: `
              INSERT INTO workshops
                (name, price, max_tickets, description, comments, age, duration, image_path, people_per_ticket)
              VALUES
                ($1, $2, $3, $4, $5, $6, $7, $8, $9)
              RETURNING id
            `,
            params: [
              payload.name,
              payload.price,
              payload.max_tickets,
              payload.description,
              payload.comments,
              payload.age,
              payload.duration,
              payload.image_path,
              payload.people_per_ticket,
            ],
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Ошибка сохранения');
          return;
        }
        notifications.show({
          color: 'green',
          title: 'Успешно',
          message: 'Мастер-класс создан',
        });
      } else if (initialRow?.ID != null) {
        const res = await fetch('/api/admin/postgres/raw-sql-exec', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sql: `
              UPDATE workshops
              SET
                name = $1,
                price = $2,
                max_tickets = $3,
                description = $4,
                comments = $5,
                age = $6,
                duration = $7,
                image_path = $8,
                people_per_ticket = $9
              WHERE id = $10
              RETURNING id
            `,
            params: [
              payload.name,
              payload.price,
              payload.max_tickets,
              payload.description,
              payload.comments,
              payload.age,
              payload.duration,
              payload.image_path,
              payload.people_per_ticket,
              initialRow.ID,
            ],
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Ошибка сохранения');
          return;
        }
        notifications.show({
          color: 'green',
          title: 'Успешно',
          message: 'Изменения сохранены',
        });
      }
      onSaved?.();
      onClose();
    } catch {
      setError('Ошибка сети');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={mode === 'create' ? 'Новый мастер-класс' : `Редактирование: ${form.name || '...'}`}
      size={isMobile ? '90%' : 'min(1200px, calc(100vw - 48px))'}
      xOffset={isMobile ? 0 : 24}
      yOffset={isMobile ? 0 : 24}
      fullScreen={isMobile}
      centered
      withCloseButton
      closeOnClickOutside={!saving}
      closeOnEscape={!saving}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void handleSubmit();
        }}
      >
        <Stack gap={0}>
          <ScrollArea.Autosize mah="min(60vh, 420px)" type="scroll" offsetScrollbars>
            <Stack gap="sm" pr="xs">
              <TextInput
                label="Название"
                withAsterisk
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: inputChangeValue(e) }))}
                required
              />
              <Group grow>
                <NumberInput
                  label="Цена"
                  withAsterisk
                  value={form.price}
                  onChange={(v) => setForm((f) => ({ ...f, price: Number(v) || 0 }))}
                  min={0}
                />
                <NumberInput
                  label="Макс. билетов (max_tickets)"
                  value={form.max_tickets}
                  onChange={(v) => setForm((f) => ({ ...f, max_tickets: Number(v) || 0 }))}
                  min={0}
                />
              </Group>
              <Group grow>
                <NumberInput
                  label="Возраст (age)"
                  value={form.age ?? ''}
                  onChange={(v) =>
                    setForm((f) => ({ ...f, age: v === '' || v == null ? null : Number(v) }))
                  }
                  min={0}
                  allowDecimal={false}
                />
                <NumberInput
                  label="Длительность (duration, в минутах)"
                  value={form.duration ?? ''}
                  onChange={(v) =>
                    setForm((f) => ({ ...f, duration: v === '' || v == null ? null : Number(v) }))
                  }
                  min={0}
                  allowDecimal={false}
                />
              </Group>
              <NumberInput
                label="Человек за билет (people_per_ticket)"
                value={form.people_per_ticket ?? 1}
                onChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    people_per_ticket: v === '' || v == null ? 1 : Math.max(1, Number(v) || 1),
                  }))
                }
                min={1}
                allowDecimal={false}
              />
              <Textarea
                label="Описание"
                withAsterisk
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: inputChangeValue(e) }))}
                minRows={3}
              />
              <Textarea
                label="Комментарии"
                value={form.comments}
                onChange={(e) => setForm((f) => ({ ...f, comments: inputChangeValue(e) }))}
                minRows={2}
              />
              <TextInput
                label="image_path"
                withAsterisk
                value={form.image_path}
                readOnly
                description="Заполняется после выбора файла"
              />
              <div>
                <Text size="sm" fw={500} mb={4}>
                  Новое изображение
                </Text>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  disabled={uploading}
                  onChange={(e) => handleImageUpload(e.target.files?.[0])}
                />
                {uploading ? (
                  <Text size="xs" c="dimmed">
                    Загрузка...
                  </Text>
                ) : null}
              </div>
              {previewSrc ? <Image src={previewSrc} alt="preview" w={200} radius="md" fit="contain" /> : null}
              {error ? (
                <Text c="red" size="sm">
                  {error}
                </Text>
              ) : null}
            </Stack>
          </ScrollArea.Autosize>

          <Group
            justify="flex-end"
            mt="md"
            pt="md"
            style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}
          >
            <Button type="button" variant="default" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" loading={saving}>
              Сохранить
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}


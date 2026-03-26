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
import { resolveEventImageSrc } from '@/lib/eventImage';

function inputChangeValue(e) {
  if (typeof e === 'string') return e;
  return e?.target?.value ?? e?.currentTarget?.value ?? '';
}

export default function ShowFormModal({ opened, onClose, mode, initialRow, onSaved }) {
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    Name: '',
    Price: 0,
    MaxTikets: 0,
    Description: '',
    Comments: '',
    ImageName: '',
    ImagePath: '',
    Age: null,
    Duration: null,
  });

  useEffect(() => {
    if (!opened) return;
    setError('');
    if (mode === 'edit' && initialRow) {
      setForm({
        Name: initialRow.Name ?? '',
        Price: initialRow.Price ?? 0,
        MaxTikets: initialRow.MaxTikets ?? 0,
        Description: initialRow.Description ?? '',
        Comments: initialRow.Comments ?? '',
        ImageName: initialRow.ImageName ?? '',
        ImagePath: initialRow.ImagePath ?? '',
        Age: initialRow.Age ?? null,
        Duration: initialRow.Duration ?? null,
      });
    } else {
      setForm({
        Name: '',
        Price: 0,
        MaxTikets: 0,
        Description: '',
        Comments: '',
        ImageName: '',
        ImagePath: '',
        Age: null,
        Duration: null,
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
      fd.append('folder', 'shows');
      const res = await fetch('/api/admin/upload-image', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Ошибка загрузки');
        return;
      }
      setForm((f) => ({ ...f, ImagePath: data.imagePath || '' }));
    } catch {
      setError('Ошибка сети при загрузке файла');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    const nameTrim = String(form.Name || '').trim();
    if (!nameTrim) {
      setError('Укажите название мероприятия');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const payload = {
        Name: nameTrim,
        Price: Number(form.Price) || 0,
        MaxTikets: Number(form.MaxTikets) || 0,
        Description: form.Description?.trim() ? form.Description.trim() : null,
        Comments: form.Comments?.trim() ? form.Comments.trim() : null,
        ImageName: form.ImageName?.trim() ? form.ImageName.trim() : null,
        ImagePath: form.ImagePath?.trim() ? form.ImagePath.trim() : null,
        Age: form.Age == null || form.Age === '' ? null : Number(form.Age),
        Duration: form.Duration == null || form.Duration === '' ? null : Number(form.Duration),
      };

      if (mode === 'create') {
        const res = await fetch('/api/admin/events/shows', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Ошибка сохранения');
          return;
        }
      } else if (initialRow?.ID != null) {
        const res = await fetch(`/api/admin/events/shows/${initialRow.ID}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Ошибка сохранения');
          return;
        }
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
      title={mode === 'create' ? 'Новый спектакль' : `Редактирование: ${form.Name || '...'}`}
      size="lg"
      centered
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
                value={form.Name}
                onChange={(e) => setForm((f) => ({ ...f, Name: inputChangeValue(e) }))}
                required
              />
              <Group grow>
                <NumberInput
                  label="Цена"
                  value={form.Price}
                  onChange={(v) => setForm((f) => ({ ...f, Price: Number(v) || 0 }))}
                  min={0}
                />
                <NumberInput
                  label="Макс. билетов (MaxTikets)"
                  value={form.MaxTikets}
                  onChange={(v) => setForm((f) => ({ ...f, MaxTikets: Number(v) || 0 }))}
                  min={0}
                />
              </Group>
              <Group grow>
                <NumberInput
                  label="Возраст (Age)"
                  value={form.Age ?? ''}
                  onChange={(v) =>
                    setForm((f) => ({ ...f, Age: v === '' || v == null ? null : Number(v) }))
                  }
                  min={0}
                  allowDecimal={false}
                />
                <NumberInput
                  label="Длительность (Duration)"
                  value={form.Duration ?? ''}
                  onChange={(v) =>
                    setForm((f) => ({ ...f, Duration: v === '' || v == null ? null : Number(v) }))
                  }
                  min={0}
                  allowDecimal={false}
                />
              </Group>
              <Textarea
                label="Описание"
                value={form.Description}
                onChange={(e) => setForm((f) => ({ ...f, Description: inputChangeValue(e) }))}
                minRows={3}
              />
              <Textarea
                label="Комментарии"
                value={form.Comments}
                onChange={(e) => setForm((f) => ({ ...f, Comments: inputChangeValue(e) }))}
                minRows={2}
              />
              <TextInput
                label="ImageName (старый вариант, файл в /img/shows/)"
                value={form.ImageName}
                onChange={(e) => setForm((f) => ({ ...f, ImageName: inputChangeValue(e) }))}
                description="Например dari_vremeni.svg - пока миграция не завершена"
              />
              <TextInput
                label="ImagePath (после загрузки с прода)"
                value={form.ImagePath}
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


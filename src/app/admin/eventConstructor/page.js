'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Group,
  Image,
  Loader,
  Modal,
  NumberInput,
  ScrollArea,
  Stack,
  Table,
  Tabs,
  Text,
  TextInput,
  Textarea,
  Title,
} from '@mantine/core';
import { resolveEventImageSrc } from '@/lib/eventImage';
import AdminTableScroll from '@/components/AdminShell/AdminTableScroll';

/** Mantine 8 + React 19: иногда в onChange нестабилен currentTarget — берём value надёжно */
function inputChangeValue(e) {
  if (typeof e === 'string') return e;
  return e?.target?.value ?? e?.currentTarget?.value ?? '';
}

function ShowFormModal({ opened, onClose, mode, initialRow, onSaved }) {
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
      title={mode === 'create' ? 'Новый спектакль' : `Редактирование: ${form.Name || '…'}`}
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
                <NumberInput label="Цена" value={form.Price} onChange={(v) => setForm((f) => ({ ...f, Price: Number(v) || 0 }))} min={0} />
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
                  onChange={(v) => setForm((f) => ({ ...f, Age: v === '' || v == null ? null : Number(v) }))}
                  min={0}
                  allowDecimal={false}
                />
                <NumberInput
                  label="Длительность (Duration)"
                  value={form.Duration ?? ''}
                  onChange={(v) => setForm((f) => ({ ...f, Duration: v === '' || v == null ? null : Number(v) }))}
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
                description="Например dari_vremeni.svg — пока миграция не завершена"
              />
              <TextInput label="ImagePath (после загрузки с прода)" value={form.ImagePath} readOnly description="Заполняется после выбора файла" />
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
                {uploading ? <Text size="xs" c="dimmed">Загрузка…</Text> : null}
              </div>
              {previewSrc ? (
                <Image src={previewSrc} alt="preview" w={200} radius="md" fit="contain" />
              ) : null}
              {error ? <Text c="red" size="sm">{error}</Text> : null}
            </Stack>
          </ScrollArea.Autosize>

          <Group justify="flex-end" mt="md" pt="md" style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}>
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

export default function AdminEventConstructorPage() {
  const [eventTypes, setEventTypes] = useState([]);
  const [typesLoading, setTypesLoading] = useState(true);
  const [activeTech, setActiveTech] = useState(null);

  const [showsRows, setShowsRows] = useState([]);
  const [showsLoading, setShowsLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editingRow, setEditingRow] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setTypesLoading(true);
      try {
        const res = await fetch('/api/admin/event-types');
        const data = await res.json();
        if (!res.ok) {
          console.error('event-types error', data);
          return;
        }
        if (!cancelled) {
          console.log('eventTypes из БД:', data);
          setEventTypes(Array.isArray(data) ? data : []);
          if (Array.isArray(data) && data.length > 0) {
            setActiveTech((prev) => prev ?? data[0].TechName);
          }
        }
      } catch (e) {
        console.error('event-types fetch', e);
      } finally {
        if (!cancelled) setTypesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadShows = useCallback(async () => {
    setShowsLoading(true);
    try {
      const res = await fetch('/api/admin/events/shows');
      const data = await res.json();
      if (res.ok) {
        setShowsRows(Array.isArray(data) ? data : []);
      } else {
        console.error('shows list', data);
        setShowsRows([]);
      }
    } catch (e) {
      console.error('shows fetch', e);
      setShowsRows([]);
    } finally {
      setShowsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTech === 'shows') {
      loadShows();
    }
  }, [activeTech, loadShows]);

  const openCreate = () => {
    setModalMode('create');
    setEditingRow(null);
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setModalMode('edit');
    setEditingRow(row);
    setModalOpen(true);
  };

  const handleTabChange = (value) => {
    if (value) setActiveTech(value);
  };

  if (typesLoading) {
    return (
      <Group justify="center" py="xl">
        <Loader />
        <Text>Загрузка типов мероприятий…</Text>
      </Group>
    );
  }

  if (!eventTypes.length) {
    return (
      <Stack gap="sm">
        <Title order={2}>Конструктор мероприятий</Title>
        <Text c="dimmed">
          В таблице eventTypes нет активных записей (IsActive). Добавь типы в Supabase или проверь имя таблицы/колонок.
        </Text>
      </Stack>
    );
  }

  return (
    <Stack gap="md" w="100%" maw="100%">
      <Title order={2}>Конструктор мероприятий</Title>

      <Tabs value={activeTech} onChange={handleTabChange}>
        <Box style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }} mb="xs">
          <Tabs.List style={{ flexWrap: 'nowrap', width: 'max-content', minWidth: '100%' }}>
            {eventTypes.map((t) => (
              <Tabs.Tab key={t.ID} value={t.TechName}>
                {t.Name}
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Box>

        {eventTypes.map((t) => (
          <Tabs.Panel key={t.ID} value={t.TechName} pt="md">
            {t.TechName === 'shows' ? (
              <Card withBorder radius="md" p="md" maw="100%" style={{ overflow: 'hidden' }}>
                <Group justify="space-between" mb="md" wrap="wrap" gap="sm" align="flex-start">
                  <Text fw={600} style={{ minWidth: 0 }}>{t.Name}</Text>
                  <Button onClick={openCreate} style={{ flexShrink: 0 }}>Создать</Button>
                </Group>
                {showsLoading ? (
                  <Loader />
                ) : (
                  <AdminTableScroll>
                  <Table striped highlightOnHover withTableBorder>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th w={80}>ID</Table.Th>
                        <Table.Th w={90}>Фото</Table.Th>
                        <Table.Th>Название</Table.Th>
                        <Table.Th w={100}>Цена</Table.Th>
                        <Table.Th w={100}>Билетов</Table.Th>
                        <Table.Th>Создан</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {showsRows.map((row) => {
                        const src = resolveEventImageSrc(row);
                        return (
                          <Table.Tr key={row.ID} style={{ cursor: 'pointer' }} onClick={() => openEdit(row)}>
                            <Table.Td>{row.ID}</Table.Td>
                            <Table.Td>
                              {src ? (
                                <Image src={src} alt="" w={56} h={56} radius="sm" fit="cover" />
                              ) : (
                                <Text size="xs" c="dimmed">—</Text>
                              )}
                            </Table.Td>
                            <Table.Td>{row.Name}</Table.Td>
                            <Table.Td>{row.Price}</Table.Td>
                            <Table.Td>{row.MaxTikets}</Table.Td>
                            <Table.Td>
                              <Text size="sm" c="dimmed">
                                {row.CreatedAt ? String(row.CreatedAt).slice(0, 19).replace('T', ' ') : '—'}
                              </Text>
                            </Table.Td>
                          </Table.Tr>
                        );
                      })}
                    </Table.Tbody>
                  </Table>
                  </AdminTableScroll>
                )}
              </Card>
            ) : (
              <Card withBorder radius="md" p="lg">
                <Text c="dimmed">
                  Таблица для типа «{t.Name}» ({t.TechName}) будет подключена позже — сейчас реализованы только спектакли (shows).
                </Text>
              </Card>
            )}
          </Tabs.Panel>
        ))}
      </Tabs>

      <ShowFormModal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        initialRow={editingRow}
        onSaved={() => {
          if (activeTech === 'shows') loadShows();
        }}
      />
    </Stack>
  );
}

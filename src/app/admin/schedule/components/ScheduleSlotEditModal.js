'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Group,
  Modal,
  NumberInput,
  Stack,
  Switch,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { useAdminScheduleStore } from '../store/adminScheduleStore';

const EVENT_TYPES_WITH_PG = new Set(['shows', 'workshops']);

function startToDateTimeParts(value) {
  if (value == null || value === '') {
    return { date: '', time: '' };
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    return { date: '', time: '' };
  }
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return { date: `${y}-${m}-${day}`, time: `${h}:${min}` };
}

function buildStartDatetime(date, time) {
  const d = String(date || '').trim();
  const t = String(time || '').trim();
  if (!d || !t) return null;
  if (/^\d{2}:\d{2}$/.test(t)) {
    return `${d} ${t}:00`;
  }
  return `${d} ${t}`;
}

export default function ScheduleSlotEditModal({ opened, onClose, eventType, row, onSaved }) {
  const saving = useAdminScheduleStore((s) => s.scheduleSlotEditSaving);
  const scheduleSlotInputValue = useAdminScheduleStore((s) => s.scheduleSlotInputValue);
  const scheduleSlotSwitchChecked = useAdminScheduleStore((s) => s.scheduleSlotSwitchChecked);
  const updateScheduleSlot = useAdminScheduleStore((s) => s.updateScheduleSlot);

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [remaining_count, setRemaining_count] = useState(0);
  const [is_active, setIs_active] = useState(true);
  const [comments, setComments] = useState('');

  useEffect(() => {
    if (!opened || !row) return;
    const parts = startToDateTimeParts(row.start_datetime);
    setDate(parts.date);
    setTime(parts.time);
    setRemaining_count(
      row.remaining_count != null && row.remaining_count !== ''
        ? Number(row.remaining_count)
        : 0
    );
    setIs_active(Boolean(row.is_active));
    setComments(row.comments != null ? String(row.comments) : '');
  }, [opened, row]);

  const titleLabel = eventType === 'shows' ? 'Спектакль' : 'Мастер-класс';

  const displayName = useMemo(() => {
    if (!row) return '';
    if (eventType === 'shows') {
      return row.show_name != null ? String(row.show_name) : `#${row.show_id}`;
    }
    if (eventType === 'workshops') {
      return row.workshop_name != null ? String(row.workshop_name) : `#${row.workshop_id}`;
    }
    return '';
  }, [row, eventType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!row?.id) return;
    const start = buildStartDatetime(date, time);
    if (!start) return;
    const result = await updateScheduleSlot(eventType, row.id, {
      start_datetime: start,
      remaining_count,
      is_active,
      comments,
    });
    if (result?.ok) {
      onClose();
      onSaved?.();
    }
  };

  if (!EVENT_TYPES_WITH_PG.has(eventType)) {
    return (
      <Modal opened={opened} onClose={onClose} title="Редактирование" centered>
        <Text size="sm" c="dimmed">
          Для этого типа расписание в PostgreSQL пока не подключено.
        </Text>
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose}>
            Закрыть
          </Button>
        </Group>
      </Modal>
    );
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Редактировать слот"
      centered
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="sm">
          <div>
            <Text size="sm" fw={500} mb={4}>
              {titleLabel}
            </Text>
            <Text size="sm">{row ? displayName : '—'}</Text>
          </div>

          <Group grow align="flex-start">
            <TextInput
              label="Дата начала"
              type="date"
              value={date}
              onChange={(e) => setDate(scheduleSlotInputValue(e))}
              required
            />
            <TextInput
              label="Время"
              type="time"
              value={time}
              onChange={(e) => setTime(scheduleSlotInputValue(e))}
              required
            />
          </Group>

          <NumberInput
            label="Остаток мест (remaining_count)"
            min={0}
            value={remaining_count}
            onChange={(v) =>
              setRemaining_count(v === '' || v == null ? 0 : Number(v))
            }
          />

          <Switch
            label="Активен (is_active)"
            checked={is_active}
            onChange={(e) => setIs_active(scheduleSlotSwitchChecked(e))}
          />

          <Textarea
            label="Комментарий"
            value={comments}
            onChange={(e) => setComments(scheduleSlotInputValue(e))}
            minRows={2}
          />

          <Group justify="flex-end" mt="xs">
            <Button type="button" variant="default" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" loading={saving} disabled={!row?.id}>
              Сохранить
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

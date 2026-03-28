'use client';

import { useEffect } from 'react';
import {
  Button,
  Group,
  Loader,
  Modal,
  NumberInput,
  Select,
  Stack,
  Switch,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { useAdminScheduleStore } from '../store/adminScheduleStore';

const EVENT_TYPES_WITH_PG = new Set(['shows', 'workshops']);

export default function ScheduleSlotModal({ opened, onClose, eventType, onSaved }) {
  const loadShowsOptions = useAdminScheduleStore((s) => s.loadShowsOptions);
  const loadWorkshopsOptions = useAdminScheduleStore((s) => s.loadWorkshopsOptions);
  const showsOptions = useAdminScheduleStore((s) => s.showsOptions);
  const showsOptionsLoading = useAdminScheduleStore((s) => s.showsOptionsLoading);
  const workshopsOptions = useAdminScheduleStore((s) => s.workshopsOptions);
  const workshopsOptionsLoading = useAdminScheduleStore((s) => s.workshopsOptionsLoading);

  const form = useAdminScheduleStore((s) => s.scheduleSlotForm);
  const saving = useAdminScheduleStore((s) => s.scheduleSlotSaving);
  const resetScheduleSlotForm = useAdminScheduleStore((s) => s.resetScheduleSlotForm);
  const setScheduleSlotForm = useAdminScheduleStore((s) => s.setScheduleSlotForm);
  const scheduleSlotInputValue = useAdminScheduleStore((s) => s.scheduleSlotInputValue);
  const scheduleSlotSwitchChecked = useAdminScheduleStore((s) => s.scheduleSlotSwitchChecked);
  const setScheduleSlotEntityId = useAdminScheduleStore((s) => s.setScheduleSlotEntityId);
  const saveScheduleSlot = useAdminScheduleStore((s) => s.saveScheduleSlot);

  useEffect(() => {
    if (!opened || !EVENT_TYPES_WITH_PG.has(eventType)) return;
    if (eventType === 'shows') void loadShowsOptions();
    if (eventType === 'workshops') void loadWorkshopsOptions();
  }, [opened, eventType, loadShowsOptions, loadWorkshopsOptions]);

  useEffect(() => {
    if (!opened) return;
    resetScheduleSlotForm();
  }, [opened, eventType, resetScheduleSlotForm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await saveScheduleSlot(eventType);
    if (result?.ok) {
      onClose();
      onSaved?.();
    }
  };

  if (!EVENT_TYPES_WITH_PG.has(eventType)) {
    return (
      <Modal opened={opened} onClose={onClose} title="Создание элемента" centered>
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

  const optionsLoading = eventType === 'shows' ? showsOptionsLoading : workshopsOptionsLoading;
  const options = eventType === 'shows' ? showsOptions : workshopsOptions;
  const entityLabel = eventType === 'shows' ? 'Спектакль' : 'Мастер-класс';

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Новый слот в расписании"
      centered
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="sm">
          {optionsLoading && !options.length ? (
            <Group justify="center" py="sm">
              <Loader size="sm" />
              <Text size="sm" c="dimmed">
                Загрузка списка…
              </Text>
            </Group>
          ) : null}

          <Select
            label={entityLabel}
            placeholder="Выберите из списка"
            data={options}
            value={form.entityId || null}
            onChange={(v) => setScheduleSlotEntityId(eventType, v)}
            searchable={false}
            clearable={false}
            allowDeselect={false}
            required
            disabled={optionsLoading && !options.length}
          />

          <Group grow align="flex-start">
            <TextInput
              label="Дата начала"
              type="date"
              value={form.date}
              onChange={(e) =>
                setScheduleSlotForm({ date: scheduleSlotInputValue(e) })
              }
              required
            />
            <TextInput
              label="Время"
              type="time"
              value={form.time}
              onChange={(e) =>
                setScheduleSlotForm({ time: scheduleSlotInputValue(e) })
              }
              required
            />
          </Group>

          <NumberInput
            label="Остаток мест (remaining_count)"
            description="Подставляется из max_tickets выбранного мероприятия, при необходимости измените"
            min={0}
            value={form.remaining_count}
            onChange={(v) =>
              setScheduleSlotForm({
                remaining_count: v === '' || v == null ? 0 : Number(v),
              })
            }
          />

          <Switch
            label="Активен (is_active)"
            checked={form.is_active}
            onChange={(e) =>
              setScheduleSlotForm({
                is_active: scheduleSlotSwitchChecked(e),
              })
            }
          />

          <Textarea
            label="Комментарий"
            value={form.comments}
            onChange={(e) =>
              setScheduleSlotForm({ comments: scheduleSlotInputValue(e) })
            }
            minRows={2}
          />

          <Group justify="flex-end" mt="xs">
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

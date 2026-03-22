'use client';

import { useMemo, useState } from 'react';
import {
  ActionIcon,
  Box,
  Button,
  Card,
  Group,
  Modal,
  Select,
  Stack,
  Table,
  Tabs,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import AdminTableScroll from '@/components/AdminShell/AdminTableScroll';
import { IconPlus, IconTrash } from '@tabler/icons-react';

const TYPE_LABELS = {
  shows: 'Шоу',
  workshops: 'Мастерские',
  creative_workshops: 'Творческие мастерские',
  birthdays: 'Дни рождения',
};

const initialRowsByType = {
  shows: [
    { Id: 's1', Name: 'Снежная сказка', Date: '2026-03-21', Time: '12:00' },
    { Id: 's2', Name: 'Космическое шоу', Date: '2026-03-22', Time: '15:30' },
  ],
  creative_workshops: [
    { Id: 'cw1', Name: 'Лепка из глины', Date: '2026-03-21', Time: '11:00' },
  ],
  birthdays: [
    { Id: 'b1', Name: 'Пиратский день рождения', Date: '2026-03-23', Time: '14:00' },
  ],
};

export default function AdminSchedulePage() {
  const [activeType, setActiveType] = useState('shows');
  const [rowsByType, setRowsByType] = useState(initialRowsByType);
  const [opened, setOpened] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ Name: '', Date: '', Time: '' });

  const currentRows = useMemo(() => rowsByType[activeType] || [], [activeType, rowsByType]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ Name: '', Date: '', Time: '' });
    setOpened(true);
  };

  const openEdit = (row) => {
    setEditingId(row.Id);
    setForm({ Name: row.Name, Date: row.Date, Time: row.Time });
    setOpened(true);
  };

  const saveRow = () => {
    const newRow = {
      Id: editingId || `${activeType}_${Date.now()}`,
      Name: form.Name.trim(),
      Date: form.Date,
      Time: form.Time,
    };

    if (!newRow.Name || !newRow.Date || !newRow.Time) {
      return;
    }

    setRowsByType((prev) => {
      const prevRows = prev[activeType] || [];
      const nextRows = editingId
        ? prevRows.map((row) => (row.Id === editingId ? newRow : row))
        : [newRow, ...prevRows];

      return { ...prev, [activeType]: nextRows };
    });

    setOpened(false);
  };

  const deleteRow = (id) => {
    setRowsByType((prev) => ({
      ...prev,
      [activeType]: (prev[activeType] || []).filter((row) => row.Id !== id),
    }));
  };

  return (
    <Stack gap="md" w="100%" maw="100%">
      <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
        <div style={{ minWidth: 0, flex: '1 1 220px' }}>
          <Title order={2}>Расписание</Title>
          <Text c="dimmed" size="sm">
            Таблица зависит от типа мероприятия. Клик по строке открывает редактирование.
          </Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} onClick={openCreate} style={{ flexShrink: 0 }}>
          Добавить слот
        </Button>
      </Group>

      <Card withBorder radius="lg" p="md" maw="100%" style={{ overflow: 'hidden' }}>
        <Tabs value={activeType} onChange={(value) => setActiveType(value || 'shows')}>
          <Box style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }} mb="xs">
            <Tabs.List style={{ flexWrap: 'nowrap', width: 'max-content', minWidth: '100%' }}>
            {Object.entries(TYPE_LABELS).map(([value, label]) => (
              <Tabs.Tab key={value} value={value}>
                {label}
              </Tabs.Tab>
            ))}
            </Tabs.List>
          </Box>

          {Object.keys(TYPE_LABELS).map((type) => (
            <Tabs.Panel key={type} value={type} pt="md">
              <AdminTableScroll>
              <Table striped highlightOnHover withTableBorder withColumnBorders>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Название</Table.Th>
                    <Table.Th>Дата</Table.Th>
                    <Table.Th>Время</Table.Th>
                    <Table.Th w={80}>Действия</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {(rowsByType[type] || []).map((row) => (
                    <Table.Tr key={row.Id}>
                      <Table.Td onClick={() => openEdit(row)} style={{ cursor: 'pointer' }}>
                        {row.Name}
                      </Table.Td>
                      <Table.Td onClick={() => openEdit(row)} style={{ cursor: 'pointer' }}>
                        {row.Date}
                      </Table.Td>
                      <Table.Td onClick={() => openEdit(row)} style={{ cursor: 'pointer' }}>
                        {row.Time}
                      </Table.Td>
                      <Table.Td>
                        <ActionIcon
                          color="red"
                          variant="subtle"
                          onClick={() => deleteRow(row.Id)}
                          aria-label="Удалить"
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
              </AdminTableScroll>
            </Tabs.Panel>
          ))}
        </Tabs>
      </Card>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={editingId ? 'Редактирование элемента' : 'Создание элемента'}
        centered
      >
        <Stack>
          <Select
            label="Тип"
            value={activeType}
            data={Object.entries(TYPE_LABELS).map(([value, label]) => ({ value, label }))}
            onChange={(value) => setActiveType(value || 'shows')}
          />
          <TextInput
            label="Название"
            value={form.Name}
            onChange={(e) => setForm((prev) => ({ ...prev, Name: e.currentTarget.value }))}
          />
          <TextInput
            label="Дата"
            placeholder="YYYY-MM-DD"
            value={form.Date}
            onChange={(e) => setForm((prev) => ({ ...prev, Date: e.currentTarget.value }))}
          />
          <TextInput
            label="Время"
            placeholder="HH:mm"
            value={form.Time}
            onChange={(e) => setForm((prev) => ({ ...prev, Time: e.currentTarget.value }))}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setOpened(false)}>
              Отмена
            </Button>
            <Button onClick={saveRow}>Сохранить</Button>
          </Group>
        </Stack>
      </Modal>

      <Text size="xs" c="dimmed">
        Сейчас раздел работает на мок-данных для согласования UX. Следующий шаг: подключение к твоим реальным таблицам расписаний.
      </Text>
    </Stack>
  );
}

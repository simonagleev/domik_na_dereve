'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Group,
  Loader,
  Stack,
  Table,
  Tabs,
  Text,
  Title,
} from '@mantine/core';
import AdminTableScroll from '@/components/AdminShell/AdminTableScroll';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import ScheduleSlotEditModal from './components/ScheduleSlotEditModal';
import ScheduleSlotModal from './components/ScheduleSlotModal';
import { useAdminScheduleStore } from './store/adminScheduleStore';
import { formatNaiveIrkutskForAdminTable } from '@/lib/irkutskTime';

const TYPE_LABELS = {
  shows: 'Шоу',
  workshops: 'Мастерские',
  creative_workshops: 'Творческие мастерские',
  birthdays: 'Дни рождения',
};

const PG_TYPES = new Set(['shows', 'workshops']);

export default function AdminSchedulePage() {
  const [activeType, setActiveType] = useState('shows');
  const [opened, setOpened] = useState(false);
  const [editRow, setEditRow] = useState(null);

  const showsScheduleRows = useAdminScheduleStore((s) => s.showsScheduleRows);
  const showsScheduleLoading = useAdminScheduleStore((s) => s.showsScheduleLoading);
  const workshopsScheduleRows = useAdminScheduleStore((s) => s.workshopsScheduleRows);
  const workshopsScheduleLoading = useAdminScheduleStore((s) => s.workshopsScheduleLoading);
  const loadShowsSchedule = useAdminScheduleStore((s) => s.loadShowsSchedule);
  const loadWorkshopsSchedule = useAdminScheduleStore((s) => s.loadWorkshopsSchedule);
  const deleteScheduleSlot = useAdminScheduleStore((s) => s.deleteScheduleSlot);

  useEffect(() => {
    if (activeType === 'shows') void loadShowsSchedule();
    if (activeType === 'workshops') void loadWorkshopsSchedule();
  }, [activeType, loadShowsSchedule, loadWorkshopsSchedule]);

  useEffect(() => {
    setEditRow(null);
  }, [activeType]);

  const openCreate = () => setOpened(true);

  const refreshActive = () => {
    if (activeType === 'shows') void loadShowsSchedule();
    if (activeType === 'workshops') void loadWorkshopsSchedule();
  };

  const handleDeleteSlot = async (row, eventType) => {
    if (!window.confirm('Точно удалить?')) return;
    await deleteScheduleSlot(eventType, row.id);
  };

  const tableLoading = useMemo(() => {
    if (activeType === 'shows') return showsScheduleLoading;
    if (activeType === 'workshops') return workshopsScheduleLoading;
    return false;
  }, [activeType, showsScheduleLoading, workshopsScheduleLoading]);

  return (
    <Stack gap="md" w="100%" maw="100%">
      <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
        <div style={{ minWidth: 0, flex: '1 1 220px' }}>
          <Title order={2}>Расписание</Title>
          <Text c="dimmed" size="sm">
            Слоты хранятся в PostgreSQL: для шоу — таблица{' '}
            <Text span fw={600} component="span">
              shows_schedule
            </Text>
            , для мастер-классов —{' '}
            <Text span fw={600} component="span">
              workshop_schedule
            </Text>
            .
          </Text>
        </div>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={openCreate}
          style={{ flexShrink: 0 }}
          disabled={!PG_TYPES.has(activeType)}
        >
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

          <Tabs.Panel value="shows" pt="md">
            {tableLoading ? (
              <Group justify="center" py="xl">
                <Loader size="sm" />
                <Text size="sm" c="dimmed">
                  Загрузка…
                </Text>
              </Group>
            ) : (
              <AdminTableScroll>
                <Table striped highlightOnHover withTableBorder withColumnBorders>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Начало</Table.Th>
                      <Table.Th>Спектакль</Table.Th>
                      <Table.Th>Остаток</Table.Th>
                      <Table.Th>Активен</Table.Th>
                      <Table.Th>Комментарий</Table.Th>
                      <Table.Th w={120}> </Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {showsScheduleRows.length === 0 ? (
                      <Table.Tr>
                        <Table.Td colSpan={6}>
                          <Text size="sm" c="dimmed">
                            Пока нет слотов. Нажмите «Добавить слот».
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    ) : (
                      showsScheduleRows.map((row) => (
                        <Table.Tr
                          key={row.id}
                          style={{ cursor: 'pointer' }}
                          onClick={() => setEditRow(row)}
                        >
                          <Table.Td>{formatNaiveIrkutskForAdminTable(row.start_datetime)}</Table.Td>
                          <Table.Td>{row.show_name ?? `#${row.show_id}`}</Table.Td>
                          <Table.Td>{row.remaining_count ?? '—'}</Table.Td>
                          <Table.Td>{row.is_active ? 'да' : 'нет'}</Table.Td>
                          <Table.Td>{row.comments ?? '—'}</Table.Td>
                          <Table.Td onClick={(e) => e.stopPropagation()}>
                            <Button
                              color="red"
                              variant="light"
                              size="xs"
                              leftSection={<IconTrash size={14} />}
                              onClick={() => void handleDeleteSlot(row, 'shows')}
                            >
                              Удалить
                            </Button>
                          </Table.Td>
                        </Table.Tr>
                      ))
                    )}
                  </Table.Tbody>
                </Table>
              </AdminTableScroll>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="workshops" pt="md">
            {tableLoading ? (
              <Group justify="center" py="xl">
                <Loader size="sm" />
                <Text size="sm" c="dimmed">
                  Загрузка…
                </Text>
              </Group>
            ) : (
              <AdminTableScroll>
                <Table striped highlightOnHover withTableBorder withColumnBorders>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Начало</Table.Th>
                      <Table.Th>Мастер-класс</Table.Th>
                      <Table.Th>Остаток</Table.Th>
                      <Table.Th>Активен</Table.Th>
                      <Table.Th>Комментарий</Table.Th>
                      <Table.Th w={120}> </Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {workshopsScheduleRows.length === 0 ? (
                      <Table.Tr>
                        <Table.Td colSpan={6}>
                          <Text size="sm" c="dimmed">
                            Пока нет слотов. Нажмите «Добавить слот».
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    ) : (
                      workshopsScheduleRows.map((row) => (
                        <Table.Tr
                          key={row.id}
                          style={{ cursor: 'pointer' }}
                          onClick={() => setEditRow(row)}
                        >
                          <Table.Td>{formatNaiveIrkutskForAdminTable(row.start_datetime)}</Table.Td>
                          <Table.Td>{row.workshop_name ?? `#${row.workshop_id}`}</Table.Td>
                          <Table.Td>{row.remaining_count ?? '—'}</Table.Td>
                          <Table.Td>{row.is_active ? 'да' : 'нет'}</Table.Td>
                          <Table.Td>{row.comments ?? '—'}</Table.Td>
                          <Table.Td onClick={(e) => e.stopPropagation()}>
                            <Button
                              color="red"
                              variant="light"
                              size="xs"
                              leftSection={<IconTrash size={14} />}
                              onClick={() => void handleDeleteSlot(row, 'workshops')}
                            >
                              Удалить
                            </Button>
                          </Table.Td>
                        </Table.Tr>
                      ))
                    )}
                  </Table.Tbody>
                </Table>
              </AdminTableScroll>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="creative_workshops" pt="md">
            <Text size="sm" c="dimmed">
              Расписание для этого типа будет подключено позже.
            </Text>
          </Tabs.Panel>

          <Tabs.Panel value="birthdays" pt="md">
            <Text size="sm" c="dimmed">
              Расписание для этого типа будет подключено позже.
            </Text>
          </Tabs.Panel>
        </Tabs>
      </Card>

      <ScheduleSlotModal
        opened={opened}
        onClose={() => setOpened(false)}
        eventType={activeType}
        onSaved={refreshActive}
      />

      <ScheduleSlotEditModal
        opened={editRow != null}
        onClose={() => setEditRow(null)}
        eventType={activeType}
        row={editRow}
        onSaved={refreshActive}
      />
    </Stack>
  );
}

'use client';

import { useEffect } from 'react';
import { Box, Card, Group, Loader, Stack, Tabs, Text, Title } from '@mantine/core';
import ShowFormModal from './components/shows/ShowFormModal';
import ShowsTable from './components/shows/ShowsTable';
import { useEventConstructorStore } from './store/eventConstructorStore';

export default function AdminEventConstructorPage() {
  const eventTypes = useEventConstructorStore((s) => s.eventTypes);
  const typesLoading = useEventConstructorStore((s) => s.typesLoading);
  const activeTech = useEventConstructorStore((s) => s.activeTech);
  const showsRows = useEventConstructorStore((s) => s.showsRows);
  const showsLoading = useEventConstructorStore((s) => s.showsLoading);
  const modalOpen = useEventConstructorStore((s) => s.modalOpen);
  const modalMode = useEventConstructorStore((s) => s.modalMode);
  const editingRow = useEventConstructorStore((s) => s.editingRow);

  const loadEventTypes = useEventConstructorStore((s) => s.loadEventTypes);
  const loadShows = useEventConstructorStore((s) => s.loadShows);
  const refreshCurrentTab = useEventConstructorStore((s) => s.refreshCurrentTab);
  const setActiveTech = useEventConstructorStore((s) => s.setActiveTech);
  const openCreateModal = useEventConstructorStore((s) => s.openCreateModal);
  const openEditModal = useEventConstructorStore((s) => s.openEditModal);
  const closeModal = useEventConstructorStore((s) => s.closeModal);

  useEffect(() => {
    void loadEventTypes();
  }, [loadEventTypes]);

  useEffect(() => {
    if (activeTech === 'shows') {
      void loadShows();
    }
  }, [activeTech, loadShows]);

  if (typesLoading) {
    return (
      <Group justify="center" py="xl">
        <Loader />
        <Text>Загрузка типов мероприятий...</Text>
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

      <Tabs value={activeTech} onChange={setActiveTech}>
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
              <ShowsTable
                title={t.Name}
                loading={showsLoading}
                rows={showsRows}
                onCreate={openCreateModal}
                onEdit={openEditModal}
              />
            ) : (
              <Card withBorder radius="md" p="lg">
                <Text c="dimmed">
                  Таблица для типа «{t.Name}» ({t.TechName}) будет подключена позже - сейчас реализованы только спектакли
                  (shows).
                </Text>
              </Card>
            )}
          </Tabs.Panel>
        ))}
      </Tabs>

      <ShowFormModal
        opened={modalOpen}
        onClose={closeModal}
        mode={modalMode}
        initialRow={editingRow}
        onSaved={() => {
          void refreshCurrentTab();
        }}
      />
    </Stack>
  );
}

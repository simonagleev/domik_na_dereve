'use client';

import { useEffect } from 'react';
import { Box, Card, Group, Loader, Stack, Tabs, Text, Title } from '@mantine/core';
import ShowFormModal from './components/shows/ShowFormModal';
import ShowsTable from './components/shows/ShowsTable';
import WorkshopFormModal from './components/workshops/WorkshopFormModal';
import WorkshopsTable from './components/workshops/WorkshopsTable';
import { useShowsEventConstructorStore } from './components/shows/store/showsEventConstructorStore';
import { useEventConstructorStore } from './store/eventConstructorStore';
import { useWorkshopsEventConstructorStore } from './components/workshops/store/workshopsEventConstructorStore';

export default function AdminEventConstructorPage() {
  const eventTypes = useEventConstructorStore((s) => s.eventTypes);
  const typesLoading = useEventConstructorStore((s) => s.typesLoading);
  const typesError = useEventConstructorStore((s) => s.typesError);
  const activeTech = useEventConstructorStore((s) => s.activeTech);

  const showsRows = useShowsEventConstructorStore((s) => s.showsRows);
  const showsLoading = useShowsEventConstructorStore((s) => s.showsLoading);
  const modalOpen = useShowsEventConstructorStore((s) => s.modalOpen);
  const modalMode = useShowsEventConstructorStore((s) => s.modalMode);
  const editingRow = useShowsEventConstructorStore((s) => s.editingRow);

  const loadEventTypes = useEventConstructorStore((s) => s.loadEventTypes);
  const loadShows = useShowsEventConstructorStore((s) => s.loadShows);
  const refreshShows = useShowsEventConstructorStore((s) => s.refresh);
  const setActiveTech = useEventConstructorStore((s) => s.setActiveTech);
  const openCreateModal = useShowsEventConstructorStore((s) => s.openCreateModal);
  const openEditModal = useShowsEventConstructorStore((s) => s.openEditModal);
  const closeModal = useShowsEventConstructorStore((s) => s.closeModal);

  const workshopsRows = useWorkshopsEventConstructorStore((s) => s.workshopsRows);
  const workshopsLoading = useWorkshopsEventConstructorStore((s) => s.workshopsLoading);
  const workshopsModalOpen = useWorkshopsEventConstructorStore((s) => s.modalOpen);
  const workshopsModalMode = useWorkshopsEventConstructorStore((s) => s.modalMode);
  const workshopsEditingRow = useWorkshopsEventConstructorStore((s) => s.editingRow);
  const loadWorkshops = useWorkshopsEventConstructorStore((s) => s.loadWorkshops);
  const refreshWorkshops = useWorkshopsEventConstructorStore((s) => s.refresh);
  const openCreateWorkshopsModal = useWorkshopsEventConstructorStore((s) => s.openCreateModal);
  const openEditWorkshopsModal = useWorkshopsEventConstructorStore((s) => s.openEditModal);
  const closeWorkshopsModal = useWorkshopsEventConstructorStore((s) => s.closeModal);

  useEffect(() => {
    void loadEventTypes();
  }, [loadEventTypes]);

  useEffect(() => {
    if (activeTech === 'shows') {
      void loadShows();
    } else if (activeTech === 'workshops') {
      void loadWorkshops();
    }
  }, [activeTech, loadShows, loadWorkshops]);

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
        {typesError ? (
          <Text c="red" size="sm">
            Не удалось загрузить типы: {typesError}. Проверь таблицу event_types и лог сервера.
          </Text>
        ) : (
          <Text c="dimmed">
            Нет типов для вкладок: в event_types нет строк с is_active = true (или все отфильтрованы). Добавь
            записи или выставь is_active.
          </Text>
        )}
      </Stack>
    );
  }

  const tabsValue = activeTech ?? eventTypes[0]?.tech_name ?? null;

  return (
    <Stack gap="md" w="100%" maw="100%">
      <Title order={2}>Конструктор мероприятий</Title>

      <Tabs value={tabsValue} onChange={setActiveTech}>
        <Box style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }} mb="xs">
          <Tabs.List style={{ flexWrap: 'nowrap', width: 'max-content', minWidth: '100%' }}>
            {eventTypes.map((t) => (
              <Tabs.Tab key={t.id} value={t.tech_name}>
                {t.name}
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Box>

        {eventTypes.map((t) => (
          <Tabs.Panel key={t.id} value={t.tech_name} pt="md">
            {t.tech_name === 'shows' ? (
              <ShowsTable
                title={t.name}
                loading={showsLoading}
                rows={showsRows}
                onCreate={openCreateModal}
                onEdit={openEditModal}
              />
            ) : t.tech_name === 'workshops' ? (
              <WorkshopsTable
                title={t.name}
                loading={workshopsLoading}
                rows={workshopsRows}
                onCreate={openCreateWorkshopsModal}
                onEdit={openEditWorkshopsModal}
              />
            ) : (
              <Card withBorder radius="md" p="lg">
                <Text c="dimmed">
                  Таблица для типа «{t.name}» ({t.tech_name}) будет подключена позже - сейчас реализованы только спектакли
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
          void refreshShows();
        }}
      />
      <WorkshopFormModal
        opened={workshopsModalOpen}
        onClose={closeWorkshopsModal}
        mode={workshopsModalMode}
        initialRow={workshopsEditingRow}
        onSaved={() => {
          void refreshWorkshops();
        }}
      />
    </Stack>
  );
}

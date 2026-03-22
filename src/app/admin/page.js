'use client';

import { Card, SimpleGrid, Text, Title } from '@mantine/core';

export default function AdminPage() {
  return (
    <>
      <Title order={2} mb="md">Главная</Title>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
        <Card withBorder radius="lg" p="md">
          <Text fw={600}>Расписание</Text>
          <Text size="sm" c="dimmed">Управление слотами, количеством оставшихся билетов и датами мероприятий</Text>
        </Card>
        <Card withBorder radius="lg" p="md">
          <Text fw={600}>Конструктор мероприятий</Text>
          <Text size="sm" c="dimmed">Редактирование и создание карточек шоу и мастерских</Text>
        </Card>
        <Card withBorder radius="lg" p="md">
          <Text fw={600}>Транзакции</Text>
          <Text size="sm" c="dimmed">Просмотр оплат и статусов заказов</Text>
        </Card>
      </SimpleGrid>
    </>
  );
}
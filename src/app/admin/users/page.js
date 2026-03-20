import { Card, Text, Title } from '@mantine/core';

export default function AdminUsersPage() {
  return (
    <Card withBorder radius="lg" p="lg">
      <Title order={2} mb="sm">Пользователи</Title>
      <Text c="dimmed">
        Здесь будет управление пользователями, ролями и правами доступа.
      </Text>
    </Card>
  );
}

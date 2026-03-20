import { Card, Text, Title } from '@mantine/core';

export default function AdminTransactionsPage() {
  return (
    <Card withBorder radius="lg" p="lg">
      <Title order={2} mb="sm">Транзакции</Title>
      <Text c="dimmed">
        Здесь будет таблица транзакций с фильтрами по статусу, дате и типу оплаты.
      </Text>
    </Card>
  );
}

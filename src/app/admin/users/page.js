'use client';

import { useEffect } from 'react';
import {
  Button,
  Card,
  Group,
  Loader,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';
import AdminTableScroll from '@/components/AdminShell/AdminTableScroll';
import {
  formatUserCreatedAt,
  rowField,
  useAdminUsersStore,
} from './store/adminUsersStore';

export default function AdminUsersPage() {
  const rows = useAdminUsersStore((s) => s.rows);
  const loading = useAdminUsersStore((s) => s.loading);
  const error = useAdminUsersStore((s) => s.error);
  const loadUsers = useAdminUsersStore((s) => s.loadUsers);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  return (
    <Card withBorder radius="lg" p="lg">
      <Stack gap="md">
        <Group justify="space-between" align="flex-start" wrap="wrap">
          <Title order={2}>Пользователи</Title>
          <Button
            leftSection={<IconRefresh size={16} />}
            onClick={() => void loadUsers()}
            loading={loading}
            variant="light"
          >
            Обновить данные
          </Button>
        </Group>

        {error ? (
          <Text c="red" size="sm">
            {error}
          </Text>
        ) : null}

        {loading && rows.length === 0 ? (
          <Group justify="center" py="xl">
            <Loader />
            <Text c="dimmed">Загрузка…</Text>
          </Group>
        ) : (
          <AdminTableScroll>
            <Table striped highlightOnHover withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>ID</Table.Th>
                  <Table.Th>Имя</Table.Th>
                  <Table.Th>Телефон</Table.Th>
                  <Table.Th>Роль</Table.Th>
                  <Table.Th>Дата создания</Table.Th>
                  <Table.Th>Электронная почта</Table.Th>
                  <Table.Th>Пол</Table.Th>
                  <Table.Th>Возраст</Table.Th>
                  <Table.Th>Подсказка пароля</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {rows.map((row) => {
                  const id = rowField(row, 'id', 'ID');
                  return (
                    <Table.Tr key={id != null ? String(id) : JSON.stringify(row)}>
                      <Table.Td>{id ?? '—'}</Table.Td>
                      <Table.Td>{rowField(row, 'name', 'Name') ?? '—'}</Table.Td>
                      <Table.Td>{rowField(row, 'phone', 'Phone') ?? '—'}</Table.Td>
                      <Table.Td>{rowField(row, 'role', 'Role') ?? '—'}</Table.Td>
                      <Table.Td>
                        {formatUserCreatedAt(rowField(row, 'created_at', 'createdAt', 'CreatedAt'))}
                      </Table.Td>
                      <Table.Td>{rowField(row, 'email', 'Email') ?? '—'}</Table.Td>
                      <Table.Td>{rowField(row, 'sex', 'Sex') ?? '—'}</Table.Td>
                      <Table.Td>{rowField(row, 'age', 'Age') ?? '—'}</Table.Td>
                      <Table.Td>{rowField(row, 'password_clue', 'passwordClue', 'PasswordClue') ?? '—'}</Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </AdminTableScroll>
        )}

        {!loading && rows.length === 0 && !error ? (
          <Text c="dimmed" size="sm">
            Пользователей пока нет.
          </Text>
        ) : null}
      </Stack>
    </Card>
  );
}

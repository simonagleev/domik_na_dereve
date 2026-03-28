'use client';

import { Button, Card, Group, Image, Loader, Table, Text } from '@mantine/core';
import { resolveEventImageSrc } from '@/lib/eventImage';
import { formatDurationRu } from '@/lib/durationFormat';
import AdminTableScroll from '@/components/AdminShell/AdminTableScroll';

export default function ShowsTable({ title, loading, rows, onCreate, onEdit }) {
  return (
    <Card withBorder radius="md" p="md" maw="100%" style={{ overflow: 'hidden' }}>
      <Group justify="space-between" mb="md" wrap="wrap" gap="sm" align="flex-start">
        <Text fw={600} style={{ minWidth: 0 }}>
          {title}
        </Text>
        <Button onClick={onCreate} style={{ flexShrink: 0 }}>
          Создать
        </Button>
      </Group>
      {loading ? (
        <Loader />
      ) : (
        <AdminTableScroll>
          <Table striped highlightOnHover withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th w={80}>ID</Table.Th>
                <Table.Th w={90}>Фото</Table.Th>
                <Table.Th>Название</Table.Th>
                <Table.Th w={100}>Цена</Table.Th>
                <Table.Th w={100}>Билетов</Table.Th>
                <Table.Th w={90}>Возраст</Table.Th>
                <Table.Th w={170}>Длительность</Table.Th>
                <Table.Th w={120}>Кол-во в билете</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.map((row) => {
                const src = resolveEventImageSrc(row);
                return (
                  <Table.Tr key={row.ID} style={{ cursor: 'pointer' }} onClick={() => onEdit(row)}>
                    <Table.Td>{row.ID}</Table.Td>
                    <Table.Td>
                      {src ? (
                        <Image src={src} alt="" w={56} h={56} radius="sm" fit="cover" />
                      ) : (
                        <Text size="xs" c="dimmed">
                          -
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td>{row.Name}</Table.Td>
                    <Table.Td>{row.Price}</Table.Td>
                    <Table.Td>{row.MaxTikets}</Table.Td>
                    <Table.Td>{row.Age != null && row.Age !== '' ? row.Age : '—'}</Table.Td>
                    <Table.Td>
                      <Text size="sm">{row.Duration != null && row.Duration !== '' ? row.Duration : '—'}</Text>
                      <Text size="xs" c="dimmed">
                        ({formatDurationRu(row.Duration)})
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      {row.PeoplePerTicket != null && row.PeoplePerTicket !== '' ? row.PeoplePerTicket : '—'}
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </AdminTableScroll>
      )}
    </Card>
  );
}


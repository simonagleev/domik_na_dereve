'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Group,
  Loader,
  Pagination,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';
import AdminTableScroll from '@/components/AdminShell/AdminTableScroll';

const PAGE_SIZES = ['10', '25', '50', '100'];

const emptyFilters = {
  dateFrom: '',
  dateTo: '',
  phone: '',
  type: '',
};

function formatCreatedAt(v) {
  if (v == null || v === '') return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(d);
}

/** Supabase/Postgres может отдать ключи в разном регистре / snake_case */
function rowField(row, ...keys) {
  if (row == null) return undefined;
  for (const k of keys) {
    if (k in row && row[k] !== undefined && row[k] !== null) return row[k];
  }
  for (const k of keys) {
    if (row[k] !== undefined) return row[k];
  }
  return undefined;
}

export default function AdminRequestsPage() {
  const [draft, setDraft] = useState(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  const typeNameByCode = useMemo(() => {
    const m = new Map();
    for (const t of types) {
      const code = t?.type;
      const label = t?.name ?? code;
      if (code != null) m.set(String(code), String(label));
    }
    return m;
  }, [types]);

  const typeSelectData = useMemo(() => {
    const opts = [{ value: '', label: 'Все' }];
    for (const t of types) {
      const code = t?.type;
      const label = t?.name ?? code;
      if (code != null) {
        opts.push({ value: String(code), label: `${label} (${code})` });
      }
    }
    return opts;
  }, [types]);

  useEffect(() => {
    let cancelled = false;

    async function fetchRequests() {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({
          page: String(page),
          pageSize: String(pageSize),
        });
        if (appliedFilters.dateFrom) params.set('dateFrom', appliedFilters.dateFrom);
        if (appliedFilters.dateTo) params.set('dateTo', appliedFilters.dateTo);
        if (appliedFilters.phone) params.set('phone', appliedFilters.phone);
        if (appliedFilters.type) params.set('type', appliedFilters.type);

        const res = await fetch(`/api/admin/get-feedback-requests?${params.toString()}`);
        const json = await res.json();

        if (cancelled) return;

        if (!res.ok) {
          setError(json.error || 'Ошибка загрузки');
          setRows([]);
          setTotal(0);
          setTypes([]);
          return;
        }

        setRows(Array.isArray(json.data) ? json.data : []);
        setTotal(typeof json.total === 'number' ? json.total : 0);
        setTypes(Array.isArray(json.types) ? json.types : []);
      } catch {
        if (cancelled) return;
        setError('Ошибка сети');
        setRows([]);
        setTotal(0);
        setTypes([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchRequests();

    return () => {
      cancelled = true;
    };
  }, [page, pageSize, appliedFilters]);

  const handleRefresh = () => {
    setAppliedFilters({ ...draft });
    setPage(1);
  };

  const handleReset = () => {
    setDraft({ ...emptyFilters });
    setAppliedFilters({ ...emptyFilters });
    setPage(1);
  };

  const handlePageSizeChange = (value) => {
    const n = parseInt(value || '25', 10);
    setPageSize(Number.isFinite(n) ? n : 25);
    setPage(1);
  };

  const displayTypeName = (rowType) => {
    if (rowType == null || rowType === '') return '—';
    return typeNameByCode.get(String(rowType)) ?? String(rowType);
  };

  return (
    <Stack gap="md" w="100%" maw="100%">
      <Title order={2}>Заявки</Title>

      <Card withBorder radius="lg" p="md" maw="100%" style={{ overflow: 'hidden' }}>
        <Stack gap="sm">
          <Text fw={600} size="sm">
            Фильтры
          </Text>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="sm">
            <TextInput
              label="Дата создания с"
              type="date"
              value={draft.dateFrom}
              onChange={(e) => setDraft((d) => ({ ...d, dateFrom: e.target.value }))}
            />
            <TextInput
              label="Дата создания по"
              type="date"
              value={draft.dateTo}
              onChange={(e) => setDraft((d) => ({ ...d, dateTo: e.target.value }))}
            />
            <TextInput
              label="Телефон"
              placeholder="фрагмент номера"
              value={draft.phone}
              onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
            />
            <Select
              label="Тип"
              placeholder="Все"
              data={typeSelectData}
              value={draft.type || ''}
              onChange={(v) => setDraft((d) => ({ ...d, type: v ?? '' }))}
              searchable
            />
          </SimpleGrid>
          <Group gap="xs" wrap="wrap">
            <Button leftSection={<IconRefresh size={18} />} onClick={handleRefresh}>
              Обновить данные
            </Button>
            <Button variant="default" onClick={handleReset}>
              Сбросить
            </Button>
          </Group>
          <Text size="xs" c="dimmed">
            Нажмите «Обновить данные», чтобы применить фильтры. «Сбросить» очищает все поля и сразу подгружает список
            без фильтров. Смена страницы и размера страницы подгружает данные с текущими применёнными фильтрами.
          </Text>
        </Stack>
      </Card>

      <Card withBorder radius="lg" p="md" maw="100%" style={{ overflow: 'hidden' }}>
        <Group justify="space-between" mb="md" wrap="wrap">
          <Text size="sm" c="dimmed">
            Всего записей: {loading ? '…' : total}
          </Text>
          <Group gap="sm">
            <Text size="sm">На странице:</Text>
            <Select w={90} data={PAGE_SIZES} value={String(pageSize)} onChange={handlePageSizeChange} />
          </Group>
        </Group>

        {error ? (
          <Text c="red" mb="sm">
            {error}
          </Text>
        ) : null}

        {loading ? (
          <Group justify="center" py="xl">
            <Loader />
          </Group>
        ) : (
          <>
            <AdminTableScroll>
            <Table striped highlightOnHover withTableBorder withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>ID</Table.Th>
                  <Table.Th>Дата создания</Table.Th>
                  <Table.Th>Имя</Table.Th>
                  <Table.Th>Телефон</Table.Th>
                  <Table.Th>Тип</Table.Th>
                  <Table.Th>Имя ребёнка</Table.Th>
                  <Table.Th>Возраст</Table.Th>
                  <Table.Th>Дата мероприятия</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {rows.map((row, index) => {
                  const idVal = rowField(row, 'id', 'ID');
                  const created = rowField(row, 'created_at', 'CreatedAt');
                  const nameVal = rowField(row, 'name', 'Name');
                  const phoneVal = rowField(row, 'phone', 'Phone');
                  const typeVal = rowField(row, 'type', 'Type');
                  const childNameVal = rowField(row, 'child_name', 'ChildName');
                  const childAgeVal = rowField(row, 'child_age', 'ChildAge');
                  const eventDateVal = rowField(row, 'event_date', 'EventDate');
                  return (
                    <Table.Tr key={idVal != null ? String(idVal) : `request-${index}`}>
                      <Table.Td>{idVal ?? '—'}</Table.Td>
                      <Table.Td>{formatCreatedAt(created)}</Table.Td>
                      <Table.Td>{nameVal ?? '—'}</Table.Td>
                      <Table.Td>{phoneVal ?? '—'}</Table.Td>
                      <Table.Td>{displayTypeName(typeVal)}</Table.Td>
                      <Table.Td>{childNameVal ?? '—'}</Table.Td>
                      <Table.Td>{childAgeVal != null ? childAgeVal : '—'}</Table.Td>
                      <Table.Td>{eventDateVal ?? '—'}</Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
            </AdminTableScroll>

            {rows.length === 0 && !loading ? (
              <Text c="dimmed" ta="center" py="md">
                Нет данных по текущим фильтрам
              </Text>
            ) : null}

            <Group justify="center" mt="md">
              <Pagination total={totalPages} value={page} onChange={setPage} withEdges />
            </Group>
          </>
        )}
      </Card>
    </Stack>
  );
}

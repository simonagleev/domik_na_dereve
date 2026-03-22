'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Button,
  Card,
  Group,
  Loader,
  Pagination,
  Paper,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';

const PAGE_SIZES = ['10', '25', '50', '100'];

const emptyFilters = {
  dateFrom: '',
  dateTo: '',
  status: '',
  type: '',
  phone: '',
  orderSearch: '',
};

/** Для всплывашки расписания: дата = ГГГГ.ММ.ДД; время = ЧЧ:ММ */
function formatScheduleStartForPopup(isoString) {
  if (isoString == null || isoString === '') {
    return { datePart: '—', timePart: '—' };
  }
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) {
    return { datePart: '—', timePart: '—' };
  }
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return {
    datePart: `${y}.${m}.${day}`,
    timePart: `${hh}:${min}`,
  };
}

export default function AdminTransactionsPage() {
  const [draft, setDraft] = useState(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /** Всплывашка у курсора: время начала из schedule по ItemID */
  const [schedulePopup, setSchedulePopup] = useState(null);
  const schedulePopupRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  //сколько страниц нужно при текущем total и pageSize
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  useEffect(() => {
    let cancelled = false;

    async function fetchTransactions() {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({
          page: String(page),
          pageSize: String(pageSize),
        });
        if (appliedFilters.dateFrom) params.set('dateFrom', appliedFilters.dateFrom);
        if (appliedFilters.dateTo) params.set('dateTo', appliedFilters.dateTo);
        if (appliedFilters.status) params.set('status', appliedFilters.status);
        if (appliedFilters.type) params.set('type', appliedFilters.type);
        if (appliedFilters.phone) params.set('phone', appliedFilters.phone);
        if (appliedFilters.orderSearch) params.set('orderSearch', appliedFilters.orderSearch);

        const res = await fetch(`/api/admin/get-all-online-transactions?${params.toString()}`);
        const json = await res.json();

        if (cancelled) return;

        if (!res.ok) {
          setError(json.error || 'Ошибка загрузки');
          setRows([]);
          setTotal(0);
          return;
        }

        setRows(Array.isArray(json.data) ? json.data : []);
        setTotal(typeof json.total === 'number' ? json.total : 0);
      } catch {
        if (cancelled) return;
        setError('Ошибка сети');
        setRows([]);
        setTotal(0);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    //тут запускаем fetchTransactions, void потому что fetchTransactions не возвращает Promise, но без void будет тоже самое, но с warning
    void fetchTransactions();

    return () => {
      cancelled = true;
    };
  }, [page, pageSize, appliedFilters]);

  const handleRefresh = () => {
    setAppliedFilters({ ...draft });
    setPage(1);
  };

  const handlePageSizeChange = (value) => {
    const n = parseInt(value || '25', 10);
    setPageSize(Number.isFinite(n) ? n : 25);
    setPage(1);
  };

  const formattedDate = (v) => {
    if (v == null || v === '') return '—';
    const s = String(v);
    return s.length > 19 ? s.slice(0, 19).replace('T', ' ') : s;
  };

  useEffect(() => {
    if (!schedulePopup) return;
    const close = (e) => {
      if (schedulePopupRef.current && !schedulePopupRef.current.contains(e.target)) {
        setSchedulePopup(null);
      }
    };
    const t = window.setTimeout(() => {
      document.addEventListener('mousedown', close);
    }, 0);
    return () => {
      clearTimeout(t);
      document.removeEventListener('mousedown', close);
    };
  }, [schedulePopup]);

  useEffect(() => {
    if (!schedulePopup) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setSchedulePopup(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [schedulePopup]);

  const handleItemIdClick = async (e, itemId) => {
    if (itemId == null || itemId === '') return;
    e.preventDefault();
    e.stopPropagation();
    setSchedulePopup({
      x: e.clientX,
      y: e.clientY,
      itemId,
      loading: true,
      startDateTime: null,
      error: null,
    });
    try {
      const res = await fetch(`/api/admin/schedule-item/${encodeURIComponent(String(itemId))}`);
      const json = await res.json();
      if (!res.ok) {
        setSchedulePopup((p) =>
          p ? { ...p, loading: false, error: json.error || 'Ошибка загрузки' } : p
        );
        return;
      }
      setSchedulePopup((p) =>
        p ? { ...p, loading: false, startDateTime: json.StartDateTime ?? null } : p
      );
    } catch {
      setSchedulePopup((p) => (p ? { ...p, loading: false, error: 'Ошибка сети' } : p));
    }
  };

  return (
    <>
    <Stack gap="md">
      <Title order={2}>Транзакции</Title>

      <Card withBorder radius="lg" p="md">
        <Stack gap="sm">
          <Text fw={600} size="sm">
            Фильтры
          </Text>
          <Group grow align="flex-end">
            <TextInput
              label="Дата с"
              type="date"
              value={draft.dateFrom}
              onChange={(e) => setDraft((d) => ({ ...d, dateFrom: e.target.value }))}
            />
            <TextInput
              label="Дата по"
              type="date"
              value={draft.dateTo}
              onChange={(e) => setDraft((d) => ({ ...d, dateTo: e.target.value }))}
            />
            <TextInput
              label="Статус"
              placeholder="pending, succeeded…"
              value={draft.status}
              onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value }))}
            />
            <TextInput
              label="Type"
              placeholder="show…"
              value={draft.type}
              onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value }))}
            />
          </Group>
          <Group grow align="flex-end">
            <TextInput
              label="Телефон"
              placeholder="часть номера"
              value={draft.phone}
              onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
            />
            <TextInput
              label="Поиск по OrderAcquiringID"
              placeholder="uuid или часть"
              value={draft.orderSearch}
              onChange={(e) => setDraft((d) => ({ ...d, orderSearch: e.target.value }))}
            />
            <Button leftSection={<IconRefresh size={18} />} onClick={handleRefresh}>
              Обновить список
            </Button>
          </Group>
          <Text size="xs" c="dimmed">
            Нажмите «Обновить список», чтобы применить фильтры. Смена страницы и размера страницы подгружает данные с текущими применёнными фильтрами.
          </Text>
        </Stack>
      </Card>

      <Card withBorder radius="lg" p="md">
        <Group justify="space-between" mb="md" wrap="wrap">
          <Text size="sm" c="dimmed">
            Всего записей: {loading ? '…' : total}
          </Text>
          <Group gap="sm">
            <Text size="sm">На странице:</Text>
            <Select
              w={90}
              data={PAGE_SIZES}
              value={String(pageSize)}
              onChange={handlePageSizeChange}
            />
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
            <Table striped highlightOnHover withTableBorder withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>ID</Table.Th>
                  <Table.Th>OrderAcquiringID</Table.Th>
                  <Table.Th>Phone</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Amount</Table.Th>
                  <Table.Th>Type</Table.Th>
                  <Table.Th>ItemID</Table.Th>
                  <Table.Th>TicketCount</Table.Th>
                  <Table.Th>Info</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {rows.map((row) => (
                  <Table.Tr key={row.ID}>
                    <Table.Td>{row.ID}</Table.Td>
                    <Table.Td>
                      <Text size="xs" style={{ wordBreak: 'break-all', maxWidth: 220 }}>
                        {row.OrderAcquiringID}
                      </Text>
                    </Table.Td>
                    <Table.Td>{row.Phone}</Table.Td>
                    <Table.Td>{row.Status}</Table.Td>
                    <Table.Td>{formattedDate(row.Date)}</Table.Td>
                    <Table.Td>{row.Amount}</Table.Td>
                    <Table.Td>{row.Type}</Table.Td>
                    <Table.Td>
                      {row.ItemID != null && row.ItemID !== '' ? (
                        <button
                          type="button"
                          onClick={(e) => handleItemIdClick(e, row.ItemID)}
                          style={{
                            cursor: 'pointer',
                            backgroundColor: 'var(--mantine-color-green-1)',
                            color: 'var(--mantine-color-dark-9)',
                            fontWeight: 700,
                            border: 'none',
                            borderRadius: 6,
                            padding: '4px 10px',
                            font: 'inherit',
                          }}
                        >
                          {row.ItemID}
                        </button>
                      ) : (
                        '—'
                      )}
                    </Table.Td>
                    <Table.Td>{row.TicketCount}</Table.Td>
                    <Table.Td>
                      <Text size="xs" lineClamp={2}>
                        {row.Info || '—'}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>

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

    {mounted &&
      schedulePopup &&
      createPortal(
        <Paper
          ref={schedulePopupRef}
          shadow="md"
          p="sm"
          withBorder
          radius="md"
          style={{
            position: 'fixed',
            left: Math.min(
              schedulePopup.x + 10,
              typeof window !== 'undefined' ? window.innerWidth - 260 : schedulePopup.x
            ),
            top: Math.min(
              schedulePopup.y + 10,
              typeof window !== 'undefined' ? window.innerHeight - 160 : schedulePopup.y
            ),
            zIndex: 400,
            width: 280,
            pointerEvents: 'auto',
          }}
        >
          <Text size="xs" fw={600} mb={6}>
            Время начала мероприятия
          </Text>
          {schedulePopup.loading ? (
            <Group justify="center" py="xs">
              <Loader size="sm" />
            </Group>
          ) : schedulePopup.error ? (
            <Text size="sm" c="red">
              {schedulePopup.error}
            </Text>
          ) : (
            <Stack gap={6}>
              <Text size="sm">
                <Text component="span" fw={600}>
                  Дата:
                </Text>{' '}
                {formatScheduleStartForPopup(schedulePopup.startDateTime).datePart}
              </Text>
              <Text size="sm">
                <Text component="span" fw={600}>
                  Время:
                </Text>{' '}
                {formatScheduleStartForPopup(schedulePopup.startDateTime).timePart}
              </Text>
            </Stack>
          )}
        </Paper>,
        document.body
      )}
    </>
  );
}

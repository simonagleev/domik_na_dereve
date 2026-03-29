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
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import AdminTableScroll from '@/components/AdminShell/AdminTableScroll';
import { formatNaiveIrkutskForTransactionPopup } from '@/lib/irkutskTime';

const PAGE_SIZES = ['10', '25', '50', '100'];

const emptyFilters = {
  dateFrom: '',
  dateTo: '',
  status: '',
  type: '',
  phone: '',
  orderSearch: '',
};

export default function AdminTransactionsPage() {
  const [draft, setDraft] = useState(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  /** id строки, для которой идёт запрос «Проверить оплату» */
  const [checkingRowId, setCheckingRowId] = useState(null);

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

  const handleItemIdClick = async (e, itemId, txType) => {
    if (itemId == null || itemId === '') return;
    if (txType !== 'show' && txType !== 'workshop') return;
    e.preventDefault();
    e.stopPropagation();
    setSchedulePopup({
      x: e.clientX,
      y: e.clientY,
      itemId,
      loading: true,
      startDateTime: null,
      eventName: null,
      error: null,
    });
    try {
      const res = await fetch(
        `/api/admin/schedule-item/${encodeURIComponent(String(itemId))}?type=${encodeURIComponent(txType)}`
      );
      const json = await res.json();
      if (!res.ok) {
        setSchedulePopup((p) =>
          p ? { ...p, loading: false, error: json.error || 'Ошибка загрузки' } : p
        );
        return;
      }
      setSchedulePopup((p) =>
        p
          ? {
              ...p,
              loading: false,
              startDateTime: json.start_datetime ?? null,
              eventName: json.event_name ?? null,
            }
          : p
      );
    } catch {
      setSchedulePopup((p) => (p ? { ...p, loading: false, error: 'Ошибка сети' } : p));
    }
  };

  const handleCheckYooKassaPayment = async (row) => {
    const paymentId = row?.order_acquiring_id;
    if (!paymentId || String(paymentId).trim() === '') {
      notifications.show({ color: 'yellow', message: 'Нет order_acquiring_id для проверки' });
      return;
    }
    setCheckingRowId(row.id);
    try {
      const res = await fetch('/api/admin/refresh-yookassa-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: String(paymentId) }),
      });
      const json = await res.json();
      if (!res.ok) {
        notifications.show({
          color: 'red',
          title: 'Не удалось проверить',
          message: json.error || `Код ${res.status}`,
        });
        return;
      }
      if (json.updated) {
        notifications.show({
          color: 'green',
          message: `Статус обновлён: ${json.previousDbStatus} → ${json.ykStatus}`,
        });
        setRows((prev) =>
          prev.map((r) => (r.id === row.id ? { ...r, status: json.ykStatus } : r))
        );
      } else {
        notifications.show({
          color: 'gray',
          message: `Без изменений. В YooKassa: ${json.ykStatus} (в базе уже: ${json.previousDbStatus})`,
        });
      }
    } catch {
      notifications.show({ color: 'red', message: 'Ошибка сети' });
    } finally {
      setCheckingRowId(null);
    }
  };

  return (
    <>
    <Stack gap="md" w="100%" maw="100%">
      <Title order={2}>Транзакции</Title>

      <Card withBorder radius="lg" p="md" maw="100%" style={{ overflow: 'hidden' }}>
        <Stack gap="sm">
          <Text fw={600} size="sm">
            Фильтры
          </Text>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="sm">
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
          </SimpleGrid>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
            <TextInput
              label="Телефон"
              placeholder="часть номера"
              value={draft.phone}
              onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
            />
            <TextInput
              label="Поиск по order_acquiring_id"
              placeholder="uuid или часть"
              value={draft.orderSearch}
              onChange={(e) => setDraft((d) => ({ ...d, orderSearch: e.target.value }))}
            />
          </SimpleGrid>
          <Button
            leftSection={<IconRefresh size={18} />}
            onClick={handleRefresh}
            w={{ base: '100%', xs: 'auto' }}
            style={{ alignSelf: 'flex-start' }}
          >
            Обновить список
          </Button>
          <Text size="xs" c="dimmed">
            Нажмите «Обновить список», чтобы применить фильтры. Смена страницы и размера страницы подгружает данные с текущими применёнными фильтрами.
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
            <AdminTableScroll>
            <Table striped highlightOnHover withTableBorder withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>id</Table.Th>
                  <Table.Th>order_acquiring_id</Table.Th>
                  <Table.Th>phone</Table.Th>
                  <Table.Th>status</Table.Th>
                  <Table.Th>created_at</Table.Th>
                  <Table.Th>date</Table.Th>
                  <Table.Th>amount</Table.Th>
                  <Table.Th>type</Table.Th>
                  <Table.Th>item_id</Table.Th>
                  <Table.Th>ticket_count</Table.Th>
                  <Table.Th>info</Table.Th>
                  <Table.Th>child_name</Table.Th>
                  <Table.Th>client_name</Table.Th>
                  <Table.Th style={{ whiteSpace: 'nowrap' }}>YooKassa</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {rows.map((row) => (
                  <Table.Tr key={row.id}>
                    <Table.Td>{row.id}</Table.Td>
                    <Table.Td>
                      <Text size="xs" style={{ wordBreak: 'break-all', maxWidth: 220 }}>
                        {row.order_acquiring_id}
                      </Text>
                    </Table.Td>
                    <Table.Td>{row.phone}</Table.Td>
                    <Table.Td>{row.status}</Table.Td>
                    <Table.Td>{formattedDate(row.created_at)}</Table.Td>
                    <Table.Td>{formattedDate(row.date)}</Table.Td>
                    <Table.Td>{row.amount}</Table.Td>
                    <Table.Td>{row.type}</Table.Td>
                    <Table.Td>
                      {row.item_id != null && row.item_id !== '' && (row.type === 'show' || row.type === 'workshop') ? (
                        <button
                          type="button"
                          onClick={(e) => handleItemIdClick(e, row.item_id, row.type)}
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
                          {row.item_id}
                        </button>
                      ) : (
                        row.item_id ?? '—'
                      )}
                    </Table.Td>
                    <Table.Td>{row.ticket_count}</Table.Td>
                    <Table.Td>
                      <Text size="xs" lineClamp={2}>
                        {row.info || '—'}
                      </Text>
                    </Table.Td>
                    <Table.Td>{row.child_name ?? '—'}</Table.Td>
                    <Table.Td>{row.client_name ?? '—'}</Table.Td>
                    <Table.Td>
                      <Button
                        type="button"
                        variant="light"
                        size="xs"
                        loading={checkingRowId === row.id}
                        onClick={() => handleCheckYooKassaPayment(row)}
                      >
                        Проверить оплату
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                ))}
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
              typeof window !== 'undefined' ? window.innerWidth - 340 : schedulePopup.x
            ),
            top: Math.min(
              schedulePopup.y + 10,
              typeof window !== 'undefined' ? window.innerHeight - 220 : schedulePopup.y
            ),
            zIndex: 400,
            width: 320,
            maxWidth: 'min(320px, calc(100vw - 24px))',
            pointerEvents: 'auto',
          }}
        >
          <Text size="xs" fw={600} mb={6}>
            Мероприятие
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
              {schedulePopup.eventName ? (
                <Text size="sm" style={{ lineHeight: 1.35 }}>
                  <Text component="span" fw={600}>
                    Название:
                  </Text>{' '}
                  {schedulePopup.eventName}
                </Text>
              ) : null}
              <Text size="sm">
                <Text component="span" fw={600}>
                  Дата:
                </Text>{' '}
                {formatNaiveIrkutskForTransactionPopup(schedulePopup.startDateTime).datePart}
              </Text>
              <Text size="sm">
                <Text component="span" fw={600}>
                  Время:
                </Text>{' '}
                {formatNaiveIrkutskForTransactionPopup(schedulePopup.startDateTime).timePart}
              </Text>
            </Stack>
          )}
        </Paper>,
        document.body
      )}
    </>
  );
}

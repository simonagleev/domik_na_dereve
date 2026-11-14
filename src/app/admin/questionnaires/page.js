'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Group,
  Loader,
  Modal,
  NumberInput,
  Stack,
  Table,
  Tabs,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCopy, IconFileTypePdf, IconLock, IconLockOpen, IconPlus, IconTrash } from '@tabler/icons-react';
import AdminTableScroll from '@/components/AdminShell/AdminTableScroll';
import { normalizeRuPhoneInput } from '@/lib/phoneInput';
import {
  formatTimestamptzIrkutskDateTime,
  formatTimestamptzIrkutskDate,
  irkutskDatePlusMonthsDateString,
  irkutskDateInputToTimestamptzIso,
} from '@/lib/irkutskTime';
import {
  QUESTIONNAIRE_TYPES,
  QUESTIONNAIRE_STATUS,
  QUESTIONNAIRE_STATUS_COLORS,
  getQuestionnaireType,
  getQuestionnaireFields,
  getQuestionnaireConditionalFields,
  questionnaireLink,
  computeQuestionnaireStatus,
  computeQuestionnaireProgress,
} from '@/lib/questionnaireTypes';
import { achievementYearLabel, BIRTHDAY_TYPE } from '@/lib/birthdayAnketa';
import { SANTA_TYPE } from '@/lib/santaAnketa';
import { downloadQuestionnairePdf } from '@/lib/questionnairePdf';

const LIST_LIMIT = 200;

/** Дата YYYY-MM-DD из timestamptz (календарь Иркутска) - для input type="date". */
function timestamptzToDateInputValue(v) {
  if (!v) return '';
  const s = formatTimestamptzIrkutskDate(v);
  if (s === '-') return '';
  const [d, m, y] = s.split('.');
  return `${y}-${m}-${d}`;
}

function defaultExpiresAt() {
  return irkutskDatePlusMonthsDateString(3);
}

function isRowExpired(row) {
  if (!row?.expires_at) return false;
  return new Date(row.expires_at).getTime() <= Date.now();
}

async function adminCrud(method, body) {
  const res = await fetch('/api/admin/postgres', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Ошибка запроса');
  return json;
}

function answersOf(row) {
  return row?.payload?.answers && typeof row.payload.answers === 'object' ? row.payload.answers : {};
}

function achievementsOf(row) {
  return Array.isArray(row?.payload?.achievements) ? row.payload.achievements : [];
}

function rowDetailColumn(row) {
  const answers = answersOf(row);
  if (row.type === BIRTHDAY_TYPE) return answers.birthdayDate || '-';
  if (row.type === SANTA_TYPE) {
    const age = String(answers.age ?? '').trim();
    return age || '-';
  }
  return '-';
}

/** Модалка создания анкеты. После создания возвращает строку со ссылкой. */
function CreateQuestionnaireModal({ opened, type, onClose, onCreated }) {
  const typeConfig = getQuestionnaireType(type);
  const [childName, setChildName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [yearsCount, setYearsCount] = useState(7);
  const [birthdayDate, setBirthdayDate] = useState('');
  const [expiresAt, setExpiresAt] = useState(defaultExpiresAt);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (opened) {
      setChildName('');
      setPhone('');
      setEmail('');
      setYearsCount(7);
      setBirthdayDate('');
      setExpiresAt(defaultExpiresAt());
      setSaving(false);
    }
  }, [opened]);

  const handleCreate = async () => {
    if (!expiresAt) {
      notifications.show({ color: 'red', title: 'Укажите срок действия анкеты' });
      return;
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      notifications.show({ color: 'red', title: 'Некорректный email' });
      return;
    }
    setSaving(true);
    try {
      const insertData = {
        type,
        child_name: childName.trim() || null,
        phone: phone.trim() || null,
        email: email.trim() || null,
        years_count: Number(yearsCount) || 7,
        expires_at: irkutskDateInputToTimestamptzIso(expiresAt),
      };
      if (type === BIRTHDAY_TYPE && birthdayDate.trim()) {
        insertData.payload = {
          answers: { birthdayDate: birthdayDate.trim() },
          achievements: [],
        };
      }

      const { data } = await adminCrud('POST', {
        table: 'questionnaires',
        data: insertData,
      });
      notifications.show({ color: 'green', title: 'Анкета создана', message: 'Ссылка готова к копированию' });
      onCreated(data);
      onClose();
    } catch (e) {
      notifications.show({ color: 'red', title: 'Не удалось создать анкету', message: e.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={`Новая анкета: ${typeConfig?.label ?? type}`}>
      <Stack gap="sm">
        <TextInput
          label="Имя ребёнка"
          placeholder="Необязательно, подтянется из анкеты"
          value={childName}
          onChange={(e) => setChildName(e.target.value)}
        />
        <TextInput
          label="Телефон"
          placeholder="+7XXXXXXXXXX"
          maxLength={12}
          value={phone}
          onChange={(e) => setPhone(normalizeRuPhoneInput(e.target.value))}
        />
        <TextInput
          label="Email"
          type="email"
          placeholder="Необязательно"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {type === BIRTHDAY_TYPE ? (
          <TextInput
            label="Дата дня рождения"
            description="Необязательно, родители смогут изменить в анкете"
            type="date"
            value={birthdayDate}
            onChange={(e) => setBirthdayDate(e.target.value)}
          />
        ) : null}
        {typeConfig?.hasAchievements ? (
          <NumberInput
            label="Количество лет (достижения)"
            description="Сколько полей «N-й год» будет в анкете"
            min={1}
            max={21}
            value={yearsCount}
            onChange={(v) => setYearsCount(Number(v) || 7)}
          />
        ) : null}
        <TextInput
          label="Срок действия анкеты"
          type="date"
          required
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
        />
        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleCreate} loading={saving} leftSection={<IconPlus size={16} />}>
            Создать
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

/** Модалка просмотра ответов анкеты. */
function ViewQuestionnaireModal({ row, onClose, onChanged }) {
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (row) {
      setPhone(row.phone || '');
      setEmail(row.email || '');
      setExpiresAt(timestamptzToDateInputValue(row.expires_at));
      setSaving(false);
    }
  }, [row]);

  if (!row) return null;

  const answers = answersOf(row);
  const achievements = achievementsOf(row);
  const fields = [
    ...(getQuestionnaireFields(row.type) ?? []),
    ...getQuestionnaireConditionalFields(row.type).filter((f) => f.when(answers)),
  ];
  const progress = computeQuestionnaireProgress(row);
  const status = computeQuestionnaireStatus(row);
  const typeConfig = getQuestionnaireType(row.type);

  const handleSaveMeta = async () => {
    if (!expiresAt) {
      notifications.show({ color: 'red', title: 'Укажите срок действия анкеты' });
      return;
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      notifications.show({ color: 'red', title: 'Некорректный email' });
      return;
    }
    setSaving(true);
    try {
      await adminCrud('PATCH', {
        table: 'questionnaires',
        data: {
          phone: phone.trim() || null,
          email: email.trim() || null,
          expires_at: irkutskDateInputToTimestamptzIso(expiresAt),
        },
        where: { id: row.id },
      });
      notifications.show({ color: 'green', title: 'Сохранено' });
      onChanged();
      onClose();
    } catch (e) {
      notifications.show({ color: 'red', title: 'Не удалось сохранить', message: e.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      opened={!!row}
      onClose={onClose}
      title={`Анкета #${row.id}${row.child_name ? ` - ${row.child_name}` : ''}`}
      size="lg"
    >
      <Stack gap="sm">
        <Group gap="sm">
          <Badge color={QUESTIONNAIRE_STATUS_COLORS[status]}>{QUESTIONNAIRE_STATUS[status]}</Badge>
          <Text size="sm" c="dimmed">
            Заполнено полей: {progress.filled} из {progress.total}. Создана:{' '}
            {formatTimestamptzIrkutskDateTime(row.created_at)} (Иркутск).
          </Text>
        </Group>

        <Table withTableBorder withColumnBorders>
          <Table.Tbody>
            {fields.map((f) => (
              <Table.Tr key={f.key}>
                <Table.Td style={{ width: '45%' }}>
                  <Text size="sm" fw={600}>
                    {f.label}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{String(answers[f.key] ?? '').trim() || '-'}</Text>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>

        {typeConfig?.hasAchievements && achievements.length ? (
          <>
            <Text fw={600} size="sm">
              Главные достижения каждого года
            </Text>
            <Table withTableBorder withColumnBorders>
              <Table.Tbody>
                {achievements.map((text, i) => (
                  <Table.Tr key={i}>
                    <Table.Td style={{ width: '45%' }}>
                      <Text size="sm" fw={600}>
                        {achievementYearLabel(i + 1)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{String(text ?? '').trim() || '-'}</Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </>
        ) : null}

        <Group grow>
          <TextInput
            label="Телефон"
            placeholder="+7XXXXXXXXXX"
            maxLength={12}
            value={phone}
            onChange={(e) => setPhone(normalizeRuPhoneInput(e.target.value))}
          />
          <TextInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <TextInput
            label="Открыта до"
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
          />
        </Group>

        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={onClose}>
            Закрыть
          </Button>
          <Button onClick={handleSaveMeta} loading={saving}>
            Сохранить
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

export default function AdminQuestionnairesPage() {
  const [activeType, setActiveType] = useState(QUESTIONNAIRE_TYPES[0]?.type ?? '');

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [createOpened, setCreateOpened] = useState(false);
  const [viewRow, setViewRow] = useState(null);
  const [createdLink, setCreatedLink] = useState('');

  const load = useCallback(async () => {
    if (!activeType) return;
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        table: 'questionnaires',
        where: JSON.stringify({ type: activeType }),
        limit: String(LIST_LIMIT),
        orderBy: 'created_at',
        orderDir: 'desc',
      });
      const res = await fetch(`/api/admin/postgres?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Ошибка загрузки');
      setRows(Array.isArray(json.data) ? json.data : []);
    } catch (e) {
      setError(e.message || 'Ошибка загрузки');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [activeType]);

  useEffect(() => {
    void load();
  }, [load]);

  const copyLink = async (token) => {
    const url = `${window.location.origin}${questionnaireLink(token)}`;
    try {
      await navigator.clipboard.writeText(url);
      notifications.show({ color: 'green', title: 'Ссылка скопирована', message: url });
    } catch {
      notifications.show({ color: 'yellow', title: 'Скопируйте вручную', message: url });
    }
  };

  const handleClose = async (row) => {
    if (!window.confirm(`Закрыть анкету #${row.id}? По ссылке её больше нельзя будет редактировать.`)) return;
    try {
      await adminCrud('PATCH', {
        table: 'questionnaires',
        data: { closed_at: new Date().toISOString() },
        where: { id: row.id },
      });
      notifications.show({ color: 'green', title: `Анкета #${row.id} закрыта` });
      void load();
    } catch (e) {
      notifications.show({ color: 'red', title: 'Не удалось закрыть анкету', message: e.message });
    }
  };

  const handleOpen = async (row) => {
    const expired = isRowExpired(row);
    const ok = window.confirm(
      expired
        ? `Анкета #${row.id} просрочена - при открытии срок продлится на 3 месяца. Открыть?`
        : `Открыть анкету #${row.id} для редактирования по ссылке?`
    );
    if (!ok) return;
    try {
      const data = { closed_at: null };
      if (expired) {
        data.expires_at = irkutskDateInputToTimestamptzIso(irkutskDatePlusMonthsDateString(3));
      }
      await adminCrud('PATCH', { table: 'questionnaires', data, where: { id: row.id } });
      notifications.show({
        color: 'green',
        title: `Анкета #${row.id} открыта`,
        message: expired ? 'Срок продлён на 3 месяца' : undefined,
      });
      void load();
    } catch (e) {
      notifications.show({ color: 'red', title: 'Не удалось открыть анкету', message: e.message });
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Удалить анкету #${row.id}${row.child_name ? ` (${row.child_name})` : ''}?`)) return;
    try {
      await adminCrud('DELETE', { table: 'questionnaires', where: { id: row.id } });
      notifications.show({ color: 'green', title: `Анкета #${row.id} удалена` });
      void load();
    } catch (e) {
      notifications.show({ color: 'red', title: 'Не удалось удалить', message: e.message });
    }
  };

  return (
    <Stack gap="md" w="100%" maw="100%">
      <Group justify="space-between" wrap="wrap">
        <Title order={2}>Анкеты</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={() => setCreateOpened(true)}>
          Создать анкету
        </Button>
      </Group>

      <Tabs value={activeType} onChange={(v) => setActiveType(v ?? activeType)}>
        <Tabs.List>
          {QUESTIONNAIRE_TYPES.map((t) => (
            <Tabs.Tab key={t.type} value={t.type}>
              {t.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs>

      {createdLink ? (
        <Card withBorder radius="lg" p="md">
          <Group justify="space-between" wrap="wrap">
            <Text size="sm" style={{ wordBreak: 'break-all' }}>
              Новая ссылка: {createdLink}
            </Text>
            <Button
              size="compact-sm"
              variant="light"
              leftSection={<IconCopy size={14} />}
              onClick={() => copyLink(createdLink.split('/').pop())}
            >
              Копировать
            </Button>
          </Group>
        </Card>
      ) : null}

      <Card withBorder radius="lg" p="md" maw="100%" style={{ overflow: 'hidden' }}>
        <Group justify="space-between" mb="md" wrap="wrap">
          <Text size="sm" c="dimmed">
            Всего: {loading ? '…' : rows.length}
            {rows.length >= LIST_LIMIT ? ` (показаны первые ${LIST_LIMIT})` : ''}
          </Text>
          <Button variant="light" onClick={() => void load()}>
            Обновить
          </Button>
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
                    <Table.Th>Имя ребёнка</Table.Th>
                    <Table.Th>Телефон</Table.Th>
                    <Table.Th>{activeType === SANTA_TYPE ? 'Возраст' : 'Дата дня рождения'}</Table.Th>
                    <Table.Th>Статус</Table.Th>
                    <Table.Th>Создана</Table.Th>
                    <Table.Th>Открыта до</Table.Th>
                    <Table.Th>Ссылка</Table.Th>
                    <Table.Th>Действия</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {rows.map((row) => {
                    const expired = isRowExpired(row);
                    const status = computeQuestionnaireStatus(row);
                    return (
                      <Table.Tr
                        key={String(row.id)}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setViewRow(row)}
                      >
                        <Table.Td>{row.id}</Table.Td>
                        <Table.Td>{row.child_name ?? '-'}</Table.Td>
                        <Table.Td>{row.phone ?? '-'}</Table.Td>
                        <Table.Td>{rowDetailColumn(row)}</Table.Td>
                        <Table.Td>
                          <Badge color={QUESTIONNAIRE_STATUS_COLORS[status]}>
                            {QUESTIONNAIRE_STATUS[status]}
                          </Badge>
                        </Table.Td>
                        <Table.Td>{formatTimestamptzIrkutskDateTime(row.created_at)}</Table.Td>
                        <Table.Td>
                          <Text size="sm" c={expired ? 'red' : undefined}>
                            {formatTimestamptzIrkutskDate(row.expires_at)}
                            {expired ? ' (истёк)' : ''}
                          </Text>
                        </Table.Td>
                        <Table.Td onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="compact-xs"
                            variant="light"
                            leftSection={<IconCopy size={12} />}
                            onClick={() => copyLink(row.token)}
                          >
                            Копировать
                          </Button>
                        </Table.Td>
                        <Table.Td onClick={(e) => e.stopPropagation()}>
                          <Group gap="xs" wrap="nowrap">
                            <Button
                              size="compact-xs"
                              variant="subtle"
                              color="blue"
                              leftSection={<IconFileTypePdf size={14} />}
                              onClick={() => downloadQuestionnairePdf(row)}
                            >
                              PDF
                            </Button>
                            {status === 'closed' ? (
                              <Button
                                size="compact-xs"
                                variant="subtle"
                                color="green"
                                leftSection={<IconLockOpen size={14} />}
                                onClick={() => void handleOpen(row)}
                              >
                                Открыть
                              </Button>
                            ) : (
                              <Button
                                size="compact-xs"
                                variant="subtle"
                                color="orange"
                                leftSection={<IconLock size={14} />}
                                onClick={() => void handleClose(row)}
                              >
                                Закрыть
                              </Button>
                            )}
                            <Button
                              size="compact-xs"
                              variant="subtle"
                              color="red"
                              leftSection={<IconTrash size={14} />}
                              onClick={() => void handleDelete(row)}
                            >
                              Удалить
                            </Button>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            </AdminTableScroll>

            {rows.length === 0 && !loading ? (
              <Text c="dimmed" ta="center" py="md">
                Анкет этого вида пока нет
              </Text>
            ) : null}
          </>
        )}
      </Card>

      <CreateQuestionnaireModal
        opened={createOpened}
        type={activeType}
        onClose={() => setCreateOpened(false)}
        onCreated={(data) => {
          setCreatedLink(`${window.location.origin}${questionnaireLink(data.token)}`);
          void load();
        }}
      />

      <ViewQuestionnaireModal
        row={viewRow}
        onClose={() => setViewRow(null)}
        onChanged={() => void load()}
      />
    </Stack>
  );
}

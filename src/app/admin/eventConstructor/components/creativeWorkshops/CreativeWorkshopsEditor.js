'use client';

import { useEffect, useState } from 'react';
import { Button, Group, Loader, Stack, Text } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import AdminCwCard from './AdminCwCard';
import { useCreativeWorkshopsEventConstructorStore } from './store/creativeWorkshopsEventConstructorStore';
import cardsStyles from '@/app/creativeWorkshops/components/cards/cards.module.css';
import styles from './adminCw.module.css';

export default function CreativeWorkshopsEditor({ title }) {
  const rows = useCreativeWorkshopsEventConstructorStore((s) => s.rows);
  const loading = useCreativeWorkshopsEventConstructorStore((s) => s.loading);
  const savingIds = useCreativeWorkshopsEventConstructorStore((s) => s.savingIds);
  const load = useCreativeWorkshopsEventConstructorStore((s) => s.load);
  const create = useCreativeWorkshopsEventConstructorStore((s) => s.create);
  const updateFields = useCreativeWorkshopsEventConstructorStore((s) => s.updateFields);
  const reorder = useCreativeWorkshopsEventConstructorStore((s) => s.reorder);

  const [dragId, setDragId] = useState(null);
  const [overId, setOverId] = useState(null);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Stack gap="md">
      <Group justify="space-between" align="flex-start" wrap="wrap" gap="sm">
        <div>
          <Text fw={600}>{title}</Text>
          <p className={styles.hint}>
            Карточки выглядят как на сайте. Клик по тексту или фото — правка. Перетащите за ⋮⋮, чтобы
            поменять порядок. Скрытая карточка не показывается посетителям.
          </p>
        </div>
        <Button leftSection={<IconPlus size={16} />} onClick={() => void create()} style={{ flexShrink: 0 }}>
          Добавить мастерскую
        </Button>
      </Group>

      {loading ? (
        <Group justify="center" py="xl">
          <Loader size="sm" />
          <Text size="sm" c="dimmed">
            Загрузка…
          </Text>
        </Group>
      ) : rows.length === 0 ? (
        <Text size="sm" c="dimmed">
          Пока нет карточек. Нажмите «Добавить мастерскую».
        </Text>
      ) : (
        <div className={cardsStyles.CwCards_container}>
          {rows.map((row) => (
            <AdminCwCard
              key={row.id}
              row={row}
              saving={Boolean(savingIds[String(row.id)])}
              dragging={dragId != null && String(dragId) === String(row.id)}
              dropTarget={overId != null && String(overId) === String(row.id) && String(dragId) !== String(row.id)}
              onUpdate={(patch) => updateFields(row.id, patch)}
              onDragStart={(e, id) => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', String(id));
                setDragId(id);
              }}
              onDragOver={(e, id) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                setOverId(id);
              }}
              onDrop={(e, id) => {
                e.preventDefault();
                const fromId = e.dataTransfer.getData('text/plain') || dragId;
                setOverId(null);
                setDragId(null);
                if (fromId) void reorder(fromId, id);
              }}
              onDragEnd={() => {
                setDragId(null);
                setOverId(null);
              }}
            />
          ))}
        </div>
      )}
    </Stack>
  );
}

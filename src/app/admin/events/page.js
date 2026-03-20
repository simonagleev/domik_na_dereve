'use client';

import { useState } from 'react';
import { Button, Card, Group, Image, Select, Stack, Text, Title } from '@mantine/core';

export default function AdminEventsPage() {
  const [file, setFile] = useState(null);
  const [folder, setFolder] = useState('shows');
  const [loading, setLoading] = useState(false);
  const [imagePath, setImagePath] = useState('');
  const [error, setError] = useState('');

  const handleUpload = async () => {
    if (!file) {
      setError('Сначала выбери файл');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Ошибка загрузки');
        return;
      }

      setImagePath(data.imagePath);
    } catch {
      setError('Ошибка сети или сервера');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack gap="md">
      <Card withBorder radius="lg" p="lg">
        <Title order={2} mb="sm">Мероприятия</Title>
        <Text c="dimmed" mb="md">
          Тестовый загрузчик изображения на сервер. Результат (`imagePath`) сохраняй в таблицу мероприятия.
        </Text>

        <Stack gap="sm">
          <Select
            label="Тип папки"
            value={folder}
            onChange={(value) => setFolder(value || 'shows')}
            data={[
              { value: 'shows', label: 'Шоу' },
              { value: 'creative_workshops', label: 'Творческие мастерские' },
              { value: 'birthdays', label: 'Дни рождения' },
              { value: 'common', label: 'Общее' },
            ]}
          />

          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />

          <Group>
            <Button onClick={handleUpload} loading={loading}>
              Загрузить
            </Button>
          </Group>

          {error ? <Text c="red">{error}</Text> : null}

          {imagePath ? (
            <>
              <Text size="sm">Путь для БД: {imagePath}</Text>
              <Image src={imagePath} alt="preview" w={240} radius="md" />
            </>
          ) : null}
        </Stack>
      </Card>
    </Stack>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Button,
  Card,
  Container,
  Group,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Ошибка входа');
        return;
      }
      router.push('/admin');
    } catch (err) {
      setError('Ошибка сети или сервера. Попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size={460} py={48}>
      <Card withBorder radius="lg" padding="lg" shadow="sm">
        <Stack gap="md">
          <Title order={2}>Вход в админку</Title>
          <Text c="dimmed" size="sm">
            Введите ваш email и пароль администратора
          </Text>
          {error && (
            <Alert color="red" icon={<IconAlertCircle size={16} />} title="Ошибка входа">
              {error}
            </Alert>
          )}
          <form onSubmit={handleLogin}>
            <Stack gap="sm">
              <TextInput
                type="email"
                label="Email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                required
              />
              <PasswordInput
                label="Пароль"
                placeholder="Введите пароль"
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                required
              />
              <Group justify="flex-end" mt={8}>
                <Button type="submit" loading={loading}>
                  Войти
                </Button>
              </Group>
            </Stack>
          </form>
        </Stack>
      </Card>
    </Container>
  );
}
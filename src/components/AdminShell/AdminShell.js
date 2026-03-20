'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  AppShell,
  Button,
  Group,
  Loader,
  NavLink,
  Stack,
  Text,
  Title,
} from '@mantine/core';

const navItems = [
  { href: '/admin', label: 'Главная' },
  { href: '/admin/schedule', label: 'Расписание' },
  { href: '/admin/events', label: 'Мероприятия' },
  { href: '/admin/transactions', label: 'Транзакции' },
  { href: '/admin/logs', label: 'Логи' },
  { href: '/admin/users', label: 'Пользователи' },
];

export default function AdminShell({ children }) {
  const pathname = usePathname() || '';
  const router = useRouter();
  const isLoginPage = pathname === '/admin/login';
  const [checking, setChecking] = useState(!isLoginPage);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (isLoginPage) {
      setChecking(false);
      return;
    }

    const checkAccess = async () => {
      const res = await fetch('/api/admin/me');
      if (!res.ok) {
        router.replace('/admin/login');
        return;
      }
      const data = await res.json();
      setUser(data.user);
      setChecking(false);
    };

    checkAccess();
  }, [isLoginPage, router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } finally {
      router.replace('/admin/login');
    }
  };

  if (isLoginPage) {
    return children;
  }

  if (checking) {
    return (
      <Group justify="center" py={40}>
        <Loader />
        <Text>Проверка прав доступа...</Text>
      </Group>
    );
  }

  return (
    <AppShell
      header={{ height: 64 }}
      navbar={{ width: 260, breakpoint: 'sm' }}
      padding="md"
      bg="gray.0"
    >
      <AppShell.Header p="md">
        <Group justify="space-between" h="100%">
          <Title order={4}>Панель администратора</Title>
          <Group gap="sm">
            <Text size="sm" c="dimmed">
              {user?.email}
            </Text>
            <Button variant="light" color="green" onClick={handleLogout}>
              Выйти
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack gap="xs">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              label={item.label}
              component={Link}
              href={item.href}
              active={pathname === item.href || pathname.startsWith(`${item.href}/`)}
            />
          ))}
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}

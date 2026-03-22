'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useDisclosure } from '@mantine/hooks';
import {
  AppShell,
  Burger,
  Button,
  Drawer,
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
  { href: '/admin/eventConstructor', label: 'Конструктор мероприятий' },
  { href: '/admin/transactions', label: 'Транзакции' },
  { href: '/admin/requests', label: 'Заявки' },
  { href: '/admin/logs', label: 'Логи' },
  { href: '/admin/users', label: 'Пользователи' },
];

function AdminNavLinks({ pathname, onItemClick }) {
  return (
    <Stack gap="xs">
      {navItems.map((item) => (
        <NavLink
          key={item.href}
          label={item.label}
          component={Link}
          href={item.href}
          active={pathname === item.href || pathname.startsWith(`${item.href}/`)}
          onClick={onItemClick}
        />
      ))}
    </Stack>
  );
}

export default function AdminShell({ children }) {
  const pathname = usePathname() || '';
  const router = useRouter();
  const isLoginPage = pathname === '/admin/login';
  const [checking, setChecking] = useState(!isLoginPage);
  const [user, setUser] = useState(null);

  const [mobileMenuOpened, { toggle: toggleMobileMenu, close: closeMobileMenu }] = useDisclosure(false);

  useEffect(() => {
    closeMobileMenu();
  }, [pathname, closeMobileMenu]);

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
      style={{width: '100%'}}
    >
      <AppShell.Header p="md">
        <Group justify="space-between" h="100%" wrap="nowrap" gap="sm">
          <Group gap="sm" wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
            <Burger
              opened={mobileMenuOpened}
              onClick={toggleMobileMenu}
              size="sm"
              hiddenFrom="sm"
              aria-label="Открыть меню"
            />
            <Title
              order={4}
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              Панель администратора
            </Title>
          </Group>
          <Group gap="sm" wrap="nowrap">
            <Text size="sm" c="dimmed" visibleFrom="sm" maw={220} style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email}
            </Text>
            <Button variant="light" color="green" onClick={handleLogout} size="sm">
              Выйти
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md" visibleFrom="sm">
        <AdminNavLinks pathname={pathname} />
      </AppShell.Navbar>

      <Drawer
        opened={mobileMenuOpened}
        onClose={closeMobileMenu}
        position="left"
        size={280}
        padding="md"
        title="Разделы"
        hiddenFrom="sm"
        zIndex={1000}
        closeButtonProps={{ 'aria-label': 'Закрыть меню' }}
      >
        <AdminNavLinks pathname={pathname} onItemClick={closeMobileMenu} />
      </Drawer>

      <AppShell.Main maw="100%" style={{ minWidth: 0 }}>
        {children}
      </AppShell.Main>
    </AppShell>
  );
}

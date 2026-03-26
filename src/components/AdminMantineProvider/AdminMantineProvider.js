'use client';
// Ui библиотека провайдер для админки
import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

const theme = createTheme({
  primaryColor: 'green',
  fontFamily: 'Manrope, sans-serif',
  defaultRadius: 'md',
});

export default function AdminMantineProvider({ children }) {
  return (
    <MantineProvider theme={theme}>
      <Notifications position="top-right" />
      {children}
    </MantineProvider>
  );
}

'use client';

import { Box } from '@mantine/core';

/**
 * Горизонтальный скролл для широких таблиц на узких экранах.
 * Целевой table внутри не сжимается ниже естественной ширины колонок.
 */
export default function AdminTableScroll({ children }) {
  return (
    <Box
      w="100%"
      maw="100%"
      style={{
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}
      sx={{
        '& table': {
          minWidth: 'max-content',
        },
      }}
    >
      {children}
    </Box>
  );
}

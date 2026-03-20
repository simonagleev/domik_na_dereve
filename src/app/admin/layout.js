import AdminMantineProvider from '@/components/AdminMantineProvider/AdminMantineProvider';
import AdminShell from '@/components/AdminShell/AdminShell';

export default function AdminLayout({ children }) {
  return (
    <AdminMantineProvider>
      <AdminShell>
        {children}
      </AdminShell>
    </AdminMantineProvider>
  );
}

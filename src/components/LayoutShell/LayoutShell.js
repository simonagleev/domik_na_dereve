'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header/Header';
import FooterTree from '@/components/FooterTree/FooterTree';
import Footer from '@/components/Footer/Footer';
import FeedbackToastHost from '@/components/FeedbackToastHost/FeedbackToastHost';

export default function LayoutShell({ children }) {
  const pathname = usePathname() || '';
  const isAdminRoute = pathname.startsWith('/admin');

  return (
    <>
      {!isAdminRoute && <Header />}
      <main>{children}</main>
      {!isAdminRoute && <FooterTree />}
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <FeedbackToastHost />}
    </>
  );
}

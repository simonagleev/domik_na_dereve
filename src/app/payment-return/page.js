'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const STORAGE_KEY = 'yookassa_pending_payment_id';

export default function PaymentReturnPage() {
  const router = useRouter();

  useEffect(() => {
    const id = typeof window !== 'undefined' ? sessionStorage.getItem(STORAGE_KEY) : null;
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(STORAGE_KEY);
    }

    if (!id) {
      router.replace('/');
      return;
    }

    fetch('/api/yookassa-sync-payment-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId: id }),
    }).catch((e) => console.error('[payment-return] sync', e)).finally(() => {
      router.replace('/');
    });
  }, [router]);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      Возвращаем вас на сайт…
    </div>
  );
}

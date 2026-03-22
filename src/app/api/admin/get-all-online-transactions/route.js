import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAdminPayload } from '@/lib/adminAuth';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const ALLOWED_PAGE_SIZES = [10, 25, 50, 100];

export async function GET(request) {
  if (!getAdminPayload(request)) {
    return NextResponse.json({ error: 'Нет доступа' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  let pageSize = parseInt(searchParams.get('pageSize') || '25', 10) || 25;
  if (!ALLOWED_PAGE_SIZES.includes(pageSize)) {
    pageSize = 25;
  }

  const dateFrom = searchParams.get('dateFrom')?.trim() || '';
  const dateTo = searchParams.get('dateTo')?.trim() || '';
  const status = searchParams.get('status')?.trim() || '';
  const type = searchParams.get('type')?.trim() || '';
  const phone = searchParams.get('phone')?.trim() || '';
  const orderSearch = searchParams.get('orderSearch')?.trim() || '';

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase.from('onlineTransactions').select('*', { count: 'exact' });

  if (dateFrom) {
    query = query.gte('Date', `${dateFrom}T00:00:00`);
  }
  if (dateTo) {
    query = query.lte('Date', `${dateTo}T23:59:59.999`);
  }
  if (status) {
    query = query.eq('Status', status);
  }
  if (type) {
    query = query.eq('Type', type);
  }
  if (phone) {
    query = query.ilike('Phone', `%${phone}%`);
  }
  if (orderSearch) {
    query = query.ilike('OrderAcquiringID', `%${orderSearch}%`);
  }

  const { data, error, count } = await query.order('Date', { ascending: false }).range(from, to);

  if (error) {
    console.error('get-all-online-transactions', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data: data ?? [],
    total: count ?? 0,
    page,
    pageSize,
  });
}

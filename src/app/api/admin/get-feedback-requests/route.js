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
  const phone = searchParams.get('phone')?.trim() || '';
  const type = searchParams.get('type')?.trim() || '';

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase.from('feedbackRequests').select('*', { count: 'exact' });

  if (dateFrom) {
    query = query.gte('CreatedAt', `${dateFrom}T00:00:00`);
  }
  if (dateTo) {
    query = query.lte('CreatedAt', `${dateTo}T23:59:59.999`);
  }
  if (phone) {
    query = query.ilike('Phone', `%${phone}%`);
  }
  if (type) {
    query = query.eq('Type', type);
  }

  const [{ data, error, count }, typesRes] = await Promise.all([
    query.order('CreatedAt', { ascending: false }).range(from, to),
    supabase.from('feedbackRequestTypes').select('id, Type, Name').order('id', { ascending: true }),
  ]);

  if (error) {
    console.error('get-feedback-requests', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (typesRes.error) {
    console.error('get-feedback-requests types', typesRes.error);
    return NextResponse.json({ error: typesRes.error.message }, { status: 500 });
  }

  return NextResponse.json({
    data: data ?? [],
    total: count ?? 0,
    page,
    pageSize,
    types: typesRes.data ?? [],
  });
}

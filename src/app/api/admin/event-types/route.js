import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAdminPayload } from '@/lib/adminAuth';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function GET(request) {
  if (!getAdminPayload(request)) {
    return NextResponse.json({ error: 'Нет доступа' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('eventTypes')
    .select('ID, Name, IsActive, Order, TechName')
    .eq('IsActive', true)
    .order('Order', { ascending: true });

  if (error) {
    console.error('eventTypes', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

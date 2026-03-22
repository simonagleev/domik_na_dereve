import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAdminPayload } from '@/lib/adminAuth';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function GET(request, { params }) {
  if (!getAdminPayload(request)) {
    return NextResponse.json({ error: 'Нет доступа' }, { status: 401 });
  }

  const id = params?.id;
  const numericId = Number(id);
  if (id == null || id === '' || Number.isNaN(numericId)) {
    return NextResponse.json({ error: 'Некорректный ID' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('schedule')
    .select('StartDateTime')
    .eq('ID', numericId)
    .maybeSingle();

  if (error) {
    console.error('schedule-item', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: 'Запись в расписании не найдена' }, { status: 404 });
  }

  return NextResponse.json({ StartDateTime: data.StartDateTime });
}

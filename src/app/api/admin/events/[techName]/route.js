import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAdminPayload } from '@/lib/adminAuth';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

/** Пока список/запись реализованы только для shows */
const SUPPORTED_LIST = new Set(['shows']);

export async function GET(request, { params }) {
  if (!getAdminPayload(request)) {
    return NextResponse.json({ error: 'Нет доступа' }, { status: 401 });
  }

  const techName = params?.techName;
  if (!techName || !SUPPORTED_LIST.has(techName)) {
    return NextResponse.json([]);
  }

  const { data, error } = await supabase.from(techName).select('*').order('ID', { ascending: true });

  if (error) {
    console.error(`GET events/${techName}`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

export async function POST(request, { params }) {
  if (!getAdminPayload(request)) {
    return NextResponse.json({ error: 'Нет доступа' }, { status: 401 });
  }

  const techName = params?.techName;
  if (techName !== 'shows') {
    return NextResponse.json({ error: 'Создание пока только для shows' }, { status: 400 });
  }

  const body = await request.json();

  const row = {
    Name: body.Name ?? '',
    Price: body.Price ?? 0,
    MaxTikets: body.MaxTikets ?? 0,
    Description: body.Description ?? null,
    Comments: body.Comments ?? null,
    ImageName: body.ImageName ?? null,
    ImagePath: body.ImagePath ?? null,
    Age: body.Age ?? null,
    Duration: body.Duration ?? null,
  };

  const { data, error } = await supabase.from('shows').insert(row).select().single();

  if (error) {
    console.error('POST shows', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
